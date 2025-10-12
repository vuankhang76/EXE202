"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"

type Props<T extends string> = {
  selectedValue: T;
  onSelectedValueChange: (value: T) => void;
  items: { value: T; label: string }[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  hasSearched?: boolean; // Thêm prop để biết đã search hay chưa
};

export function Combobox<T extends string>({
  selectedValue,
  onSelectedValueChange,
  items,
  isLoading = false,
  emptyMessage = "Không tìm thấy kết quả.",
  placeholder = "Chọn một mục...",
  searchPlaceholder = "Tìm kiếm...",
  className,
  disabled = false,
  searchValue,
  onSearchValueChange,
  hasSearched = false,
}: Props<T>) {
  const [open, setOpen] = React.useState(false)

  const selectedItem = items.find((item) => item.value === selectedValue)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between ",
            !selectedValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate flex-1 text-left">
            {selectedItem ? selectedItem.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9"
            value={searchValue}
            onValueChange={onSearchValueChange}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                {items.length > 0 ? (
                  <CommandGroup>
                    {items.map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.label}
                        onSelect={() => {
                          onSelectedValueChange(
                            selectedValue === item.value ? ("" as T) : (item.value as T)
                          )
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedValue === item.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {item.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : hasSearched && items.length === 0 ? (
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                ) : null}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}