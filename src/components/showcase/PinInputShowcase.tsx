import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

export function PinInputShowcase() {
  const [code, setCode] = useState("");
  const [license, setLicense] = useState("");

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Промокод (4 символа)</Label>
        <InputOTP maxLength={4} value={code} onChange={setCode}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
        {code.length === 4 && (
          <p className="text-xs text-[hsl(var(--success))]">Код введён: {code}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Лицензионный ключ (XXXX-XXXX-XXXX)</Label>
        <InputOTP maxLength={12} value={license} onChange={setLicense}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
            <InputOTPSlot index={6} />
            <InputOTPSlot index={7} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={8} />
            <InputOTPSlot index={9} />
            <InputOTPSlot index={10} />
            <InputOTPSlot index={11} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  );
}
