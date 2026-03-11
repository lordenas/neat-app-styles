import type { Metadata } from "next";
import ClientPage from "./page-client";
import { buildLocalizedPath, buildPageMetadata } from "@/app/lib/seo";

interface RoutePageProps {
  params: Promise<{ lang: string; country: string; slug: string }>;
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { lang, country, slug } = await params;
  return buildPageMetadata({
    title: "Статья блога",
    description: "Статья блога — Numlix",
    path: buildLocalizedPath(lang, country, "blog/" + slug),
  });
}

export default function Page() {
  return <ClientPage />;
}
