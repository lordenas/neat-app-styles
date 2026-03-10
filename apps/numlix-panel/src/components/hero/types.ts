export interface HeroIllustrationProps {
  parallax: { x: number; y: number };
  chipRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  chipOffsets: { x: number; y: number }[];
}
