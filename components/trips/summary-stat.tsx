import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryStatProps {
  title: string;
  value: string;
  hint?: string;
}

export function SummaryStat({ title, value, hint }: SummaryStatProps) {
  return (
    <Card className="bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-primary">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
