import type { Metadata } from "next";
import ClientPage from "./page-client";
import { buildLocalizedPath, buildPageMetadata } from "@/app/lib/seo";

interface RoutePageProps {
  params: Promise<{ lang: string; country: string }>;
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { lang, country } = await params;
  return buildPageMetadata({
    title: "Калькулятор расхода топлива",
    description: "Калькулятор расхода топлива — Numlix",
    path: buildLocalizedPath(lang, country, "fuel-consumption"),
  });
}

export default function Page() {
  return <ClientPage />;
}
