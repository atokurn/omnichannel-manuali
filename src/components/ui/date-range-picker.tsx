"use client"

import * as React from "react"
import { addDays, format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  placeholder?: string
}

type DatePreset = {
  label: string;
  value: string;
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
  placeholder = "Pilih tanggal",
}: DatePickerWithRangeProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  const datePresets: DatePreset[] = [
    { label: "All Time", value: "all-time" },
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Week", value: "this-week" },
    { label: "This Month", value: "this-month" },
    { label: "This Year", value: "this-year" },
    { label: "Last Week", value: "last-week" },
    { label: "Last Month", value: "last-month" },
    { label: "Last 7 Days", value: "last-7-days" },
    { label: "Last 30 Days", value: "last-30-days" },
    { label: "Last 90 Days", value: "last-90-days" },
  ]

  const handlePresetChange = (preset: string) => {
    const today = new Date()
    let newRange: DateRange | undefined

    switch (preset) {
      case "all-time":
        newRange = undefined
        break
      case "today":
        newRange = {
          from: startOfDay(today),
          to: endOfDay(today),
        }
        break
      case "yesterday":
        const yesterday = addDays(today, -1)
        newRange = {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        }
        break
      case "this-week":
        newRange = {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 }),
        }
        break
      case "this-month":
        newRange = {
          from: startOfMonth(today),
          to: endOfMonth(today),
        }
        break
      case "this-year":
        newRange = {
          from: startOfYear(today),
          to: endOfYear(today),
        }
        break
      case "last-week":
        const lastWeekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), -7)
        const lastWeekEnd = addDays(endOfWeek(today, { weekStartsOn: 1 }), -7)
        newRange = {
          from: lastWeekStart,
          to: lastWeekEnd,
        }
        break
      case "last-month":
        const lastMonthStart = startOfMonth(addDays(startOfMonth(today), -1))
        const lastMonthEnd = endOfMonth(lastMonthStart)
        newRange = {
          from: lastMonthStart,
          to: lastMonthEnd,
        }
        break
      case "last-7-days":
        newRange = {
          from: startOfDay(addDays(today, -6)),
          to: endOfDay(today),
        }
        break
      case "last-30-days":
        newRange = {
          from: startOfDay(addDays(today, -29)),
          to: endOfDay(today),
        }
        break
      case "last-90-days":
        newRange = {
          from: startOfDay(addDays(today, -89)),
          to: endOfDay(today),
        }
        break
      default:
        return
    }

    onDateChange(newRange)
    setIsPopoverOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: id })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: id })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: id })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="w-48 border-r max-h-[350px] overflow-y-auto">
              <div className="p-2">
                {datePresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="ghost"
                    className="w-full justify-start text-left mb-1"
                    onClick={() => handlePresetChange(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onDateChange}
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}