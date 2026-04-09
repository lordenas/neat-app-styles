import { useListCalculatorsQuery } from "@/services/api/calculatorsApi";
import { useCreateEmbedTokenMutation, useDeleteEmbedTokenMutation } from "@/services/api/embedApi";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";
import type { EmbedConfig } from "@/types/embed";

const DEFAULT_CONFIG: EmbedConfig = {
  calculatorId: "",
  plan: "free",
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#0f172a",
  borderRadius: 12,
  fontFamily: "system-ui",
  showLogo: true,
  logoUrl: "",
  currency: "RUB",
  locale: "ru",
  width: "100%",
  height: 600,
  monthlyRequestLimit: 100,
};

export interface EmbedWidget {
  id: string;
  name: string;
  config: EmbedConfig;
  created_at: string;
  updated_at: string;
  monthly_views: number;
  views_reset_at: string;
}

export function useEmbedWidgets() {
  const { user } = useAuth();
  const { data: calculators = [], isLoading: loading } = useListCalculatorsQuery(undefined, { skip: !user });
  const [createToken] = useCreateEmbedTokenMutation();
  const [deleteToken] = useDeleteEmbedTokenMutation();

  const widgets: EmbedWidget[] = calculators.map((c) => ({
    id: c.id,
    name: c.title,
    config: { ...DEFAULT_CONFIG, calculatorId: c.id },
    created_at: c.createdAt,
    updated_at: c.updatedAt,
    monthly_views: 0,
    views_reset_at: new Date().toISOString(),
  }));

  const saveWidget = async (name: string, config: EmbedConfig, existingId?: string): Promise<EmbedWidget | null> => {
    if (!user) return null;
    const calcId = existingId ?? config.calculatorId;
    if (!calcId) return null;
    try {
      await createToken(calcId).unwrap();
      toast({ title: "Сохранено", description: `Виджет «${name}» готов к встраиванию.`, variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
      return { id: calcId, name, config, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), monthly_views: 0, views_reset_at: new Date().toISOString() };
    } catch {
      toast({ title: "Ошибка", description: "Не удалось создать токен виджета.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
      return null;
    }
  };

  const deleteWidget = async (id: string) => {
    try {
      await deleteToken(id).unwrap();
      toast({ title: "Удалено", description: "Токен виджета удалён.", variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
    } catch {
      toast({ title: "Ошибка", description: "Не удалось удалить виджет.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
    }
  };

  const refetch = () => {};
  return { widgets, loading, saveWidget, deleteWidget, refetch };
}
