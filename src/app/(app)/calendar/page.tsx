"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { EventForm } from "@/components/calendar/event-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { CalendarEvent } from "@/types";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch("/api/calendar");
    const json = await res.json();
    if (json.data) setEvents(json.data);
  };

  const handleCreateEvent = async (event: Partial<CalendarEvent>) => {
    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    if (res.ok) {
      fetchEvents();
      setShowEventForm(false);
      setSelectedDate(null);
    }
  };

  const handleUpdateEvent = async (event: Partial<CalendarEvent>) => {
    if (!selectedEvent) return;
    await fetch(`/api/calendar/${selectedEvent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    fetchEvents();
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async (id: string) => {
    await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    fetchEvents();
    setSelectedEvent(null);
  };

  return (
    <div>
      <Header
        title="Calendar"
        description="View and manage your events"
        actions={
          <Button variant="hive" onClick={() => setShowEventForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        }
      />
      <div className="p-6">
        <CalendarView
          events={events}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setShowEventForm(true);
          }}
          onSelectEvent={setSelectedEvent}
          onCreateEvent={() => setShowEventForm(true)}
        />
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>
          <EventForm
            event={
              selectedDate
                ? {
                    start_time: selectedDate.toISOString(),
                    end_time: new Date(selectedDate.getTime() + 3600000).toISOString(),
                  }
                : undefined
            }
            onSubmit={handleCreateEvent}
            onCancel={() => setShowEventForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <>
              <EventForm
                event={selectedEvent}
                onSubmit={handleUpdateEvent}
                onCancel={() => setSelectedEvent(null)}
              />
              <Button
                variant="destructive"
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="mt-2"
              >
                Delete Event
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
