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
      <div className="space-y-1.5">
        <Label htmlFor="vf-name">Имя *</Label>
        <Input
          id="vf-name"
          placeholder="Иван Иванов"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "vf-name-err" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="vf-name-err" className="text-xs text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="vf-email">Email *</Label>
        <Input
          id="vf-email"
          type="email"
          placeholder="ivan@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "vf-email-err" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="vf-email-err" className="text-xs text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="vf-phone">Телефон *</Label>
        <Input
          id="vf-phone"
          type="tel"
          placeholder="+7 (999) 123-45-67"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "vf-phone-err" : undefined}
          {...register("phone")}
        />
        {errors.phone && (
          <p id="vf-phone-err" className="text-xs text-destructive" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Role select */}
      <div className="space-y-1.5">
        <Label>Роль *</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                className="w-full"
                aria-invalid={!!errors.role}
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
        {errors.role && (
          <p className="text-xs text-destructive" role="alert">
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Avatar via FileUploadAvatar */}
      <div className="space-y-1.5">
        <Label>Фото *</Label>
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
        {errors.avatar && (
          <p className="text-xs text-destructive" role="alert">
            {errors.avatar.message}
          </p>
        )}
      </div>

      {/* Agreement checkbox */}
      <div className="space-y-1.5">
        <Controller
          name="agree"
          control={control}
          render={({ field }) => (
            <div className="flex items-start gap-2">
              <Checkbox
                id="vf-agree"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={!!errors.agree}
              />
              <Label htmlFor="vf-agree" className="font-normal cursor-pointer text-sm leading-tight">
                Я согласен на обработку персональных данных *
              </Label>
            </div>
          )}
        />
        {errors.agree && (
          <p className="text-xs text-destructive" role="alert">
            {errors.agree.message}
          </p>
        )}
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
