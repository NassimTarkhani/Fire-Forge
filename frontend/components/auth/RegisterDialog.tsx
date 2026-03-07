"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, CheckCircle2, Copy, ArrowRight, Wallet } from "lucide-react";
import { FireForgeAPI } from "@/lib/api/client";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";

type Mode = "signup" | "login";

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export function RegisterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("signup");
    const [loading, setLoading] = useState(false);
    const [creatingKey, setCreatingKey] = useState(false);
    const [checkingKeys, setCheckingKeys] = useState(false);

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
    const [createdCredits, setCreatedCredits] = useState<number | null>(null);
    const [hasExistingApiKey, setHasExistingApiKey] = useState(false);

    const {
        apiKey,
        setApiKey,
        setAuthToken,
        setCredits,
        setUserId,
        setIsAdmin,
        authToken,
    } = useAuth();

    const resetLocalState = () => {
        setLoading(false);
        setCreatingKey(false);
        setCheckingKeys(false);
        setCreatedApiKey(null);
        setCreatedCredits(null);
        setHasExistingApiKey(false);
    };

    const checkoutUrl = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL;
    const hasCredits = (createdCredits ?? 0) > 0;

    const handleClose = (nextOpen: boolean) => {
        if (!nextOpen) resetLocalState();
        onOpenChange(nextOpen);
    };

    const checkExistingKeys = async (token: string) => {
        setCheckingKeys(true);
        try {
            const apiClient = new FireForgeAPI(undefined, undefined, token);
            const keys = await apiClient.listUserApiKeys(false);
            setHasExistingApiKey(Array.isArray(keys) && keys.some((k) => !k.revoked));
        } catch {
            // Non-blocking: if listing fails, keep default flow.
            setHasExistingApiKey(false);
        } finally {
            setCheckingKeys(false);
        }
    };

    useEffect(() => {
        if (!open || !authToken) return;

        if (apiKey) {
            setHasExistingApiKey(true);
        } else {
            void checkExistingKeys(authToken);
        }
    }, [open, authToken, apiKey]);

    const handleAuthSubmit = async () => {
        if (!email || !password || (mode === "signup" && !name)) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const api = new FireForgeAPI();
            const response = mode === "signup"
                ? await api.signup(email, name, password)
                : await api.login(email, password);

            setAuthToken(response.access_token);
            setUserId(response.user?.id || null);
            setCredits(response.credits ?? null);
            setIsAdmin(!!response.user?.is_admin);
            setCreatedCredits(response.credits ?? null);
            setHasExistingApiKey(!!apiKey);

            await checkExistingKeys(response.access_token);

            toast.success(mode === "signup" ? "Account created successfully" : "Logged in successfully");
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Authentication failed"));
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateApiKey = async () => {
        if (!authToken) {
            toast.error("Please sign in first.");
            return;
        }

        setCreatingKey(true);
        try {
            const api = new FireForgeAPI(undefined, undefined, authToken);
            const keyRes = await api.createUserApiKey();
            setApiKey(keyRes.api_key);
            setCreatedApiKey(keyRes.api_key);
            toast.success("API key generated successfully");
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to generate API key"));
        } finally {
            setCreatingKey(false);
        }
    };

    const handleCopyKey = () => {
        if (!createdApiKey) return;
        navigator.clipboard.writeText(createdApiKey);
        toast.success("API key copied to clipboard");
    };

    const handleContinue = () => {
        toast.success("Welcome to FireForge");
        router.push("/playground");
        handleClose(false);
    };

    const handleRecharge = () => {
        if (!checkoutUrl) {
            toast.error("Buy credits link is not configured.");
            return;
        }
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    };

    const authenticated = !!authToken;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                        {authenticated ? "Account Ready" : mode === "signup" ? "Create Account" : "Welcome Back"}
                    </DialogTitle>
                    <DialogDescription>
                        {authenticated
                            ? "Email authentication complete. Manage API access and continue to the playground."
                            : mode === "signup"
                                ? "Sign up with email and password. You will receive 50 free credits."
                                : "Sign in with your email and password."}
                    </DialogDescription>
                </DialogHeader>

                {!authenticated ? (
                    <div className="space-y-4 pt-2">
                        {mode === "signup" && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimum 8 characters"
                            />
                        </div>

                        <Button
                            onClick={handleAuthSubmit}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === "signup" ? "Create Account" : "Sign In"}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            {mode === "signup" ? "Already have an account?" : "Don't have an account?"} {" "}
                            <button
                                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                                className="text-orange-600 hover:underline"
                            >
                                {mode === "signup" ? "Sign in" : "Create one"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 pt-2">
                        {createdCredits !== null && (
                            <div className="rounded-md border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-700 dark:text-orange-300">
                                You currently have {createdCredits} credits.
                            </div>
                        )}

                        {checkingKeys ? (
                            <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking your API keys...
                            </div>
                        ) : !createdApiKey && !hasExistingApiKey ? (
                            <Button
                                onClick={handleGenerateApiKey}
                                disabled={creatingKey}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                            >
                                {creatingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                                {creatingKey ? "Generating..." : "Generate API Key"}
                            </Button>
                        ) : (
                            <>
                                {createdApiKey ? (
                                    <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        API key created. It is shown only once, save it now.
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Existing API key detected on your account.
                                    </div>
                                )}

                                {createdApiKey && (
                                    <div className="space-y-2">
                                        <Label>Your API Key</Label>
                                        <div className="flex gap-2">
                                            <Input value={createdApiKey} readOnly className="font-mono text-xs" />
                                            <Button type="button" variant="outline" size="icon" onClick={handleCopyKey}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                            </>
                        )}

                        {!hasCredits && (
                            <Button onClick={handleRecharge} variant="outline" className="w-full border-orange-500/40 text-orange-600 hover:bg-orange-500/10">
                                <Wallet className="mr-2 h-4 w-4" /> Recharge Credits
                            </Button>
                        )}

                        <Button onClick={handleContinue} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                            <ArrowRight className="mr-2 h-4 w-4" /> Continue to Playground
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
