import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ErrorCard({
  title = "We couldn’t build that explainer",
  message,
  action,
}: {
  title?: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-rose-200 bg-rose-50 p-6">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600" />
        <div>
          <h2 className="font-bold text-rose-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-rose-800">{message}</p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </Card>
  );
}
