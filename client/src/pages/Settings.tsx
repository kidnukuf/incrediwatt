import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, ExternalLink, Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [newToken, setNewToken] = useState("");
  const [newPageId, setNewPageId] = useState("");
  const [newInstagramId, setNewInstagramId] = useState("");
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<"unknown" | "valid" | "invalid">("unknown");

  const testToken = trpc.settings.testFacebookToken.useMutation({
    onMutate: () => setIsTestingToken(true),
    onSuccess: (data: { valid: boolean; pageName?: string; error?: string }) => {
      setIsTestingToken(false);
      if (data.valid) {
        setTokenStatus("valid");
        toast.success(`Token is valid! Connected to: ${data.pageName}`);
      } else {
        setTokenStatus("invalid");
        toast.error(`Token is invalid: ${data.error}`);
      }
    },
    onError: (err: { message: string }) => {
      setIsTestingToken(false);
      setTokenStatus("invalid");
      toast.error(`Test failed: ${err.message}`);
    },
  });

  const updateCredentials = trpc.settings.updateSocialCredentials.useMutation({
    onSuccess: () => {
      toast.success("Credentials updated! The scheduler will use the new token immediately.");
      setNewToken("");
      setNewPageId("");
      setNewInstagramId("");
      setTokenStatus("unknown");
    },
    onError: (err: { message: string }) => {
      toast.error(`Failed to update credentials: ${err.message}`);
    },
  });

  const handleTestToken = () => {
    if (!newToken.trim()) {
      toast.error("Please enter a token to test");
      return;
    }
    testToken.mutate({ token: newToken.trim() });
  };

  const handleSave = () => {
    if (!newToken.trim()) {
      toast.error("Please enter a new Facebook Page Access Token");
      return;
    }
    updateCredentials.mutate({
      facebookApiToken: newToken.trim(),
      facebookPageId: newPageId.trim() || undefined,
      instagramBusinessAccountId: newInstagramId.trim() || undefined,
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your social media account connections and credentials.</p>
      </div>

      {/* Current Status */}
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Facebook & Instagram Posting is Currently Broken</AlertTitle>
        <AlertDescription>
          All scheduled posts are failing with an authentication error. Your Facebook Page Access Token has expired or been revoked. 
          Update your token below to resume posting.
        </AlertDescription>
      </Alert>

      {/* How to get a new token */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            How to Get a New Facebook Page Access Token
          </CardTitle>
          <CardDescription>Follow these steps to generate a fresh token from Meta Business Suite</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">Meta Graph API Explorer <ExternalLink className="h-3 w-3" /></a></li>
            <li>Select your app (<strong>app ID: 1636310834073967</strong>) from the dropdown</li>
            <li>Click <strong>"Generate Access Token"</strong> and log in with your Facebook account</li>
            <li>Grant all requested permissions (especially <code>pages_manage_posts</code>, <code>pages_read_engagement</code>, <code>instagram_basic</code>, <code>instagram_content_publish</code>)</li>
            <li>Copy the generated <strong>Page Access Token</strong> (not the User Token)</li>
            <li>Paste it in the field below and click <strong>Test Token</strong> first, then <strong>Save</strong></li>
          </ol>
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-md border border-amber-200 dark:border-amber-800">
            <p className="text-amber-800 dark:text-amber-200 text-xs">
              <strong>Tip:</strong> For a long-lived token (60 days), use the <a href="https://developers.facebook.com/tools/debug/accesstoken/" target="_blank" rel="noopener noreferrer" className="underline">Token Debugger</a> to extend it, or generate a <strong>System User Token</strong> in Meta Business Manager for a non-expiring token.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Token Update Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            Update Facebook & Instagram Credentials
          </CardTitle>
          <CardDescription>Paste your new access token to reconnect posting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">
              Facebook Page Access Token <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="token"
                type="password"
                placeholder="Paste your new Page Access Token here..."
                value={newToken}
                onChange={(e) => { setNewToken(e.target.value); setTokenStatus("unknown"); }}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                onClick={handleTestToken}
                disabled={isTestingToken || !newToken.trim()}
                className="shrink-0"
              >
                {isTestingToken ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Test Token"
                )}
              </Button>
            </div>
            {tokenStatus === "valid" && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Token is valid and working
              </p>
            )}
            {tokenStatus === "invalid" && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <XCircle className="h-4 w-4" /> Token is invalid — check the token and try again
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="pageId">
              Facebook Page ID <span className="text-muted-foreground text-xs">(optional — only if changed)</span>
            </Label>
            <Input
              id="pageId"
              placeholder="e.g. 1099719276547374"
              value={newPageId}
              onChange={(e) => setNewPageId(e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">Current Page ID: <code>1099719276547374</code> (Sopris Restaurant)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramId">
              Instagram Business Account ID <span className="text-muted-foreground text-xs">(optional — only if changed)</span>
            </Label>
            <Input
              id="instagramId"
              placeholder="e.g. 17841400000000000"
              value={newInstagramId}
              onChange={(e) => setNewInstagramId(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={updateCredentials.isPending || !newToken.trim()}
            className="w-full"
          >
            {updateCredentials.isPending ? (
              <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Saving...</>
            ) : (
              "Save & Reconnect"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Facebook</span>
              <span className="text-xs text-muted-foreground">Sopris Restaurant (Page ID: 1099719276547374)</span>
            </div>
            <Badge variant="destructive" className="text-xs">Token Expired</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium">Instagram</span>
              <span className="text-xs text-muted-foreground">Business Account Connected</span>
            </div>
            <Badge variant="destructive" className="text-xs">Token Expired</Badge>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground">
            <p><strong>App ID:</strong> 1636310834073967</p>
            <p className="mt-1"><strong>Error:</strong> Cannot call API for app 1636310834073967 on behalf of user 10240984532890175</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
