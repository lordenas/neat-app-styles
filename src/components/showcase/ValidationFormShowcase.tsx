import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
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

/**
 * Пример формы с валидацией через Yup + react-hook-form.
 *
 * Демонстрирует:
 * - Текстовые поля с валидацией (имя, email, телефон)
 * - Select через Controller
 * - Checkbox (согласие)
 * - FileUploadAvatar через Controller
 * - Вывод ошибок под каждым полем
 * - Toast при успешной отправке
 */

const schema = yup.object({
  name: yup
    .string()
    .required("Имя обязательно")
    .min(2, "Минимум 2 символа")
    .max(50, "Максимум 50 символов"),
  email: yup
    .string()
    .required("Email обязателен")
    .email("Некорректный email"),
  phone: yup
    .string()
    .required("Телефон обязателен")
    .matches(/^\+?[\d\s\-()]{7,18}$/, "Некорректный номер телефона"),
  role: yup
    .string()
    .required("Выберите роль"),
  avatar: yup
    .array()
    .of(yup.mixed<File>().required())
    .min(1, "Загрузите фото")
    .required(),
  agree: yup
    .boolean()
    .oneOf([true], "Необходимо согласие")
    .required(),
});

type FormValues = yup.InferType<typeof schema>;

export function ValidationFormShowcase() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
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
    // Simulate async submit
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Форма отправлена", {
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
          {...register("name")}
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
          {...register("email")}
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
          {...register("phone")}
        />
      </div>

      {/* Role select */}
      <div>
        <Label>Роль *</Label>
        <Controller
          name="role"
          control={control}
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

      {/* Avatar via FileUploadAvatar */}
      <div>
        <Label>Фото *</Label>
        <div className="mt-1.5">
          <Controller
            name="avatar"
            control={control}
            render={({ field }) => (
              <FileUploadAvatar
                value={field.value as File[]}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                accept="image/png,image/jpeg,image/webp"
                acceptLabel="PNG, JPG, WebP"
                maxSizeMB={5}
                label="Загрузите фото профиля"
              />
            )}
          />
        </div>
        <p className="text-xs text-destructive mt-1.5 min-h-[1rem]" role="alert">
          {errors.avatar?.message ?? "\u00A0"}
        </p>
      </div>

      {/* Agreement checkbox */}
      <div>
        <Controller
          name="agree"
          control={control}
          render={({ field }) => (
            <div className="flex items-start gap-2">
              <Checkbox
                id="vf-agree"
                checked={field.value}
                onCheckedChange={field.onChange}
                error={errors.agree?.message ?? ""}
              />
              <Label htmlFor="vf-agree" className="font-normal cursor-pointer text-sm leading-tight">
                Я согласен на обработку персональных данных *
              </Label>
            </div>
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
