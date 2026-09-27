import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { AuthError, requireAdmin, requireRole } from "./model/auth";

const adminContributionValidator = v.object({
  _id: v.id("contributions"),
  _creationTime: v.number(),
  missionId: v.union(v.id("missions"), v.null()),
  ambassadorName: v.string(),
  missionTitle: v.union(v.string(), v.null()),
  title: v.string(),
  note: v.optional(v.string()),
  link: v.optional(v.string()),
  responses: v.optional(
    v.array(
      v.object({
        fieldKey: v.string(),
        label: v.string(),
        value: v.string(),
      }),
    ),
  ),
  quantity: v.optional(v.number()),
  kind: v.union(
    v.literal("mission_submission"),
    v.literal("people_reached"),
    v.literal("app_install"),
    v.literal("referral"),
    v.literal("content"),
    v.literal("event"),
    v.literal("other"),
  ),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("declined"),
  ),
  reviewNote: v.optional(v.string()),
  reviewerName: v.optional(v.string()),
  reviewedAt: v.optional(v.number()),
});

export const adminList = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("declined"),
      ),
    ),
  },
  returns: paginationResultValidator(adminContributionValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { status } = args;
    const rows =
      status === undefined
        ? await ctx.db
            .query("contributions")
            .order("desc")
            .paginate(args.paginationOpts)
        : await ctx.db
            .query("contributions")
            .withIndex("by_status", (q) => q.eq("status", status))
            .order("desc")
            .paginate(args.paginationOpts);

    return {
      ...rows,
      page: await Promise.all(
        rows.page.map(async (contribution) => {
          const [ambassador, mission] = await Promise.all([
            ctx.db.get(contribution.ambassadorId),
            contribution.missionId === undefined
              ? null
              : ctx.db.get(contribution.missionId),
          ]);

          return {
            _id: contribution._id,
            _creationTime: contribution._creationTime,
            missionId: contribution.missionId ?? null,
            ambassadorName: ambassador?.name?.trim() || "Ambassador",
            missionTitle: mission?.title ?? null,
            title: contribution.title,
            note: contribution.note,
            link: contribution.link,
            responses: contribution.responses,
            quantity: contribution.quantity,
            kind: contribution.kind,
            status: contribution.status,
            reviewNote: contribution.reviewNote,
          };
        }),
      ),
    };
  },
});

export const adminGet = query({
  args: { contributionId: v.string() },
  returns: v.union(adminContributionValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const id = ctx.db.normalizeId("contributions", args.contributionId);
    if (id === null) return null;

    const contribution = await ctx.db.get(id);
    if (contribution === null) return null;

    const [ambassador, mission, reviewer] = await Promise.all([
      ctx.db.get(contribution.ambassadorId),
      contribution.missionId === undefined
        ? null
        : ctx.db.get(contribution.missionId),
      contribution.reviewedBy === undefined
        ? null
        : ctx.db.get(contribution.reviewedBy),
    ]);

    return {
      _id: contribution._id,
      _creationTime: contribution._creationTime,
      missionId: contribution.missionId ?? null,
      ambassadorName: ambassador?.name?.trim() || "Ambassador",
      missionTitle: mission?.title ?? null,
      title: contribution.title,
      note: contribution.note,
      link: contribution.link,
      responses: contribution.responses,
      quantity: contribution.quantity,
      kind: contribution.kind,
      status: contribution.status,
      reviewNote: contribution.reviewNote,
      reviewerName: reviewer?.name?.trim() || undefined,
      reviewedAt: contribution.reviewedAt,
    };
  },
});

export const adminReview = mutation({
  args: {
    contributionId: v.id("contributions"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("declined"),
    ),
    reviewNote: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const contribution = await ctx.db.get(args.contributionId);

    if (contribution === null) {
      throw new AuthError(404, "Not found.");
    }
    if (contribution.status !== "pending") {
      throw new Error("This submission has already been reviewed.");
    }

    const reviewNote = args.reviewNote?.trim();
    if (reviewNote && reviewNote.length > 4000) {
      throw new Error("Keep feedback under 4,000 characters.");
    }
    if (args.status !== "approved" && (!reviewNote || reviewNote.length < 10)) {
      throw new Error("Add clear feedback before sending this decision.");
    }

    await ctx.db.patch(args.contributionId, {
      status: args.status,
      reviewNote: reviewNote || undefined,
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });

    return null;
  },
});

export const submit = mutation({
  args: {
    missionId: v.id("missions"),
    note: v.optional(v.string()),
    link: v.optional(v.string()),
    quantity: v.optional(v.number()),
    responses: v.optional(
      v.array(
        v.object({
          fieldKey: v.string(),
          label: v.string(),
          value: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    // `ambassadorId` is deliberately not an argument. It is read from the token,
    // so a caller cannot submit work as somebody else.
    const user = await requireRole(ctx);

    const ambassadorProfile = await ctx.db
      .query("ambassadorProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (ambassadorProfile !== null && ambassadorProfile.status !== "active") {
      throw new AuthError(404, "Not found.");
    }

    const mission = await ctx.db.get(args.missionId);

    // 404 rather than a refusal, so a probe cannot tell a closed mission from
    // one that never existed.
    if (mission === null || mission.status !== "published") {
      throw new AuthError(404, "Not found.");
    }

    if (Date.now() > mission.endsAt) {
      throw new Error(
        "This mission has closed and is no longer accepting submissions.",
      );
    }

    const submissionFields = mission.submissionFields ?? [];
    if (submissionFields.length === 0) {
      const note = args.note?.trim() ?? "";
      if (note.length < 20) {
        throw new Error(
          "Describe what you did in at least a couple of sentences.",
        );
      }
      if (args.responses?.length) {
        throw new Error("This mission does not have custom response fields.");
      }
    } else {
      if (args.responses === undefined || args.responses.length > 6) {
        throw new Error("Complete the requested submission fields.");
      }

      const fieldValues = new Map<string, string>();
      for (const response of args.responses) {
        if (fieldValues.has(response.fieldKey)) {
          throw new Error("Each submission field can only have one answer.");
        }

        const definition = submissionFields.find(
          (field) => field.key === response.fieldKey,
        );
        if (definition === undefined) {
          throw new Error("This submission includes an unknown field.");
        }

        const value = response.value.trim();
        if (value.length > 4000) {
          throw new Error("Keep each answer under 4,000 characters.");
        }

        if (definition.required && value.length === 0) {
          throw new Error(`Complete “${definition.label}” before submitting.`);
        }
        if (
          value.length > 0 &&
          definition.type === "number" &&
          !/^\d{1,9}$/.test(value)
        ) {
          throw new Error(`Enter a whole number for “${definition.label}”.`);
        }
        if (value.length > 0 && definition.type === "url") {
          let validUrl = false;
          try {
            const url = new URL(value);
            validUrl = url.protocol === "http:" || url.protocol === "https:";
          } catch {
            validUrl = false;
          }
          if (!validUrl) {
            throw new Error(`Enter a valid link for “${definition.label}”.`);
          }
        }

        fieldValues.set(definition.key, value);
      }

      for (const field of submissionFields) {
        if (field.required && !fieldValues.has(field.key)) {
          throw new Error(`Complete “${field.label}” before submitting.`);
        }
      }
    }

    // A rejected submission may be revised and sent again. Anything else is
    // already in the review queue.
    const latest = await ctx.db
      .query("contributions")
      .withIndex("by_ambassadorId_and_missionId", (q) =>
        q.eq("ambassadorId", user._id).eq("missionId", args.missionId),
      )
      .order("desc")
      .first();

    if (latest !== null && latest.status !== "rejected") {
      throw new Error("You already have a submission in for this mission.");
    }

    return await ctx.db.insert("contributions", {
      ambassadorId: user._id,
      missionId: args.missionId,
      kind: "mission_submission",
      quantity: args.quantity,
      // Taken from the mission so the ledger reads clearly later without asking
      // the ambassador to retype it.
      title: mission.title,
      note: args.note?.trim() || undefined,
      link: args.link,
      responses: args.responses?.map((response) => {
        const field = submissionFields.find(
          (definition) => definition.key === response.fieldKey,
        );
        return {
          fieldKey: response.fieldKey,
          label: field?.label ?? response.label,
          value: response.value.trim(),
        };
      }),
      status: "pending",
    });
  },
});
