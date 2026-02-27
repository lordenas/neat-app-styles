export type EmbedPlan = "free" | "pro";

export interface EmbedConfig {
  calculatorId: string;
  plan: EmbedPlan;

  // Appearance
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontFamily: string;

  // Branding
  showLogo: boolean;
  logoUrl: string;

  // Locale
  currency: string;
  locale: string;

  // Dimensions
  width: string | number;
  height: number;

  // Free tier limit
  monthlyRequestLimit: number;
}

/**
 * Backend contract (future API)
 *
 * POST /api/embed-widgets
 * Body: { config: EmbedConfig, userId: string }
 * Returns: { widgetId: string, accessToken: string, embedUrl: string }
 *
 * GET /api/embed-widgets/:widgetId
 * Returns: { config: EmbedConfig, stats: { requestsThisMonth: number } }
 *
 * PATCH /api/embed-widgets/:widgetId
 * Body: Partial<EmbedConfig>
 * Returns: { config: EmbedConfig }
 *
 * GET /api/embed-widgets/:widgetId/stats
 * Returns: { requestsThisMonth: number, requestsTotal: number, topPages: string[] }
 *
 * Тарифы:
 * - free: showLogo=true (принудительно), monthlyRequests <= 100
 * - pro: showLogo=false (опционально), monthlyRequests unlimited, кастомный домен
 */
