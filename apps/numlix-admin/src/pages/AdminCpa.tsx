import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { CpaOffer } from "@/components/cpa/CpaBlock";
import { CREDIT_OFFERS, MORTGAGE_OFFERS, REFINANCE_OFFERS } from "@/components/cpa/offers";
import { AdminLayout } from "@numlix/admin-shared";

// ─── Types ────────────────────────────────────────────────────────────────────

type OfferGroup = {
  id: string;
  label: string;
  page: string;
  offers: ManagedOffer[];
};

type ManagedOffer = CpaOffer & {
  hidden?: boolean;
  order?: number;
};

// ─── Initial state ────────────────────────────────────────────────────────────

const initialGroups: OfferGroup[] = [
  {
    id: "credit",
    label: "Кредиты наличными",
    page: "/credit-early-repayment",
    offers: CREDIT_OFFERS.map((o, i) => ({ ...o, hidden: false, order: i })),
  },
  {
    id: "mortgage",
    label: "Ипотека",
    page: "/mortgage",
    offers: MORTGAGE_OFFERS.map((o, i) => ({ ...o, hidden: false, order: i })),
  },
  {
    id: "refinance",
    label: "Рефинансирование",
    page: "/refinancing",
    offers: REFINANCE_OFFERS.map((o, i) => ({ ...o, hidden: false, order: i })),
  },
];

// ─── Empty offer template ─────────────────────────────────────────────────────

const emptyOffer = (): ManagedOffer => ({
  id: `offer-${Date.now()}`,
  bank: "",
  logo: "",
  logoColor: "bg-primary/20 text-primary",
  rate: "",
  rateLabel: "годовых",
  term: "",
  amount: "",
  badge: "",
  badgeVariant: "default",
  highlight: false,
  features: ["", "", ""],
  cta: "Узнать условия",
  url: "",
  hidden: false,
  order: 999,
});

// ─── Logo color presets ───────────────────────────────────────────────────────

const LOGO_COLORS = [
  { label: "Жёлтый (Т-Банк)", value: "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400" },
  { label: "Зелёный (Сбер)", value: "bg-green-500/20 text-green-700 dark:text-green-400" },
  { label: "Красный (Альфа)", value: "bg-red-500/20 text-red-600 dark:text-red-400" },
  { label: "Синий (ВТБ)", value: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  { label: "Фиолетовый", value: "bg-violet-500/20 text-violet-600 dark:text-violet-400" },
  { label: "Оранжевый", value: "bg-orange-500/20 text-orange-600 dark:text-orange-400" },
  { label: "Серый", value: "bg-muted text-muted-foreground" },
];

// ─── Offer Form ───────────────────────────────────────────────────────────────

function OfferForm({ offer, onChange }: { offer: ManagedOffer; onChange: (o: ManagedOffer) => void }) {
  const set = <K extends keyof ManagedOffer>(key: K, val: ManagedOffer[K]) =>
    onChange({ ...offer, [key]: val });

  const setFeature = (i: number, val: string) => {
    const f = [...offer.features];
    f[i] = val;
    onChange({ ...offer, features: f });
  };

  return (
    <div className="space-y-4 py-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Название банка *</Label>
          <Input value={offer.bank} onChange={(e) => set("bank", e.target.value)} placeholder="Сбербанк" />
        </div>
        <div className="space-y-1">
          <Label>Символ / логотип *</Label>
          <Input value={offer.logo} onChange={(e) => set("logo", e.target.value)} placeholder="С" maxLength={3} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Цвет аватара</Label>
        <Select value={offer.logoColor} onValueChange={(v) => set("logoColor", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOGO_COLORS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                <div className="flex items-center gap-2">
                  <span className={cn("w-5 h-5 rounded flex items-center justify-center text-xs font-bold", c.value)}>
                    {offer.logo || "?"}
                  </span>
                  {c.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Ставка *</Label>
          <Input value={offer.rate} onChange={(e) => set("rate", e.target.value)} placeholder="от 9,9%" />
        </div>
        <div className="space-y-1">
          <Label>Подпись ставки</Label>
          <Input value={offer.rateLabel ?? ""} onChange={(e) => set("rateLabel", e.target.value)} placeholder="годовых" />
        </div>
        <div className="space-y-1">
          <Label>Срок *</Label>
          <Input value={offer.term} onChange={(e) => set("term", e.target.value)} placeholder="До 5 лет" />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Сумма *</Label>
        <Input value={offer.amount} onChange={(e) => set("amount", e.target.value)} placeholder="До 5 000 000 ₽" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Бейдж</Label>
          <Input value={offer.badge ?? ""} onChange={(e) => set("badge", e.target.value)} placeholder="Популярный" />
        </div>
        <div className="space-y-1">
          <Label>Стиль бейджа</Label>
          <Select value={offer.badgeVariant ?? "default"} onValueChange={(v: any) => set("badgeVariant", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default (синий)</SelectItem>
              <SelectItem value="secondary">Secondary (серый)</SelectItem>
              <SelectItem value="outline">Outline (рамка)</SelectItem>
              <SelectItem value="destructive">Destructive (красный)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Текст кнопки *</Label>
        <Input value={offer.cta} onChange={(e) => set("cta", e.target.value)} placeholder="Узнать условия" />
      </div>

      <div className="space-y-1">
        <Label>Ссылка (URL) *</Label>
        <Input value={offer.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <Label>Преимущества (до 3 пунктов)</Label>
        {offer.features.map((f, i) => (
          <Input
            key={i}
            value={f}
            onChange={(e) => setFeature(i, e.target.value)}
            placeholder={`Преимущество ${i + 1}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Switch
          checked={offer.highlight ?? false}
          onCheckedChange={(v) => set("highlight", v)}
          id="highlight"
        />
        <Label htmlFor="highlight" className="cursor-pointer">Выделенная карточка (highlighted)</Label>
      </div>
    </div>
  );
}

// ─── Offer Row ────────────────────────────────────────────────────────────────

function OfferRow({
  offer,
  onEdit,
  onDelete,
  onToggleHidden,
}: {
  offer: ManagedOffer;
  onEdit: () => void;
  onDelete: () => void;
  onToggleHidden: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-opacity",
        offer.hidden && "opacity-50"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />

      {/* Logo */}
      <div className={cn("w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold shrink-0", offer.logoColor)}>
        {offer.logo}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{offer.bank}</span>
          {offer.badge && (
            <Badge variant={offer.badgeVariant ?? "default"} className="text-[10px] px-1.5 py-0">
              {offer.badge}
            </Badge>
          )}
          {offer.highlight && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-primary border-primary/40">
              ⭐ Highlight
            </Badge>
          )}
          {offer.hidden && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Скрыт
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {offer.rate} · {offer.term} · {offer.amount}
        </p>
      </div>

      {/* URL preview */}
      <a
        href={offer.url}
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        title={offer.url}
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>

      {/* Actions */}
      <button
        onClick={onToggleHidden}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        title={offer.hidden ? "Показать" : "Скрыть"}
      >
        {offer.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>

      <button
        onClick={onEdit}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Group Panel ──────────────────────────────────────────────────────────────

function GroupPanel({
  group,
  onUpdateGroup,
}: {
  group: OfferGroup;
  onUpdateGroup: (g: OfferGroup) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editingOffer, setEditingOffer] = useState<ManagedOffer | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftOffer, setDraftOffer] = useState<ManagedOffer>(emptyOffer());

  const openAdd = () => {
    setEditingOffer(null);
    setEditingIndex(null);
    setDraftOffer(emptyOffer());
    setDialogOpen(true);
  };

  const openEdit = (offer: ManagedOffer, idx: number) => {
    setEditingOffer(offer);
    setEditingIndex(idx);
    setDraftOffer({ ...offer });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!draftOffer.bank || !draftOffer.rate || !draftOffer.url) return;
    const updated = [...group.offers];
    if (editingIndex !== null) {
      updated[editingIndex] = draftOffer;
    } else {
      updated.push({ ...draftOffer, order: updated.length });
    }
    onUpdateGroup({ ...group, offers: updated });
    setDialogOpen(false);
  };

  const handleDelete = (idx: number) => {
    const updated = group.offers.filter((_, i) => i !== idx);
    onUpdateGroup({ ...group, offers: updated });
  };

  const handleToggleHidden = (idx: number) => {
    const updated = group.offers.map((o, i) =>
      i === idx ? { ...o, hidden: !o.hidden } : o
    );
    onUpdateGroup({ ...group, offers: updated });
  };

  const visibleCount = group.offers.filter((o) => !o.hidden).length;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{group.label}</p>
          <p className="text-xs text-muted-foreground">
            {group.page} · {visibleCount}/{group.offers.length} офферов показано
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {group.offers.length}
        </Badge>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t bg-muted/20">
          <div className="pt-3 space-y-2">
            {group.offers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Нет офферов. Добавьте первый.</p>
            )}
            {group.offers.map((offer, idx) => (
              <OfferRow
                key={offer.id}
                offer={offer}
                onEdit={() => openEdit(offer, idx)}
                onDelete={() => handleDelete(idx)}
                onToggleHidden={() => handleToggleHidden(idx)}
              />
            ))}
          </div>

          <Button size="sm" variant="outline" onClick={openAdd} className="w-full gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Добавить оффер
          </Button>
        </div>
      )}

      {/* Edit / Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? `Редактировать: ${editingOffer.bank}` : "Новый оффер"}</DialogTitle>
          </DialogHeader>

          <OfferForm offer={draftOffer} onChange={setDraftOffer} />

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={!draftOffer.bank || !draftOffer.rate || !draftOffer.url}
            >
              {editingOffer ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ groups }: { groups: OfferGroup[] }) {
  const total = groups.reduce((s, g) => s + g.offers.length, 0);
  const visible = groups.reduce((s, g) => s + g.offers.filter((o) => !o.hidden).length, 0);
  const highlighted = groups.reduce((s, g) => s + g.offers.filter((o) => o.highlight && !o.hidden).length, 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Всего офферов", value: total, color: "text-foreground" },
        { label: "Показываются", value: visible, color: "text-green-600 dark:text-green-400" },
        { label: "Выделены (highlight)", value: highlighted, color: "text-primary" },
      ].map((s) => (
        <div key={s.label} className="rounded-lg border bg-card px-4 py-3">
          <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminCpa() {
  const [groups, setGroups] = useState<OfferGroup[]>(initialGroups);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    return groups.map((g) => ({
      ...g,
      offers: g.offers.filter(
        (o) =>
          o.bank.toLowerCase().includes(search.toLowerCase()) ||
          o.rate.toLowerCase().includes(search.toLowerCase())
      ),
    }));
  }, [groups, search]);

  const updateGroup = (updated: OfferGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setSaved(false);
  };

  const handleSaveAll = () => {
    // In the future: persist to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const hiddenCount = groups.reduce((s, g) => s + g.offers.filter((o) => o.hidden).length, 0);

  const headerActions = (
    <div className="flex items-center gap-2">
      {hiddenCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {hiddenCount} скрыт{hiddenCount === 1 ? "" : "о"}
        </Badge>
      )}
      <Button size="sm" onClick={handleSaveAll} variant={saved ? "secondary" : "default"}>
        {saved ? "✓ Сохранено" : "Сохранить изменения"}
      </Button>
    </div>
  );

  return (
    <AdminLayout
      title="CPA — офферы банков"
      description="Добавляйте, редактируйте и скрывайте банковские предложения"
      actions={headerActions}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <StatsBar groups={groups} />

        {/* Search */}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию банка или ставке…"
        />

        {/* Groups */}
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <GroupPanel key={group.id} group={group} onUpdateGroup={updateGroup} />
          ))}
        </div>

        {/* Info footer */}
        <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">ℹ️ Как это работает</p>
          <ul className="space-y-0.5 list-disc list-inside">
            <li>Скрытые офферы не показываются пользователям на страницах калькуляторов</li>
            <li>Выделенные (Highlight) карточки отображаются с синей рамкой и выделенной кнопкой</li>
            <li>UTM-параметры добавляются автоматически: <code className="bg-muted px-1 rounded">utm_source=numlix&utm_medium=cpa_block</code></li>
            <li>После сохранения изменений подключите backend для постоянного хранения</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
