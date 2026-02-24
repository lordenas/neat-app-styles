import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const slides = [
  { title: "Проект Alpha", desc: "Дизайн-система для финтеха", color: "bg-primary/10" },
  { title: "Проект Beta", desc: "Мобильное приложение доставки", color: "bg-[hsl(var(--success))]/10" },
  { title: "Проект Gamma", desc: "Аналитический дашборд", color: "bg-[hsl(var(--warning))]/10" },
  { title: "Проект Delta", desc: "CRM для малого бизнеса", color: "bg-[hsl(var(--info))]/10" },
  { title: "Проект Epsilon", desc: "Корпоративный портал", color: "bg-secondary" },
];

export function CarouselShowcase() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const onApiChange = (api: CarouselApi) => {
    setApi(api);
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  };

  return (
    <div className="space-y-6">
      {/* Basic carousel */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">Базовая карусель со стрелками</p>
        <div className="px-12">
          <Carousel setApi={onApiChange} opts={{ loop: true }}>
            <CarouselContent>
              {slides.map((slide, i) => (
                <CarouselItem key={i}>
                  <Card>
                    <CardContent className={cn("flex flex-col items-center justify-center p-6 min-h-[140px]", slide.color)}>
                      <p className="text-lg font-semibold">{slide.title}</p>
                      <p className="text-sm text-muted-foreground">{slide.desc}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                )}
                aria-label={`Слайд ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Multi-item */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">Несколько элементов (basis-1/3)</p>
        <div className="px-12">
          <Carousel opts={{ align: "start" }}>
            <CarouselContent>
              {slides.map((slide, i) => (
                <CarouselItem key={i} className="basis-full sm:basis-1/2 md:basis-1/3">
                  <Card>
                    <CardContent className="flex items-center justify-center p-4 min-h-[100px]">
                      <span className="font-medium text-sm">{slide.title}</span>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </div>
  );
}
