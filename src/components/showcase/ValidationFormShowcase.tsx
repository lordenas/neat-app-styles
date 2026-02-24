import { useForm, Controller } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploadAvatar } from "@/components/ui/file-upload";
import { Send } from "lucide-react";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: File[];
  agree: boolean;
}

export function ValidationFormShowcase() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      avatar: [],
      agree: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 1000));
    toast({
      title: "Форма отправлена",
      description: `${data.name} (${data.email})`,
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg" noValidate>
      {/* Name */}
      <div>
        <Label htmlFor="vf-name">Имя *</Label>
        <Input
          id="vf-name"
          placeholder="Иван Иванов"
          className="mt-1.5"
          error={errors.name?.message ?? ""}
          {...register("name", {
            required: "Имя обязательно",
            minLength: { value: 2, message: "Минимум 2 символа" },
            maxLength: { value: 50, message: "Максимум 50 символов" },
          })}
        />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="vf-email">Email *</Label>
        <Input
          id="vf-email"
          type="email"
          placeholder="ivan@example.com"
          className="mt-1.5"
          error={errors.email?.message ?? ""}
          {...register("email", {
            required: "Email обязателен",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Некорректный email" },
          })}
        />
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="vf-phone">Телефон *</Label>
        <Input
          id="vf-phone"
          type="tel"
          placeholder="+7 (999) 123-45-67"
          className="mt-1.5"
          error={errors.phone?.message ?? ""}
          {...register("phone", {
            required: "Телефон обязателен",
            pattern: { value: /^\+?[\d\s\-()]{7,18}$/, message: "Некорректный номер телефона" },
          })}
        />
      </div>

      {/* Role select */}
      <div>
        <Label>Роль *</Label>
        <Controller
          name="role"
          control={control}
          rules={{ required: "Выберите роль" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="vf-role"
                className="w-full mt-1.5"
                error={errors.role?.message ?? ""}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Разработчик</SelectItem>
                <SelectItem value="designer">Дизайнер</SelectItem>
                <SelectItem value="manager">Менеджер</SelectItem>
                <SelectItem value="analyst">Аналитик</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <Label>Фото *</Label>
        <div className="mt-1.5">
          <Controller
            name="avatar"
            control={control}
            rules={{ validate: (v) => (v && v.length > 0) || "Загрузите фото" }}
            render={({ field }) => (
              <FileUploadAvatar
                id="vf-avatar"
                value={field.value as File[]}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                accept="image/png,image/jpeg,image/webp"
                acceptLabel="PNG, JPG, WebP"
                maxSizeMB={5}
                label="Загрузите фото профиля"
                error={errors.avatar?.message ?? ""}
              />
            )}
          />
        </div>
      </div>

      {/* Agreement checkbox */}
      <div>
        <Controller
          name="agree"
          control={control}
          rules={{ validate: (v) => v === true || "Необходимо согласие" }}
          render={({ field }) => (
            <Checkbox
              id="vf-agree"
              checked={field.value}
              onCheckedChange={field.onChange}
              error={errors.agree?.message ?? ""}
              label="Я согласен на обработку персональных данных *"
            />
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" icon={<Send />} disabled={isSubmitting}>
          {isSubmitting ? "Отправка..." : "Отправить"}
        </Button>
        <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>
          Сбросить
        </Button>
      </div>
    </form>
  );
}
