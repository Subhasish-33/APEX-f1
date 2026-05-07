import { getTeamColor } from "@/lib/constants/teams";

export default function TeamColorBadge({ teamRef, className = "w-1 h-8" }: { teamRef: string; className?: string }) {
  const color = getTeamColor(teamRef);
  return (
    <div 
      className={`rounded-full ${className}`} 
      style={{ backgroundColor: color }} 
    />
  );
}
