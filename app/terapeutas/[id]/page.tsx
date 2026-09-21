import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TherapistLegacyPage({
  params,
}: PageProps) {
  const { id } = await params;

  redirect(`/terapeuta/${encodeURIComponent(id)}`);
}