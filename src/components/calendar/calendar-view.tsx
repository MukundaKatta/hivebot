"use client";

import React, { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types";

interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectDate?: (date: Date) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onCreateEvent?: () => void;
}

export function CalendarView({ events, onSelectDate, onSelectEvent, onCreateEvent }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start_time), date));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onSelectDate?.(date);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex items-center gap-2">
            {onCreateEvent && (
              <Button variant="outline" size="sm" onClick={onCreateEvent} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Event
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2 text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "relative flex min-h-[80px] flex-col items-start border-t p-1.5 text-left transition-colors hover:bg-accent/50",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground/30",
                  isSelected && "bg-hive-50 dark:bg-hive-950/20"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday(day) && "bg-hive-600 text-white font-bold",
                    isSelected && !isToday(day) && "bg-hive-100 text-hive-700 dark:bg-hive-900 dark:text-hive-200"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-0.5 w-full space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent?.(event);
                      }}
                      className="w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium text-white"
                      style={{ backgroundColor: event.color || "#4870ea" }}
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
