import { forwardRef, useState, useEffect } from "react";
import { Input } from "./Input";
import { cn } from "@/lib/utils";

interface TimeInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  value?: string;
  onChange?: (value: string) => void;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  ({ value = "", onChange, className, disabled, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(value || "");

    // Nếu prop value thay đổi từ ngoài → sync lại state hiển thị
    useEffect(() => {
      setDisplayValue(value || "");
    }, [value]);

    const formatTime = (input: string): string => {
      const numbers = input.replace(/\D/g, "");
      if (numbers.length < 4) return input;

      let hour = parseInt(numbers.substring(0, 2));
      let minute = parseInt(numbers.substring(2, 4));

      hour = isNaN(hour) ? 0 : Math.min(hour, 23);
      minute = isNaN(minute) ? 0 : Math.min(minute, 59);

      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setDisplayValue(input);
    };

    const handleBlur = () => {
      if (!displayValue) {
        onChange?.("");
        return;
      }

      const formatted = formatTime(displayValue);
      setDisplayValue(formatted);
      onChange?.(formatted);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9:]*"
        placeholder="VD: 08:00"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        maxLength={5}
        className={cn(
          "font-mono text-sm placeholder:text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

TimeInput.displayName = "TimeInput";
