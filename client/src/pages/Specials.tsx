import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Sparkles, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Specials() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [titleEs, setTitleEs] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");

  const { data: specials, refetch } = trpc.specials.list.useQuery();
  const createMutation = trpc.specials.create.useMutation({
    onSuccess: () => { toast.success("Special added!"); refetch(); setOpen(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.specials.delete.useMutation({
    onSuccess: () => { toast.success("Special removed"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => { setTitle(""); setTitleEs(""); setDescription(""); setPrice(""); setValidFrom(""); setValidTo(""); };

  const handleCreate = () => {
    if (!title.trim()) return toast.error("Title is required");
    createMutation.mutate({
      title: title.trim(),
      titleEs: titleEs.trim() || undefined,
      description: description.trim() || undefined,
      price: price ? parseFloat(price) : undefined,
      validFrom: validFrom ? new Date(validFrom).getTime() : undefined,
      validTo: validTo ? new Date(validTo).getTime() : undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Weekly Specials</h1>
            <p className="text-muted-foreground text-sm mt-1">Add and manage featured dishes and daily specials</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus size={16} /> Add Special</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Weekly Special</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Title (English) *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Friday Night Prime Rib" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Title (Spanish)</Label>
                  <Input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} placeholder="e.g. Costilla de Res del Viernes" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Describe the special..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Special Price ($)</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="12.99" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Valid From</Label>
                    <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Valid To</Label>
                    <Input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? "Adding..." : "Add Special"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {specials?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Star size={36} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No specials yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add a weekly special to generate posts about it</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specials?.map((special) => (
              <Card key={special.id} className="border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">{special.title}</CardTitle>
                      {special.titleEs && <p className="text-xs text-muted-foreground">{special.titleEs}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => navigate(`/generate?type=special&id=${special.id}`)}
                        title="Generate post"
                      >
                        <Sparkles size={13} className="text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteMutation.mutate({ id: special.id })}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {special.description && <p className="text-xs text-muted-foreground">{special.description}</p>}
                  {special.price && (
                    <p className="text-sm font-bold text-primary mt-1">${Number(special.price).toFixed(2)}</p>
                  )}
                  {(special.validFrom || special.validTo) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {special.validFrom && `From ${new Date(special.validFrom).toLocaleDateString()}`}
                      {special.validTo && ` · Until ${new Date(special.validTo).toLocaleDateString()}`}
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
