import { useState } from "react";
import { HeroDashboardIllustration } from "./HeroDashboardIllustration";
import { HeroBudgetIllustration } from "./HeroBudgetIllustration";
import type { HeroIllustrationProps } from "./types";

export function HeroIllustration(props: HeroIllustrationProps) {
  const [isDashboard] = useState(() => Math.random() < 0.5);
  return isDashboard
    ? <HeroDashboardIllustration {...props} />
    : <HeroBudgetIllustration {...props} />;
}
