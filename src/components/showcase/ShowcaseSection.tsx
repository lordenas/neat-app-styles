import { Badge } from "@/components/ui/badge";

const sectionId = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

interface ShowcaseSectionProps {
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function ShowcaseSection({ title, children, description }: ShowcaseSectionProps) {
  return (
    <section id={sectionId(title)} className="section-card">
      <div className="mb-4 flex items-center gap-3">
        <h3>{title}</h3>
        {description && <Badge variant="outline" className="text-xs font-normal">{description}</Badge>}
      </div>
      {children}
    </section>
  );
}
