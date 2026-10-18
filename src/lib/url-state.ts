import { createParser } from "nuqs/server";

// Cursor-paginated tables load every page up to the requested one, so a
// hand-edited `?page=` must be bounded or it would pull the whole table.
const MAX_PAGE = 100;

/** 1-based page number, clamped to `1..MAX_PAGE`. */
export const parseAsPage = createParser<number>({
  parse: (value) => {
    const page = Number.parseInt(value, 10);
    if (Number.isNaN(page)) return null;
    return Math.min(Math.max(page, 1), MAX_PAGE);
  },
  serialize: (value) => String(value),
  eq: (a, b) => a === b,
})
  .withDefault(1)
  .withOptions({ clearOnDefault: true });
