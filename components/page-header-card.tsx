import { Card, CardContent } from "@/components/ui/card";

interface PageHeaderCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeaderCard({
  title,
  subtitle,
  children,
}: PageHeaderCardProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        {children}
      </CardContent>
    </Card>
  );
}
