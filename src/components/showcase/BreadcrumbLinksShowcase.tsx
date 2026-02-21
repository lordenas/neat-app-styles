import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ExternalLink } from "lucide-react";

export function BreadcrumbLinksShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-3">Хлебные крошки</p>
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Главная</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Каталог</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Категория</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Текущая страница</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-3">Ссылки</p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#" className="text-sm text-primary hover:underline underline-offset-4 transition-colors">
            Обычная ссылка
          </a>
          <a href="#" className="text-sm text-primary hover:underline underline-offset-4 transition-colors inline-flex items-center gap-1">
            Внешняя ссылка <ExternalLink className="h-3 w-3" />
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Приглушённая ссылка
          </a>
          <a href="#" className="text-sm text-foreground underline decoration-dotted underline-offset-4 hover:decoration-solid transition-colors">
            Пунктирная ссылка
          </a>
          <span className="text-sm text-muted-foreground cursor-not-allowed opacity-50">
            Disabled ссылка
          </span>
        </div>
      </div>
    </div>
  );
}
