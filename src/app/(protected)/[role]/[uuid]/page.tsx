import { redirect } from "next/navigation";

export default async function Page({
    params,
}: {
    params: Promise<{
        role: "admin" | "ambassador";
        uuid: string;
    }>;
}) {
    const { role, uuid } = await params;

    redirect(`/${role}/${uuid}/dashboard`);
}