import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle, XCircle, RefreshCw, AlertTriangle, ExternalLink,
  Facebook, Instagram, Plus, Trash2, Edit2, Shield
} from "lucide-react";
import { toast } from "sonner";

type ClientPageRow = {
  id: number;
  name: string;
  facebookPageId: string | null;
  instagramAccountId: string | null;
  isActive: boolean;
  isPrimary: boolean;
  tokenValid: boolean;
  tokenPermanent: boolean;
  tokenExpiresAt: number | null;
};

export default function Settings() {
  const utils = trpc.useUtils();

  // ── Token status (primary page) ──────────────────────────────────────────────
  const { data: tokenStatus } = trpc.settings.tokenStatus.useQuery(undefined, { refetchInterval: 60_000 });

  // ── Client pages ─────────────────────────────────────────────────────────────
  const { data: clientPages, isLoading: pagesLoading } = trpc.settings.listClientPages.useQuery();

  const savePageMutation = trpc.settings.saveClientPage.useMutation({
    onSuccess: () => {
      toast.success("Page saved successfully");
      utils.settings.listClientPages.invalidate();
      utils.settings.tokenStatus.invalidate();
      setEditDialog(null);
    },
    onError: (err) => toast.error(`Save failed: ${err.message}`),
  });

  const removePageMutation = trpc.settings.removeClientPage.useMutation({
    onSuccess: () => {
      toast.success("Page removed");
      utils.settings.listClientPages.invalidate();
    },
    onError: (err) => toast.error(`Remove failed: ${err.message}`),
  });

  // ── Edit dialog state ─────────────────────────────────────────────────────────
  const [editDialog, setEditDialog] = useState<{
    id?: number;
    name: string;
    facebookPageId: string;
    facebookPageToken: string;
    instagramAccountId: string;
    isActive: boolean;
    isPrimary: boolean;
  } | null>(null);

  const openNew = () =>
    setEditDialog({ name: "", facebookPageId: "", facebookPageToken: "", instagramAccountId: "", isActive: true, isPrimary: false });

  const openEdit = (page: ClientPageRow) =>
    setEditDialog({
      id: page.id,
      name: page.name,
      facebookPageId: page.facebookPageId ?? "",
      facebookPageToken: "", // never pre-fill token
      instagramAccountId: page.instagramAccountId ?? "",
      isActive: page.isActive,
      isPrimary: page.isPrimary,
    });

  const handleSave = () => {
    if (!editDialog) return;
    savePageMutation.mutate({
      id: editDialog.id,
      name: editDialog.name,
      facebookPageId: editDialog.facebookPageId || undefined,
      facebookPageToken: editDialog.facebookPageToken || undefined,
      instagramAccountId: editDialog.instagramAccountId || undefined,
      isActive: editDialog.isActive,
      isPrimary: editDialog.isPrimary,
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage connected social media pages and credentials.</p>
      </div>

      {/* Primary token status banner */}
      {tokenStatus && (
        tokenStatus.valid ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
            <CheckCircle size={18} className="flex-shrink-0 text-green-500" />
            <div className="flex-1 text-sm">
              <span className="font-semibold">Primary page token active</span> —{" "}
              {(tokenStatus as { permanent?: boolean }).permanent
                ? "Permanent token — never expires."
                : `${tokenStatus.daysLeft} days remaining.`}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <AlertTriangle size={18} className="flex-shrink-0 text-red-500" />
            <div className="flex-1 text-sm">
              <span className="font-semibold">Primary token invalid:</span>{" "}
              {tokenStatus.error ?? "Token has expired or been revoked."}
            </div>
          </div>
        )
      )}

      {/* Connected Pages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              Connected Facebook Pages
            </CardTitle>
            <CardDescription>All pages with stored access tokens. The primary page is used for Sopris Restaurant posting.</CardDescription>
          </div>
          <Button size="sm" onClick={openNew} className="gap-1 shrink-0">
            <Plus size={14} /> Add Page
          </Button>
        </CardHeader>
        <CardContent>
          {pagesLoading ? (
            <div className="text-sm text-muted-foreground py-4 text-center">Loading pages...</div>
          ) : !clientPages?.length ? (
            <div className="text-sm text-muted-foreground py-4 text-center">No pages configured yet.</div>
          ) : (
            <div className="space-y-3">
              {clientPages.map((page) => (
                <div key={page.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{page.name}</span>
                      {page.isPrimary && (
                        <Badge variant="default" className="text-xs gap-1">
                          <Shield size={10} /> Primary
                        </Badge>
                      )}
                      {!page.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {page.facebookPageId && (
                        <span className="text-xs text-muted-foreground font-mono">Page ID: {page.facebookPageId}</span>
                      )}
                      {page.instagramAccountId && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Instagram size={10} /> {page.instagramAccountId}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {page.tokenValid ? (
                      <Badge variant="outline" className="text-xs text-green-700 border-green-300 gap-1">
                        <CheckCircle size={10} />
                        {page.tokenPermanent ? "Permanent" : "Valid"}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <XCircle size={10} /> Invalid
                      </Badge>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(page as ClientPageRow)}>
                      <Edit2 size={13} />
                    </Button>
                    {!page.isPrimary && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removePageMutation.mutate({ id: page.id })}
                        disabled={removePageMutation.isPending}
                      >
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to get tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            How to Get a New Page Token
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">Meta Graph API Explorer <ExternalLink className="h-3 w-3" /></a></li>
            <li>Select app <strong>1636310834073967</strong> and generate a User Access Token</li>
            <li>Grant <code>pages_manage_posts</code>, <code>pages_read_engagement</code>, <code>instagram_basic</code>, <code>instagram_content_publish</code></li>
            <li>Paste the token in the "Add Page" dialog — the system will exchange it for a permanent page token automatically</li>
          </ol>
          <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs mt-2">
            <strong>Note:</strong> The current Sopris Restaurant token is <strong>permanent</strong> and will not expire unless you revoke app access or change your Facebook password.
          </div>
        </CardContent>
      </Card>

      {/* Edit / Add Dialog */}
      <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editDialog?.id ? "Edit Page" : "Add New Page"}</DialogTitle>
            <DialogDescription>
              {editDialog?.id
                ? "Update the page details. Leave the token field empty to keep the existing token."
                : "Add a Facebook page to manage. Paste the access token to connect it."}
            </DialogDescription>
          </DialogHeader>
          {editDialog && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Page Name *</Label>
                <Input
                  placeholder="e.g. Sopris Restaurant"
                  value={editDialog.name}
                  onChange={(e) => setEditDialog({ ...editDialog, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Facebook Page ID</Label>
                <Input
                  placeholder="e.g. 1099719276547374"
                  value={editDialog.facebookPageId}
                  onChange={(e) => setEditDialog({ ...editDialog, facebookPageId: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label>Facebook Page Access Token {editDialog.id ? "(leave blank to keep existing)" : "*"}</Label>
                <Input
                  type="password"
                  placeholder="Paste access token..."
                  value={editDialog.facebookPageToken}
                  onChange={(e) => setEditDialog({ ...editDialog, facebookPageToken: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label>Instagram Business Account ID <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  placeholder="e.g. 17841400000000000"
                  value={editDialog.instagramAccountId}
                  onChange={(e) => setEditDialog({ ...editDialog, instagramAccountId: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Active</Label>
                  <p className="text-xs text-muted-foreground">Include this page in scheduling</p>
                </div>
                <Switch
                  checked={editDialog.isActive}
                  onCheckedChange={(v) => setEditDialog({ ...editDialog, isActive: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Set as Primary</Label>
                  <p className="text-xs text-muted-foreground">Use this page's token for all scheduled posts</p>
                </div>
                <Switch
                  checked={editDialog.isPrimary}
                  onCheckedChange={(v) => setEditDialog({ ...editDialog, isPrimary: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={savePageMutation.isPending || !editDialog?.name}
            >
              {savePageMutation.isPending ? (
                <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Saving...</>
              ) : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
