import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  plan: "free" | "pro";
  requests_count: number;
  requests_limit: number;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => supabase.from("api_keys" as any);

export function useApiKeys() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchKeys = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await db().select("*").order("created_at", { ascending: false });
    if (!error && data) setKeys(data as unknown as ApiKey[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const createKey = async (name: string): Promise<ApiKey | null> => {
    if (!user) return null;
    const { data, error } = await db()
      .insert({ user_id: user.id, name })
      .select()
      .single();
    if (error) {
      toast({ title: "Ошибка", description: "Не удалось создать ключ.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
      return null;
    }
    const created = data as unknown as ApiKey;
    setKeys((prev) => [created, ...prev]);
    toast({ title: "Ключ создан", description: `API-ключ «${name}» готов к использованию.`, variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
    return created;
  };

  const revokeKey = async (id: string) => {
    const { error } = await db().update({ is_active: false }).eq("id", id);
    if (error) {
      toast({ title: "Ошибка", description: "Не удалось отозвать ключ.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
    } else {
      setKeys((prev) => prev.map((k) => k.id === id ? { ...k, is_active: false } : k));
      toast({ title: "Ключ отозван", variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
    }
  };

  const deleteKey = async (id: string) => {
    const { error } = await db().delete().eq("id", id);
    if (error) {
      toast({ title: "Ошибка", description: "Не удалось удалить ключ.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-destructive" /> });
    } else {
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast({ title: "Ключ удалён", variant: "success", icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" /> });
    }
  };

  return { keys, loading, createKey, revokeKey, deleteKey, refetch: fetchKeys };
}
