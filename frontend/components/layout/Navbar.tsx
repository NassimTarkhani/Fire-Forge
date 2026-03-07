"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Coins, Key, LogOut, Settings } from "lucide-react";
import { RegisterDialog } from "@/components/auth/RegisterDialog";
import { ApiKeyManagerDialog } from "@/components/auth/ApiKeyManagerDialog";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function Navbar() {
    const { apiKey, authToken, credits, isAdmin, clearApiKey, logout } = useAuth();
    const hasApiKey = !!apiKey;
    const hasSession = !!authToken;
    const hasAccount = hasApiKey || hasSession;
    const checkoutUrl = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL;
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isApiManagerOpen, setIsApiManagerOpen] = useState(false);

    const handleClearApiKey = () => {
        clearApiKey();
        toast.success("API key cleared");
    };

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
    };

    const handleBuyCredits = () => {
        if (!checkoutUrl) {
            toast.error("Buy credits link is not configured.");
            return;
        }
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6 md:gap-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <Flame className="h-6 w-6 text-orange-500" />
                        <span className="font-bold inline-block bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                            FireForge
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link href="/playground" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Playground
                        </Link>
                        <Link href="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Documentation
                        </Link>
                        <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Pricing
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className="transition-colors hover:text-orange-500 text-orange-600 font-semibold flex items-center gap-1">
                                <Key className="h-3.5 w-3.5" />
                                Admin
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {hasAccount ? (
                        <>
                            {credits !== null ? (
                                <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 px-3 py-1 font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border-orange-500/20">
                                    <Coins className="h-3.5 w-3.5" />
                                    {credits} Credits
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 px-3 py-1 font-medium bg-muted/50 text-muted-foreground animate-pulse">
                                    <Coins className="h-3.5 w-3.5" />
                                    ...
                                </Badge>
                            )}

                            {hasSession && (
                                <Button size="sm" variant="outline" className="hidden sm:flex" onClick={handleBuyCredits}>
                                    Buy Credits
                                </Button>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
                                        <Key className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    {credits !== null && (
                                        <DropdownMenuItem className="sm:hidden text-orange-600 dark:text-orange-400">
                                            <Coins className="mr-2 h-4 w-4" />
                                            {credits} Credits
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    {hasSession && (
                                        <DropdownMenuItem onClick={() => setIsApiManagerOpen(true)}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Manage API Keys
                                        </DropdownMenuItem>
                                    )}
                                    {hasApiKey && (
                                        <DropdownMenuItem onClick={handleClearApiKey}>
                                            <Key className="mr-2 h-4 w-4" />
                                            Clear API Key
                                        </DropdownMenuItem>
                                    )}
                                    {hasSession && (
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Button onClick={() => setIsRegisterOpen(true)} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 shadow-lg shadow-orange-500/20">
                            Get Started Free
                        </Button>
                    )}

                    <ThemeToggle />
                </div>
            </div>

            <RegisterDialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen} />
            <ApiKeyManagerDialog open={isApiManagerOpen} onOpenChange={setIsApiManagerOpen} />
        </header>
    );
}
