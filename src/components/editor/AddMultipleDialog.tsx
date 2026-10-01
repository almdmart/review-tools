"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { senderSchema, type Sender } from "@/lib/schema";
import { addQuickMessage } from "@/store/project-store";
import { useProjectStore } from "@/store/project-store";

const formSchema = z.object({
  count: z.number().int().min(1).max(30),
  sender: senderSchema,
});

type FormValues = z.infer<typeof formSchema>;

export function AddMultipleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const participantName = useProjectStore((state) => state.participant.name);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { count: 3, sender: "participant" },
  });

  function submit(values: FormValues) {
    addQuickMessage(values.sender, values.count);
    onOpenChange(false);
    form.reset(values);
  }

  const name = participantName.trim() || "Participant";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add multiple messages</DialogTitle>
          <DialogDescription>Create several empty text messages at the end of the conversation.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-1.5">
            <Label htmlFor="bulk-count">How many</Label>
            <input
              id="bulk-count"
              type="number"
              min={1}
              max={30}
              className="h-8 rounded-lg border border-input px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...form.register("count", { valueAsNumber: true })}
            />
            {form.formState.errors.count ? (
              <p className="text-xs text-destructive">{form.formState.errors.count.message}</p>
            ) : null}
          </div>
          <fieldset className="grid gap-1.5">
            <legend className="text-sm font-medium">Sender</legend>
            <div className="flex gap-2">
              {(["participant", "self"] as Sender[]).map((sender) => (
                <label key={sender} className="flex items-center gap-1.5 text-sm">
                  <input type="radio" value={sender} {...form.register("sender")} />
                  {sender === "self" ? "Me" : name}
                </label>
              ))}
            </div>
          </fieldset>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add messages</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
