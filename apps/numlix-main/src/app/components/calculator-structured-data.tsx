import { StructuredData } from "./structured-data";

interface CalculatorStructuredDataProps {
  name: string;
  description: string;
  url: string;
}

export function CalculatorStructuredData({ name, description, url }: CalculatorStructuredDataProps) {
  const webApplicationData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: url.replace(/\/[^/]+$/, "") },
      { "@type": "ListItem", position: 2, name, item: url },
    ],
  };

  return (
    <>
      <StructuredData data={webApplicationData} />
      <StructuredData data={breadcrumbData} />
    </>
  );
}
