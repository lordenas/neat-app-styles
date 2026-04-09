import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useListApiKeysQuery, useCreateApiKeyMutation, useDeleteApiKeyMutation } from "@/services/api/apiKeysApi";
import { useAppSelector } from "@/store/hooks";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";
import { normalizeApiBaseUrlForBrowser } from "@numlix/auth-shared";
import { ApiKeysPage } from "./ApiKeysPage";

const getBaseUrl = () =>
  normalizeApiBaseUrlForBrowser(import.meta.env.VITE_API_URL ?? "https://api.numlix.local");

export default function ApiKeysScreen() {
  const navigate = useNavigate();
  const tokens = useAppSelector((s) => s.auth.tokens);
  const isAuthenticated = Boolean(tokens?.accessToken);

  const { data: keys = [], isLoading } = useListApiKeysQuery(undefined, { skip: !isAuthenticated });
  const [createKey, { isLoading: creating }] = useCreateApiKeyMutation();
  const [deleteKey] = useDeleteApiKeyMutation();

  const [newName, setNewName] = useState("");
  const [newlyCreatedSecrets, setNewlyCreatedSecrets] = useState<Record<string, string>>({});

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const result = await createKey({ name: newName.trim() }).unwrap();
      setNewlyCreatedSecrets((prev) => ({ ...prev, [result.id]: result.apiKey }));
      setNewName("");
      toast({
        title: "Ключ создан",
        description: `API-ключ «${result.name}» готов к использованию.`,
        variant: "success",
        icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось создать ключ.",
        variant: "destructive",
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      });
    }
  }, [newName, createKey]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteKey(id).unwrap();
      setNewlyCreatedSecrets((prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      }));
      toast({
        title: "Ключ удалён",
        variant: "success",
        icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />,
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить ключ.",
        variant: "destructive",
        icon: <XCircle className="h-5 w-5 text-destructive" />,
      });
    }
  }, [deleteKey]);

  return (
    <ApiKeysPage
      isAuthenticated={isAuthenticated}
      onNavigateToAuth={() => navigate("/auth")}
      keys={keys}
      newlyCreatedSecrets={newlyCreatedSecrets}
      loading={isLoading}
      creating={creating}
      newName={newName}
      onNewNameChange={setNewName}
      onCreate={handleCreate}
      onDelete={handleDelete}
      baseUrl={getBaseUrl()}
    />
  );
}
