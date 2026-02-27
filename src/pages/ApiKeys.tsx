import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { useApiKeys } from "@/hooks/useApiKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Key, Plus, Trash2, Ban, Copy, Check, Zap, Crown, Code2, BookOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_URL = "https://zaugysfnogbnabfsogoe.supabase.co/functions/v1/calculate";

const SUPPORTED = [
  { type: "vat", label: "НДС", params: '{"amount": 10000, "rate": 20}', desc: "Расчёт НДС" },
  { type: "ndfl", label: "НДФЛ", params: '{"income": 500000}', desc: "Налог на доходы" },
  { type: "mortgage", label: "Ипотека", params: '{"amount": 5000000, "rate": 10.5, "termMonths": 240}', desc: "Аннуитетный платёж" },
  { type: "deposit", label: "Вклад", params: '{"amount": 100000, "rate": 16, "termMonths": 12}', desc: "Доход по вкладу" },
  { type: "auto-loan", label: "Автокредит", params: '{"carPrice": 2000000, "downPayment": 400000, "rate": 12, "termMonths": 60}', desc: "Ежемесячный платёж" },
  { type: "fuel-consumption", label: "Топливо", params: '{"distance": 500, "consumptionPer100": 8, "pricePerLiter": 55}', desc: "Расход топлива" },
  { type: "inflation", label: "Инфляция", params: '{"amount": 100000, "rate": 7.5, "years": 5}', desc: "Обесценивание суммы" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
      {copied ? <Check className="h-3.5 w-3.5 text-[hsl(var(--success,142_76%_36%))]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function ApiKeys() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { keys, loading, createKey, revokeKey, deleteKey } = useApiKeys();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedType, setSelectedType] = useState(SUPPORTED[0]);

  if (!user) {
    return (
      <><SiteHeader />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Key className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Войдите, чтобы использовать API</h2>
            <Button onClick={() => navigate("/auth")}>Войти</Button>
          </div>
        </main>
        <SiteFooter /></>
    );
  }

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await createKey(newName.trim());
    setNewName("");
    setCreating(false);
  };

  const curlExample = `curl -X POST ${BASE_URL}/${selectedType.type} \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -d '${selectedType.params}'`;

  return (
    <>
      <Helmet>
        <title>API-ключи — CalcHub</title>
        <meta name="description" content="Управляйте API-ключами CalcHub для доступа к REST API калькуляторов." />
      </Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API для разработчиков
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              REST endpoint — передай параметры, получи JSON с результатом
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-8 max-w-5xl">
          {/* Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm">Free</span>
                <Badge variant="secondary" className="ml-auto text-xs">Текущий</Badge>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 1 000 запросов / месяц</li>
                <li>• Все калькуляторы</li>
                <li>• JSON-ответ</li>
              </ul>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/[0.03] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm text-primary">Pro</span>
                <span className="ml-auto text-xs text-muted-foreground">скоро</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Без ограничений</li>
                <li>• SLA и приоритетная поддержка</li>
                <li>• Batch-запросы</li>
              </ul>
            </div>
          </div>

          {/* Create key */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Создать API-ключ
            </h2>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="sr-only">Название ключа</Label>
                <Input
                  placeholder="Например: Мой сайт"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  inputSize="sm"
                />
              </div>
              <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()}>
                <Plus className="h-3.5 w-3.5" />
                Создать
              </Button>
            </div>
          </div>

          {/* Keys list */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Ваши ключи</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Загрузка...</p>
            ) : keys.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-muted-foreground text-sm">
                Нет API-ключей. Создайте первый выше.
              </div>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => {
                  const pct = Math.min(100, Math.round(k.requests_count / k.requests_limit * 100));
                  const isWarning = pct >= 70 && pct < 90;
                  const isDanger = pct >= 90;
                  return (
                    <div key={k.id} className={cn("rounded-xl border bg-card p-4 space-y-3", !k.is_active && "opacity-60")}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm truncate">{k.name}</span>
                            {!k.is_active && <Badge variant="destructive" className="text-[10px]">Отозван</Badge>}
                            {k.plan === "pro" && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Pro</Badge>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground select-all">
                              {k.key}
                            </code>
                            <CopyButton text={k.key} />
                          </div>
                          {k.last_used_at && (
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Последний запрос: {new Date(k.last_used_at).toLocaleDateString("ru-RU")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {k.is_active && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-[hsl(var(--warning,38_92%_50%))]">
                                  <Ban className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Отозвать ключ?</AlertDialogTitle>
                                  <AlertDialogDescription>Ключ перестанет работать. Это действие нельзя отменить.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => revokeKey(k.id)} className="bg-amber-500 hover:bg-amber-600">Отозвать</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить ключ?</AlertDialogTitle>
                                <AlertDialogDescription>Удалённый ключ нельзя восстановить.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteKey(k.id)} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {k.plan === "free" && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className={cn("text-muted-foreground", isWarning && "text-amber-500", isDanger && "text-destructive")}>
                              {k.requests_count.toLocaleString()} / {k.requests_limit.toLocaleString()} запросов
                            </span>
                            <span className={cn("font-medium", isWarning && "text-amber-500", isDanger && "text-destructive")}>{pct}%</span>
                          </div>
                          <Progress value={pct} className={cn("h-1.5", isDanger && "[&>[role=progressbar]]:bg-destructive", isWarning && "[&>[role=progressbar]]:bg-[hsl(var(--warning,38_92%_50%))]")} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Docs */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Документация
            </h2>

            {/* Base URL */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Base URL</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">{BASE_URL}/<span className="text-primary">{"{type}"}</span></code>
                <CopyButton text={`${BASE_URL}/{type}`} />
              </div>
            </div>

            {/* Auth */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-xs font-medium">Аутентификация</p>
              <p className="text-xs text-muted-foreground">Передайте ключ в заголовке или query-параметре:</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background border rounded px-2 py-1 font-mono flex-1">X-Api-Key: YOUR_API_KEY</code>
                  <CopyButton text="X-Api-Key: YOUR_API_KEY" />
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background border rounded px-2 py-1 font-mono flex-1">?api_key=YOUR_API_KEY</code>
                  <CopyButton text="?api_key=YOUR_API_KEY" />
                </div>
              </div>
            </div>

            {/* Calculator selector */}
            <div className="space-y-3">
              <p className="text-xs font-medium">Примеры запросов</p>
              <div className="flex gap-2 flex-wrap">
                {SUPPORTED.map((s) => (
                  <button
                    key={s.type}
                    onClick={() => setSelectedType(s)}
                    className={cn(
                      "text-xs px-3 py-1 rounded-full border transition-colors",
                      selectedType.type === s.type
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="rounded-lg border bg-[hsl(var(--muted)/0.3)] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">POST /{selectedType.type}</span>
                    <span className="text-xs text-muted-foreground">— {selectedType.desc}</span>
                  </div>
                  <CopyButton text={curlExample} />
                </div>
                <pre className="text-xs font-mono p-4 overflow-x-auto text-foreground leading-relaxed whitespace-pre-wrap">
                  {curlExample}
                </pre>
              </div>
            </div>

            {/* Response example */}
            <div className="rounded-lg border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/50">
                <span className="text-xs font-medium">Пример ответа</span>
                <Badge variant="secondary" className="text-[10px] text-green-600">200 OK</Badge>
              </div>
              <pre className="text-xs font-mono p-4 overflow-x-auto text-foreground leading-relaxed">
{`{
  "success": true,
  "type": "${selectedType.type}",
  "result": { ... },
  "meta": {
    "plan": "free",
    "requestsUsed": 42,
    "requestsLimit": 1000
  }
}`}
              </pre>
            </div>

            {/* Error codes */}
            <div className="rounded-lg border overflow-hidden">
              <div className="px-4 py-2 border-b bg-muted/50 text-xs font-medium">Коды ошибок</div>
              <div className="divide-y">
                {[
                  { code: "401", msg: "Неверный или отсутствующий API-ключ" },
                  { code: "403", msg: "Ключ отозван или неактивен" },
                  { code: "429", msg: "Превышен лимит запросов (Free план)" },
                  { code: "400", msg: "Неизвестный тип калькулятора" },
                ].map(({ code, msg }) => (
                  <div key={code} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                    <Badge variant={code === "429" ? "destructive" : "secondary"} className="font-mono w-9 justify-center shrink-0">{code}</Badge>
                    <span className="text-muted-foreground">{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
