"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventCreateSchema,
  eventUpdateSchema,
  type EventCreate,
  type EventUpdate,
} from "@/lib/validations/event-management";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createEvent } from "@/actions/events/create";
import { updateEvent } from "@/actions/events/update";
import { Loader2 } from "lucide-react";

const FALLBACK_EVENT_VALUES: EventCreate = {
  name: "",
  description: "",
  startDateTime: "",
  endDateTime: "",
  venueName: "",
  venueAddress: "",
  venueLatitude: 0,
  venueLongitude: 0,
  checkInBufferMins: 30,
  checkOutBufferMins: 30,
};

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  eventId?: string;
  initialData?: Partial<EventUpdate>;
  mode?: "create" | "edit";
}

export function EventForm({
  open,
  onOpenChange,
  onSuccess,
  eventId,
  initialData,
  mode = "create",
}: EventFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const defaultValues = React.useMemo(() => ({ ...FALLBACK_EVENT_VALUES }), []);

  const form = useForm<EventCreate | EventUpdate>({
    resolver: zodResolver(
      mode === "create" ? eventCreateSchema : eventUpdateSchema,
    ),
    defaultValues: initialData
      ? { ...defaultValues, ...initialData }
      : { ...defaultValues },
  });

  React.useEffect(() => {
    if (!open) {
      return;
    }

    if (initialData) {
      form.reset({ ...defaultValues, ...initialData });
    } else {
      form.reset({ ...defaultValues });
    }
  }, [defaultValues, form, initialData, open]);

  const handleSubmit = async (data: EventCreate | EventUpdate) => {
    try {
      setIsSubmitting(true);

      const result =
        mode === "create"
          ? await createEvent(data as EventCreate)
          : await updateEvent(eventId!, data as EventUpdate);

      if (!result.success) {
        throw new Error(result.error || `Failed to ${mode} event`);
      }

      toast({
        title: `Event ${mode === "create" ? "created" : "updated"}`,
        description: `The event has been ${mode === "create" ? "created" : "updated"} successfully.`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${mode} event`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Event" : "Edit Event"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details below to create a new event."
              : "Update the event details below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter event name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter event description"
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venueName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter venue name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venueAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter venue address"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="venueLatitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          if (rawValue === "") {
                            field.onChange(undefined);
                            return;
                          }
                          const parsed = parseFloat(rawValue);
                          field.onChange(
                            Number.isNaN(parsed) ? undefined : parsed,
                          );
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="venueLongitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          if (rawValue === "") {
                            field.onChange(undefined);
                            return;
                          }
                          const parsed = parseFloat(rawValue);
                          field.onChange(
                            Number.isNaN(parsed) ? undefined : parsed,
                          );
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkInBufferMins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Buffer (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="120"
                        {...field}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          if (rawValue === "") {
                            field.onChange(undefined);
                            return;
                          }
                          const parsed = parseInt(rawValue, 10);
                          field.onChange(
                            Number.isNaN(parsed) ? undefined : parsed,
                          );
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      How early can students check in before the event starts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkOutBufferMins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out Buffer (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="120"
                        {...field}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          if (rawValue === "") {
                            field.onChange(undefined);
                            return;
                          }
                          const parsed = parseInt(rawValue, 10);
                          field.onChange(
                            Number.isNaN(parsed) ? undefined : parsed,
                          );
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      How late can students check out after the event ends
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "create" ? "Create Event" : "Update Event"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
