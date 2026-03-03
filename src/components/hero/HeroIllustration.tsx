import { useState } from "react";
import { HeroDashboardIllustration } from "./HeroDashboardIllustration";
import { HeroBudgetIllustration } from "./HeroBudgetIllustration";
import { HeroCalc3dIllustration } from "./HeroCalc3dIllustration";
import type { HeroIllustrationProps } from "./types";

const VARIANTS = [HeroDashboardIllustration, HeroBudgetIllustration, HeroCalc3dIllustration];

export function HeroIllustration(props: HeroIllustrationProps) {
  const [idx] = useState(() => 2); // temp: force Calc3d
  const Component = VARIANTS[idx];
  return <Component {...props} />;
}
