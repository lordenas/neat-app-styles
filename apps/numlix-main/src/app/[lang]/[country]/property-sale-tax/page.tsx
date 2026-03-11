import type { Metadata } from "next";
import ClientPage from "./page-client";
import { buildLocalizedPath, buildPageMetadata } from "@/app/lib/seo";

interface RoutePageProps {
  params: Promise<{ lang: string; country: string }>;
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { lang, country } = await params;
  return buildPageMetadata({
    title: "Налог при продаже недвижимости",
    description: "Налог при продаже недвижимости — Numlix",
    path: buildLocalizedPath(lang, country, "property-sale-tax"),
  });
}

export default function Page() {
  return <ClientPage />;
}
