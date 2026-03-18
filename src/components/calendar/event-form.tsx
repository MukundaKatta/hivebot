"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import type { CalendarEvent } from "@/types";

interface EventFormProps {
  event?: Partial<CalendarEvent>;
  onSubmit: (event: Partial<CalendarEvent>) => Promise<void>;
  onCancel: () => void;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [startTime, setStartTime] = useState(event?.start_time ? event.start_time.slice(0, 16) : "");
  const [endTime, setEndTime] = useState(event?.end_time ? event.end_time.slice(0, 16) : "");
  const [allDay, setAllDay] = useState(event?.all_day || false);
  const [location, setLocation] = useState(event?.location || "");
  const [reminderMinutes, setReminderMinutes] = useState(event?.reminder_minutes || 30);
  const [color, setColor] = useState(event?.color || "#4870ea");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...event,
        title,
        description,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        all_day: allDay,
        location,
        reminder_minutes: reminderMinutes,
        color,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" required className="mt-1" />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event description..." className="mt-1" rows={2} />
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={allDay} onCheckedChange={setAllDay} />
        <Label>All day event</Label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{allDay ? "Start Date" : "Start"}</Label>
          <Input type={allDay ? "date" : "datetime-local"} value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label>{allDay ? "End Date" : "End"}</Label>
          <Input type={allDay ? "date" : "datetime-local"} value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="mt-1" />
        </div>
      </div>

      <div>
        <Label>Location</Label>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Reminder (minutes before)</Label>
          <Input type="number" value={reminderMinutes} onChange={(e) => setReminderMinutes(Number(e.target.value))} min={0} className="mt-1" />
        </div>
        <div>
          <Label>Color</Label>
          <div className="mt-1 flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border" />
            <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="hive" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {event?.id ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
