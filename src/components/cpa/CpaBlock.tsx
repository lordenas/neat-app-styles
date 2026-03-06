import { ExternalLink, Star, TrendingDown, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type CpaOffer = {
  id: string;
  bank: string;
  logo: string; // emoji or letter
  logoColor: string; // bg color class
  rate: string;
  rateLabel?: string;
  term: string;
  amount: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  highlight?: boolean;
  features: string[];
  cta: string;
  url: string;
};

export type CpaBlockProps = {
  title?: string;
  subtitle?: string;
  offers: CpaOffer[];
  utmSource?: string;
};

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  fast: <Zap className="h-3 w-3" />,
  safe: <Shield className="h-3 w-3" />,
  low: <TrendingDown className="h-3 w-3" />,
};

function getBestIcon(feature: string) {
  if (feature.includes("онлайн") || feature.includes("быстро") || feature.includes("мин")) return FEATURE_ICONS.fast;
  if (feature.includes("страхо") || feature.includes("защит")) return FEATURE_ICONS.safe;
  if (feature.includes("ставк") || feature.includes("низк") || feature.includes("%")) return FEATURE_ICONS.low;
  return null;
}

export function CpaBlock({ title = "Лучшие предложения банков", subtitle, offers, utmSource = "numlix" }: CpaBlockProps) {
  const buildUrl = (offer: CpaOffer) => {
    try {
      const url = new URL(offer.url);
      url.searchParams.set("utm_source", utmSource);
      url.searchParams.set("utm_medium", "cpa_block");
      url.searchParams.set("utm_campaign", offer.id);
      return url.toString();
    } catch {
      return offer.url;
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`relative rounded-xl border bg-card p-4 flex flex-col gap-3 transition-shadow hover:shadow-md ${
              offer.highlight
                ? "border-primary/40 ring-1 ring-primary/20 bg-primary/[0.02]"
                : "border-border"
            }`}
          >
            {offer.badge && (
              <div className="absolute -top-2.5 left-4">
                <Badge variant={offer.badgeVariant ?? "default"} className="text-[10px] px-2 py-0.5 shadow-sm">
                  {offer.badge}
                </Badge>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 ${offer.logoColor}`}>
                {offer.logo}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground leading-tight truncate">{offer.bank}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Rate — main metric */}
            <div className="flex items-end gap-3">
              <div>
                <p className="text-2xl font-bold text-primary leading-none">{offer.rate}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{offer.rateLabel ?? "годовых"}</p>
              </div>
              <div className="mb-0.5 text-right ml-auto text-xs text-muted-foreground leading-tight">
                <p>{offer.term}</p>
                <p>{offer.amount}</p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-1">
              {offer.features.map((f, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-primary/70 shrink-0">{getBestIcon(f) ?? <span className="w-3 h-3 inline-block rounded-full bg-primary/20" />}</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href={buildUrl(offer)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className={`mt-auto flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                offer.highlight
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-foreground hover:bg-muted/70 border border-border"
              }`}
            >
              {offer.cta}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Партнёрские предложения. Numlix не является финансовым советником. Условия актуальны на дату публикации.
      </p>
    </section>
  );
}
