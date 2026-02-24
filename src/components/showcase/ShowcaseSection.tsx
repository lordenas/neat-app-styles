// ⚠️ Client-only component — uses framer-motion, do NOT use in SSR/Next.js contexts
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const sectionId = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

interface ShowcaseSectionProps {
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function ShowcaseSection({ title, children, description }: ShowcaseSectionProps) {
  return (
    <motion.section
      id={sectionId(title)}
      className="section-card"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mb-4 flex items-center gap-3">
        <h3>{title}</h3>
        {description && <Badge variant="outline" className="text-xs font-normal">{description}</Badge>}
      </div>
      {children}
    </motion.section>
  );
}
