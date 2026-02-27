import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";
import type { EmbedConfig } from "@/types/embed";

export interface EmbedWidget {
  id: string;
  name: string;
  config: EmbedConfig;
  created_at: string;
  updated_at: string;
}

export function useEmbedWidgets() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<EmbedWidget[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWidgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("embed_widgets")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!error && data) setWidgets(data as unknown as EmbedWidget[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const saveWidget = async (name: string, config: EmbedConfig, existingId?: string) => {
    if (!user) return null;
    if (existingId) {
      const { data, error } = await supabase
        .from("embed_widgets")
        .update({ name, config: config as unknown as import("@/integrations/supabase/types").Json })
        .eq("id", existingId)
        .select()
        .single();
      if (error) {
        toast({ title: "Ошибка", description: "Не удалось сохранить виджет.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
        return null;
      }
      const updated = data as unknown as EmbedWidget;
      setWidgets((prev) => prev.map((w) => w.id === existingId ? updated : w));
      toast({ title: "Сохранено", description: `Виджет «${name}» обновлён.`, variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
      return updated;
    } else {
      const { data, error } = await supabase
        .from("embed_widgets")
        .insert({ user_id: user.id, name, config: config as unknown as Record<string, unknown> })
        .select()
        .single();
      if (error) {
        toast({ title: "Ошибка", description: "Не удалось создать виджет.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
        return null;
      }
      const created = data as unknown as EmbedWidget;
      setWidgets((prev) => [created, ...prev]);
      toast({ title: "Сохранено", description: `Виджет «${name}» создан.`, variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
      return created;
    }
  };

  const deleteWidget = async (id: string) => {
    const { error } = await supabase.from("embed_widgets").delete().eq("id", id);
    if (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить виджет.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
    } else {
      setWidgets((prev) => prev.filter((w) => w.id !== id));
      toast({ title: "Удалено", description: "Виджет удалён.", variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
    }
  };

  return { widgets, loading, saveWidget, deleteWidget, refetch: fetchWidgets };
}
