"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, updateEventSchema } from "@/lib/validations/event";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

type EventFormData = {
  name: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  venueName: string;
  venueAddress?: string | null;
  venueLatitude: number;
  venueLongitude: number;
  checkInBufferMins: number;
  checkOutBufferMins: number;
  status?: "Active" | "Completed" | "Cancelled";
};

interface EventFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading?: boolean;
}

export function EventForm({
  mode,
  defaultValues,
  onSubmit,
  isLoading = false,
}: EventFormProps) {
  const schema = mode === "create" ? createEventSchema : updateEventSchema;

  const form = useForm<EventFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues || {
      name: "",
      description: "",
      checkInBufferMins: 30,
      checkOutBufferMins: 30,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Annual Tech Conference 2025" {...field} />
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
                  placeholder="Enter event description..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP p")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                    <div className="border-t p-3">
                      <Input
                        type="time"
                        value={
                          field.value
                            ? format(new Date(field.value), "HH:mm")
                            : ""
                        }
                        onChange={(e) => {
                          if (field.value) {
                            const date = new Date(field.value);
                            const [hours, minutes] = e.target.value.split(":");
                            date.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(date.toISOString());
                          }
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP p")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                    <div className="border-t p-3">
                      <Input
                        type="time"
                        value={
                          field.value
                            ? format(new Date(field.value), "HH:mm")
                            : ""
                        }
                        onChange={(e) => {
                          if (field.value) {
                            const date = new Date(field.value);
                            const [hours, minutes] = e.target.value.split(":");
                            date.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(date.toISOString());
                          }
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-sm font-medium">Venue Information</h3>

          <FormField
            control={form.control}
            name="venueName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue Name</FormLabel>
                <FormControl>
                  <Input placeholder="Main Auditorium" {...field} />
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
                    placeholder="123 University Ave"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="venueLatitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="14.5995"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>GPS coordinate</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venueLongitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="120.9842"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>GPS coordinate</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="checkInBufferMins"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-in Buffer (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Allow check-in this many minutes before start time
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
                <FormLabel>Check-out Buffer (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Allow check-in this many minutes after end time
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : mode === "create"
                ? "Create Event"
                : "Update Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
