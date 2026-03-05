"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    apiKey: string | null;
    setApiKey: (key: string | null) => void;
    adminKey: string | null;
    setAdminKey: (key: string | null) => void;
    credits: number | null;
    setCredits: (credits: number | null) => void;
    userId: string | null;
    setUserId: (id: string | null) => void;
    isAdmin: boolean;
    pricing: Record<string, number>;
    logout: () => void;
    adminLogout: () => void;
    deductCredits: (amount: number) => void;
    refreshCredits: () => Promise<void>;
    getCost: (endpoint: string) => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [adminKey, setAdminKey] = useState<string | null>(null);
    const [credits, setCredits] = useState<number | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [pricing, setPricing] = useState<Record<string, number>>({});

    const logout = () => {
        setApiKey(null);
        setCredits(null);
        setUserId(null);
        setIsAdmin(false);
        // We keep pricing as it's global
    };

    const adminLogout = () => {
        setAdminKey(null);
    };

    const refreshCredits = useCallback(async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from("credits")
                .select("balance")
                .eq("user_id", userId)
                .single();

            if (error) throw error;
            if (data) {
                setCredits(data.balance);
            }
        } catch (err) {
            console.error("Error fetching credits from Supabase:", err);
        }
    }, [userId]);

    const fetchUserStatus = useCallback(async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from("users")
                .select("is_admin")
                .eq("id", userId)
                .single();

            if (error) throw error;
            if (data) {
                setIsAdmin(!!data.is_admin);
            }
        } catch (err) {
            console.error("Error fetching user status from Supabase:", err);
        }
    }, [userId]);

    const fetchPricing = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("endpoint_pricing")
                .select("endpoint, cost");

            if (error) throw error;
            if (data) {
                const pricingMap = data.reduce((acc: any, item: any) => {
                    acc[item.endpoint] = item.cost;
                    return acc;
                }, {});
                setPricing(pricingMap);
            }
        } catch (err) {
            console.error("Error fetching pricing from Supabase:", err);
        }
    }, []);

    const getCost = (endpoint: string) => {
        return pricing[endpoint] ?? 1; // Default to 1
    };

    const deductCredits = (amount: number) => {
        setCredits((prev) => (prev !== null ? Math.max(0, prev - amount) : null));
        // Optional: Trigger a real refresh after a small delay to sync with backend
        setTimeout(refreshCredits, 2000);
    };

    useEffect(() => {
        fetchPricing();
    }, [fetchPricing]);

    useEffect(() => {
        if (userId) {
            refreshCredits();
            fetchUserStatus();

            // Set up realtime subscription
            const channel = supabase
                .channel("credits_changes")
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "credits",
                        filter: `user_id=eq.${userId}`,
                    },
                    (payload) => {
                        if (payload.new && typeof payload.new.balance === "number") {
                            setCredits(payload.new.balance);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [userId, refreshCredits]);

    return (
        <AuthContext.Provider
            value={{
                apiKey,
                setApiKey,
                adminKey,
                setAdminKey,
                credits,
                setCredits,
                userId,
                setUserId,
                isAdmin,
                pricing,
                logout,
                adminLogout,
                deductCredits,
                refreshCredits,
                getCost,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
