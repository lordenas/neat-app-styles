import type { Metadata } from "next";
import ClientPage from "./page-client";
import { buildLocalizedPath, buildPageMetadata } from "@/app/lib/seo";

interface RoutePageProps {
  params: Promise<{ lang: string; country: string }>;
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { lang, country } = await params;
  return buildPageMetadata({
    title: "Калькулятор пени",
    description: "Калькулятор пени — Numlix",
    path: buildLocalizedPath(lang, country, "peni"),
  });
}

export default function Page() {
  return <ClientPage />;
}
