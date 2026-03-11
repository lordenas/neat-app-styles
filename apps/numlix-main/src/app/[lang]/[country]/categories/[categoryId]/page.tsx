import type { Metadata } from "next";
import ClientPage from "./page-client";
import { buildLocalizedPath, buildPageMetadata } from "@/app/lib/seo";

interface RoutePageProps {
  params: Promise<{ lang: string; country: string; categoryId: string }>;
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { lang, country, categoryId } = await params;
  return buildPageMetadata({
    title: "Категория калькуляторов",
    description: "Категория калькуляторов — Numlix",
    path: buildLocalizedPath(lang, country, "categories/" + categoryId),
  });
}

export default function Page() {
  return <ClientPage />;
}
