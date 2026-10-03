import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatProfileLabel as formatLabel } from "./profile-format-label";

export function ProfileRecognitionCard({
  recognitions,
}: {
  recognitions: Array<{ _id: string; kind: string; note: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <h3 className="font-semibold text-foreground">Recognition</h3>
        <div className="mt-4 space-y-4">
          {recognitions.length ? (
            recognitions.map((item) => (
              <div key={item._id} className="flex gap-3 text-sm">
                <Award
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-warning"
                />
                <div>
                  <p className="font-medium text-foreground">
                    {formatLabel(item.kind)}
                  </p>
                  <p className="mt-1 text-muted-foreground">{item.note}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Recognition from the Xolace team will appear here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
