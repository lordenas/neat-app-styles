

## Улучшения UI-Kit — Раунд 5

### Реализовано

1. **Alert: вариант `loading`** — автоматический спиннер Loader2, серый фон, текст muted
2. **AvatarGroup** — группировка аватаров с overlap, проп `max` и счётчик "+N"  
3. **Tabs: вариант `vertical`** — вертикальная ориентация для настроек/профилей
4. **InputGroup + InputAddon** — композитное поле с текстовым аддоном (https://, ₽, .ru)

### Уже существовало (не требовало изменений)

5. **Badge dot** — уже реализован как boolean проп `dot` с `bg-current`
6. **Textarea autoResize** — уже реализован с `maxRows`

### Обновлённые файлы

- `src/components/ui/alert.tsx` — добавлен вариант `loading`
- `src/components/ui/avatar.tsx` — добавлен `AvatarGroup`
- `src/components/ui/tabs.tsx` — добавлен вариант `vertical` в `tabsListVariants` и `tabsTriggerVariants`
- `src/components/ui/input-group.tsx` — новый файл: `InputGroup` + `InputAddon`
- `src/components/ui/index.ts` — экспорт `AvatarGroup`, `InputGroup`, `InputAddon`
- `src/components/showcase/TabsShowcase.tsx` — showcase для vertical tabs
- `src/components/showcase/InputsShowcase.tsx` — showcase для InputGroup + Textarea autoResize
- `src/components/showcase/ModalAlertsShowcase.tsx` — showcase для Alert loading
- `src/components/showcase/SkeletonShowcase.tsx` — showcase для AvatarGroup
- `COMPONENTS.md` — документация всех новых компонентов
- `.cursorrules` — шпаргалка InputGroup, AvatarGroup, Tabs vertical
