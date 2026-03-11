import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
}

export function buildPageMetadata({ title, description, path }: PageMetadataOptions): Metadata {
  const url = `${SITE_URL.replace(/\/$/, "")}${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ru: url,
        "x-default": url,
      },
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      locale: "ru_RU",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildLocalizedPath(lang: string, country: string, slug = "") {
  const clean = slug.replace(/^\/+/, "");
  return clean ? `/${lang}/${country}/${clean}` : `/${lang}/${country}`;
}
