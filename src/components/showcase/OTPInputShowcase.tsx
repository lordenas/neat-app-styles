import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function OTPInputShowcase() {
  const [value4, setValue4] = useState("");
  const [value6, setValue6] = useState("");
  const [autoValue, setAutoValue] = useState("");

  const handleAutoComplete = (val: string) => {
    setAutoValue(val);
    if (val.length === 6) {
      toast.success("Код подтверждён!", { description: `Введённый код: ${val}` });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>4 цифры</Label>
          <InputOTP maxLength={4} value={value4} onChange={setValue4}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          {value4 && (
            <p className="text-xs text-muted-foreground">
              Введено: <Badge variant="secondary" size="sm" className="font-mono">{value4}</Badge>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>6 цифр с разделителем</Label>
          <InputOTP maxLength={6} value={value6} onChange={setValue6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="space-y-2">
          <Label>Автосабмит (6 цифр)</Label>
          <InputOTP maxLength={6} value={autoValue} onChange={handleAutoComplete}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-xs text-muted-foreground">Toast при вводе всех 6 цифр</p>
        </div>

        <div className="space-y-2">
          <Label>Disabled</Label>
          <InputOTP maxLength={4} disabled value="12">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <p className="helper-text">
        OTP-поле на базе <code className="text-xs bg-muted px-1 py-0.5 rounded">input-otp</code>. 
        Компоненты: <code className="text-xs bg-muted px-1 py-0.5 rounded">InputOTP</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">InputOTPGroup</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">InputOTPSlot</code>,{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">InputOTPSeparator</code>.
      </p>
    </div>
  );
}
