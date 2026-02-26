import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Megaphone, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Events() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [titleEs, setTitleEs] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");

  const { data: events, refetch } = trpc.events.list.useQuery();
  const createMutation = trpc.events.create.useMutation({
    onSuccess: () => { toast.success("Event added!"); refetch(); setOpen(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => { toast.success("Event removed"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => { setTitle(""); setTitleEs(""); setDescription(""); setEventDate(""); };

  const handleCreate = () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!eventDate) return toast.error("Event date is required");
    createMutation.mutate({
      title: title.trim(),
      titleEs: titleEs.trim() || undefined,
      description: description.trim() || undefined,
      eventDate: new Date(eventDate).getTime(),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage upcoming events and announcements</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus size={16} /> Add Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Event Title (English) *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Valentine's Day Dinner Special" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Event Title (Spanish)</Label>
                  <Input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} placeholder="e.g. Cena Especial de San Valentín" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the event..." />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Event Date</Label>
                  <Input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                </div>
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "Adding..." : "Add Event"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {events?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Megaphone size={36} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No events yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add an upcoming event to generate promotional posts</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events?.map((event) => (
              <Card key={event.id} className="border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">{event.title}</CardTitle>
                      {event.titleEs && <p className="text-xs text-muted-foreground">{event.titleEs}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => navigate(`/generate?type=event&id=${event.id}`)}
                      >
                        <Sparkles size={13} className="text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteMutation.mutate({ id: event.id })}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                  {event.eventDate && (
                    <p className="text-xs font-medium text-purple-700 mt-1">
                      📅 {new Date(event.eventDate).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
