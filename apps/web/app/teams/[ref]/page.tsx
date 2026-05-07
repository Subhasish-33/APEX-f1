import { api } from "@/lib/api";
import { f1Teams2025 } from "@/data/f1Teams2025";
import { TeamDetailClient } from "@/components/TeamDetailClient";
import { notFound } from "next/navigation";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  
  // Try to find team data in our registry
  const teamData = f1Teams2025[ref as keyof typeof f1Teams2025];
  
  if (!teamData) {
    return notFound();
  }

  return <TeamDetailClient team={teamData} />;
}

export async function generateStaticParams() {
  return Object.keys(f1Teams2025).map((ref) => ({
    ref,
  }));
}
