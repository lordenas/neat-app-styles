import { useState } from "react";
import { HeroDashboardIllustration } from "./HeroDashboardIllustration";
import { HeroBudgetIllustration } from "./HeroBudgetIllustration";
import { HeroOrbitalIllustration } from "./HeroOrbitalIllustration";
import type { HeroIllustrationProps } from "./types";

const VARIANTS = [HeroDashboardIllustration, HeroBudgetIllustration, HeroOrbitalIllustration];

export function HeroIllustration(props: HeroIllustrationProps) {
  const [idx] = useState(() => Math.floor(Math.random() * VARIANTS.length));
  const Component = VARIANTS[idx];
  return <Component {...props} />;
}
