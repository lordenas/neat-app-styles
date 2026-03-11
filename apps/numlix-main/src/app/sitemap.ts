import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const base = siteUrl.replace(/\/$/, "");

const staticRoutes = [
  "",
  "about",
  "blog",
  "contact",
  "glossary",
  "faq",
  "partners",
  "categories",
  "vat",
  "ndfl",
  "peni",
  "gk395",
  "penalty-contract",
  "penalty-ddu",
  "property-deduction",
  "property-sale-tax",
  "mortgage",
  "credit-early-repayment",
  "refinancing",
  "microloan",
  "inflation",
  "loan-interest",
  "osago",
  "transport-tax",
  "rastamozhka-auto",
  "auto-loan",
  "fuel-consumption",
  "otpusknye",
  "unused-vacation",
  "insurance-tenure",
  "subsistence-minimum",
  "alimony-indexation",
  "deposit",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticRoutes.map((route) => ({
    url: route ? `${base}/ru/ru/${route}` : `${base}/ru/ru`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route ? 0.8 : 1,
  }));
}
