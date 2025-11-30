import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

interface DateRangeFilterProps {
  fromDate: Date;
  toDate: Date;
  preset: string;
  onChange: (fromDate: Date, toDate: Date, preset: string) => void;
}

export default function DateRangeFilter({
  fromDate,
  toDate,
  preset,
  onChange,
}: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(false);

  const presets = [
    { label: "30 ngày", value: "30days", days: 30 },
    { label: "3 tháng", value: "3months", months: 3 },
    { label: "6 tháng", value: "6months", months: 6 },
    { label: "1 năm", value: "1year", months: 12 },
  ];

  const handlePresetClick = (presetValue: string, days?: number, months?: number) => {
    const to = new Date();
    let from = new Date();

    if (days) {
      from.setDate(from.getDate() - days);
    } else if (months) {
      from.setMonth(from.getMonth() - months);
    }

    onChange(from, to, presetValue);
    setShowCustom(false);
  };

  const handleCustomDateChange = (type: "from" | "to", value: string) => {
    const newDate = new Date(value);
    if (type === "from") {
      onChange(newDate, toDate, "custom");
    } else {
      onChange(fromDate, newDate, "custom");
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium mr-2">Khoảng thời gian:</span>

          {presets.map((p) => (
            <Button
              key={p.value}
              variant={preset === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(p.value, p.days, p.months)}
            >
              {p.label}
            </Button>
          ))}

          <Button
            variant={preset === "custom" || showCustom ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCustom(!showCustom)}
          >
            Tùy chỉnh
          </Button>
        </div>

        {(showCustom || preset === "custom") && (
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Từ ngày</label>
              <Input
                type="date"
                value={fromDate.toISOString().split("T")[0]}
                onChange={(e) => handleCustomDateChange("from", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Đến ngày</label>
              <Input
                type="date"
                value={toDate.toISOString().split("T")[0]}
                onChange={(e) => handleCustomDateChange("to", e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
