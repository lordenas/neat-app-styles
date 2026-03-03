import { useState } from "react";
import { HeroDashboardIllustration } from "./HeroDashboardIllustration";
import { HeroBudgetIllustration } from "./HeroBudgetIllustration";
import { HeroCalc3dIllustration } from "./HeroCalc3dIllustration";
import type { HeroIllustrationProps } from "./types";

const VARIANTS = [HeroCalc3dIllustration, HeroCalc3dIllustration, HeroCalc3dIllustration];

export function HeroIllustration(props: HeroIllustrationProps) {
  const [idx] = useState(() => Math.floor(Math.random() * VARIANTS.length));
  const Component = VARIANTS[idx];
  return <Component {...props} />;
}
