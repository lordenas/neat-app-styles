import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Accessibility, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

type ContrastMode = "default" | "high" | "bw";
type MotionMode = "default" | "reduce";
type FontScale = "default" | "large" | "xlarge";

export function AccessibilityMenu() {
  const { t } = useTranslation();
  const [contrast, setContrast] = useState<ContrastMode>("default");
  const [motion, setMotion] = useState<MotionMode>("default");
  const [fontScale, setFontScale] = useState<FontScale>("default");

  const applyContrast = (mode: ContrastMode) => {
    setContrast(mode);
    document.documentElement.classList.remove("a11y-high-contrast", "a11y-bw");
    if (mode === "high") document.documentElement.classList.add("a11y-high-contrast");
    if (mode === "bw") document.documentElement.classList.add("a11y-bw");
  };

  const applyMotion = (mode: MotionMode) => {
    setMotion(mode);
    document.documentElement.classList.toggle("a11y-reduce-motion", mode === "reduce");
  };

  const applyFontScale = (scale: FontScale) => {
    setFontScale(scale);
    document.documentElement.classList.remove("a11y-font-large", "a11y-font-xlarge");
    if (scale === "large") document.documentElement.classList.add("a11y-font-large");
    if (scale === "xlarge") document.documentElement.classList.add("a11y-font-xlarge");
  };

  const reset = () => {
    applyContrast("default");
    applyMotion("default");
    applyFontScale("default");
  };

  const isModified = contrast !== "default" || motion !== "default" || fontScale !== "default";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("accessibility.openMenu")}
          className="relative"
        >
          <Accessibility className="h-4 w-4" />
          {isModified && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{t("accessibility.profileLabel")}</h4>
            {isModified && (
              <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs">
                {t("accessibility.reset")}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t("accessibility.contrast")}</Label>
            <RadioGroup value={contrast} onValueChange={(v) => applyContrast(v as ContrastMode)} className="gap-1.5">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="c-default" />
                <Label htmlFor="c-default" className="text-sm font-normal cursor-pointer">{t("accessibility.contrastDefault")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="c-high" />
                <Label htmlFor="c-high" className="text-sm font-normal cursor-pointer">{t("accessibility.contrastHigh")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bw" id="c-bw" />
                <Label htmlFor="c-bw" className="text-sm font-normal cursor-pointer">{t("accessibility.contrastBlackWhite")}</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t("accessibility.motion")}</Label>
            <RadioGroup value={motion} onValueChange={(v) => applyMotion(v as MotionMode)} className="gap-1.5">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="m-default" />
                <Label htmlFor="m-default" className="text-sm font-normal cursor-pointer">{t("accessibility.motionDefault")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reduce" id="m-reduce" />
                <Label htmlFor="m-reduce" className="text-sm font-normal cursor-pointer">{t("accessibility.motionReduce")}</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t("accessibility.fontSize")}</Label>
            <RadioGroup value={fontScale} onValueChange={(v) => applyFontScale(v as FontScale)} className="gap-1.5">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="f-default" />
                <Label htmlFor="f-default" className="text-sm font-normal cursor-pointer">{t("accessibility.fontScaleDefault")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="f-large" />
                <Label htmlFor="f-large" className="text-sm font-normal cursor-pointer">{t("accessibility.fontScaleLarge")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlarge" id="f-xlarge" />
                <Label htmlFor="f-xlarge" className="text-sm font-normal cursor-pointer">{t("accessibility.fontScaleXLarge")}</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
