import { AspectRatio } from "@/components/ui/aspect-ratio";

export function AspectRatioShowcase() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground mb-2">16:9 (Видео)</p>
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              16:9
            </div>
          </AspectRatio>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">4:3 (Фото)</p>
          <AspectRatio ratio={4 / 3} className="bg-muted rounded-md overflow-hidden">
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              4:3
            </div>
          </AspectRatio>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">1:1 (Аватар)</p>
          <AspectRatio ratio={1} className="bg-muted rounded-md overflow-hidden">
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              1:1
            </div>
          </AspectRatio>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">21:9 (Кинематограф) с изображением</p>
        <AspectRatio ratio={21 / 9} className="bg-muted rounded-md overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
            alt="Mountain landscape"
            className="h-full w-full object-cover"
          />
        </AspectRatio>
      </div>
    </div>
  );
}
