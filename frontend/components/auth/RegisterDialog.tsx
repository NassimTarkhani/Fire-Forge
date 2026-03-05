"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Copy, Coins, Loader2 } from "lucide-react";
import { FireForgeAPI } from "@/lib/api/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export function RegisterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [credits, setCredits] = useState(0);
    const [userId, setUserIdState] = useState<string | null>(null);
    const [saveKeyOpen, setSaveKeyOpen] = useState(false);

    // New state if the user already has a key and wants to just enter it
    const [existingKeyMode, setExistingKeyMode] = useState(false);
    const [existingKeyInput, setExistingKeyInput] = useState("");

    const { setApiKey: setContextApiKey, setCredits: setContextCredits, setUserId: setContextUserId } = useAuth();
    const handleRegister = async () => {
        if (!email || !name) {
            toast.error("Please fill in all fields.");
            return;
        }

        setLoading(true);
        try {
            const api = new FireForgeAPI();
            const response = await api.register(email, name);

            setApiKey(response.api_key);
            setCredits(response.credits);
            setUserIdState(response.user_id);
            setRegistered(true);

            toast.success("Account created successfully!");
        } catch (error: any) {
            toast.error(error.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyKey = () => {
        navigator.clipboard.writeText(apiKey);
        toast.success("API key copied to clipboard!");
    };

    const handleSaveAndContinue = () => {
        setContextApiKey(apiKey);
        setContextCredits(credits);
        if (userId) setContextUserId(userId);

        toast.success("API key saved! You can start using the playground now.");
        onOpenChange(false);
    };

    const handleSaveExistingKey = async () => {
        if (!existingKeyInput) {
            toast.error("Please enter your API Key.");
            return;
        }

        setLoading(true);
        try {
            // The key prefix is the first 12 characters including fg_
            if (!existingKeyInput.startsWith("fg_") || existingKeyInput.length < 12) {
                throw new Error("Invalid API key format. Should start with fg_");
            }

            const prefix = existingKeyInput.substring(0, 12);

            const { data, error } = await supabase
                .from("api_keys")
                .select("user_id")
                .eq("key_prefix", prefix)
                .single();

            if (error || !data) throw new Error("Invalid API key or key not found.");

            setContextApiKey(existingKeyInput);
            setContextUserId(data.user_id);

            toast.success("API key validated and saved!");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to validate key.");
        } finally {
            setLoading(false);
        }
    };

    if (registered) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <CheckCircle2 className="h-7 w-7 text-green-500" />
                            Welcome to FireForge!
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2">
                            Your account has been created successfully.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 my-2">
                        <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400 font-medium">
                            <div className="bg-orange-500/20 p-2 rounded-full">
                                <Coins className="h-5 w-5" />
                            </div>
                            <span>🎉 You've received {credits} free credits to get started!</span>
                        </div>
                    </div>

                    <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Your API Key</Label>
                            <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded border border-border">
                                ⚠️ This key gives you access to the API and uses your credits. <strong>It will only be shown once!</strong> Save it securely.
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    value={apiKey}
                                    readOnly
                                    className="font-mono text-sm bg-muted/50"
                                />
                                <Button onClick={handleCopyKey} variant="outline" size="icon" className="shrink-0">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button onClick={handleSaveAndContinue} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 mt-4">
                            Save Key & Start Building
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                        {existingKeyMode ? "Enter API Key" : "Create Account"}
                    </DialogTitle>
                    <DialogDescription>
                        {existingKeyMode
                            ? "Access your existing account by entering your FireForge API Key."
                            : "Register below and get 50 free credits instantly. No credit card required."}
                    </DialogDescription>
                </DialogHeader>

                {existingKeyMode ? (
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                value={existingKeyInput}
                                onChange={(e) => setExistingKeyInput(e.target.value)}
                                placeholder="fireforge_..."
                                className="font-mono"
                            />
                        </div>

                        <Button
                            onClick={handleSaveExistingKey}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Access Dashboard
                        </Button>

                        <div className="text-center text-sm mt-4">
                            Don't have an account?{" "}
                            <button onClick={() => setExistingKeyMode(false)} className="text-orange-600 font-medium hover:underline text-sm focus:outline-none">
                                Get Started Free
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>

                        <Button
                            onClick={handleRegister}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white mt-6"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {loading ? "Creating Account..." : "Get 50 Free Credits"}
                        </Button>

                        <div className="text-center text-sm mt-4">
                            Already have an API key?{" "}
                            <button onClick={() => setExistingKeyMode(true)} className="text-orange-600 font-medium hover:underline text-sm focus:outline-none">
                                Sign in
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
