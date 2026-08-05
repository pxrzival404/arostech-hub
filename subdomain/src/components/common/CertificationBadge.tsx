import { Badge } from "@/components/ui/badge";
import { Certification } from "@/types";
import {
  ShieldCheck,
  Flag,
  FileCheck,
  Award,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  SNI: ShieldCheck,
  TKDN: Flag,
  LKPP: FileCheck,
  "ISO 9001": Award,
};

interface CertificationBadgeProps {
  certification: Certification;
}

export function CertificationBadge({ certification }: CertificationBadgeProps) {
  const Icon = iconMap[certification.name] || ShieldCheck;

  return (
    <div className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-card text-center hover:shadow-md transition-shadow">
      <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
        <Icon className="size-7 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="font-bold text-lg text-foreground">{certification.name}</h3>
      <p className="text-sm text-muted-foreground">{certification.description}</p>
    </div>
  );
}
