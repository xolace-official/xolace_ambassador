import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AmbassadorWelcomeCard({
  name,
  uuid,
  currentLevel,
}: {
  name: string | null;
  uuid: string;
  currentLevel: string;
}) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/5">
      <CardContent className="relative p-5 sm:p-7">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles aria-hidden="true" className="size-4" />
            {currentLevel}
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {name?.split(" ")[0] || "Ambassador"}.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Keep building spaces where people feel heard. Your next meaningful
            contribution is waiting for you.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm" className="gap-2">
              <Link href={`/ambassador/${uuid}/missions`}>
                Explore missions
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/ambassador/${uuid}/impact`}>View your impact</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
