import { lazy } from "react";

export const PANEL_ROUTES = {
  auth: "/auth",
  dashboard: "/dashboard",
  calcList: "/calc-list",
  calcBuilder: "/calc-builder",
  calcBuilderEdit: "/calc-builder/:id",
  calcPlayer: "/c/:slug",
  embedBuilder: "/embed-builder",
  embedWidgets: "/embed-widgets",
  apiKeys: "/api-keys",
  help: "/help",
  helpGettingStarted: "/help/getting-started",
  helpFormula: "/help/formula",
  helpFields: "/help/fields",
  helpPages: "/help/pages",
  helpLogic: "/help/logic",
  helpExamples: "/help/examples",
} as const;

export const panelRouteTo = {
  calcBuilderEdit: (id: string) => `/calc-builder/${id}`,
  calcPlayer: (slug: string) => `/c/${slug}`,
  embedBuilderEdit: (widgetId: string) =>
    `/embed-builder?widgetId=${encodeURIComponent(widgetId)}`,
} as const;

export const panelPages = {
  Auth: lazy(() => import("./pages/AuthScreen")),
  Dashboard: lazy(() => import("./pages/Dashboard")),
  CalcList: lazy(() => import("./pages/CalcListScreen")),
  CalcBuilder: lazy(() => import("./pages/CalcBuilder")),
  CalcPlayer: lazy(() => import("./pages/CalcPlayer")),
  EmbedBuilder: lazy(() => import("./pages/EmbedBuilder")),
  EmbedWidgets: lazy(() => import("./pages/EmbedWidgets")),
  ApiKeys: lazy(() => import("./pages/ApiKeysScreen")),
  HelpIndex: lazy(() => import("./pages/help/HelpIndex")),
  HelpGettingStarted: lazy(() => import("./pages/help/HelpGettingStarted")),
  HelpFormula: lazy(() => import("./pages/help/HelpFormula")),
  HelpFields: lazy(() => import("./pages/help/HelpFields")),
  HelpPages: lazy(() => import("./pages/help/HelpPages")),
  HelpLogic: lazy(() => import("./pages/help/HelpLogic")),
  HelpExamples: lazy(() => import("./pages/help/HelpExamples")),
  NotFound: lazy(() => import("./pages/NotFound")),
};
