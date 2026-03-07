"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { FireForgeAPI, STORAGE_KEYS } from "@/lib/api/client";

type PricingRow = {
    endpoint: string;
    cost: number;
};

interface AuthContextType {
    apiKey: string | null;
    setApiKey: (key: string | null) => void;
    authToken: string | null;
    setAuthToken: (token: string | null) => void;
    adminKey: string | null;
    setAdminKey: (key: string | null) => void;
    credits: number | null;
    setCredits: (credits: number | null) => void;
    userId: string | null;
    setUserId: (id: string | null) => void;
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
    pricing: Record<string, number>;
    clearApiKey: () => void;
    logout: () => Promise<void>;
    adminLogout: () => void;
    deductCredits: (amount: number) => void;
    refreshCredits: () => Promise<void>;
    getCost: (endpoint: string) => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [adminKey, setAdminKey] = useState<string | null>(null);
    const [credits, setCredits] = useState<number | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [pricing, setPricing] = useState<Record<string, number>>({});

    const clearApiKey = () => {
        setApiKey(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEYS.API_KEY);
        }
    };

    const logout = async () => {
        if (authToken) {
            try {
                const api = new FireForgeAPI(apiKey || undefined, undefined, authToken);
                await api.logoutUser();
            } catch {
                // Ignore logout transport errors and clear local state anyway.
            }
        }

        setApiKey(null);
        setAuthToken(null);
        setCredits(null);
        setUserId(null);
        setIsAdmin(false);

        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEYS.API_KEY);
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
            localStorage.removeItem(STORAGE_KEYS.USER_ID);
            localStorage.removeItem(STORAGE_KEYS.CREDITS);
        }
    };

    const adminLogout = () => {
        setAdminKey(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEYS.ADMIN_KEY);
        }
    };

    // Restore persisted auth state once on mount.
    useEffect(() => {
        if (typeof window === "undefined") return;

        const storedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
        const storedAuthToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedAdminKey = localStorage.getItem(STORAGE_KEYS.ADMIN_KEY);
        const storedIsAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
        const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        const storedCredits = localStorage.getItem(STORAGE_KEYS.CREDITS);

        if (storedApiKey) setApiKey(storedApiKey);
        if (storedAuthToken) setAuthToken(storedAuthToken);
        if (storedAdminKey) setAdminKey(storedAdminKey);
        if (storedIsAdmin === "true") setIsAdmin(true);
        if (storedUserId) setUserId(storedUserId);
        if (storedCredits !== null && storedCredits !== "") {
            const parsed = Number(storedCredits);
            if (!Number.isNaN(parsed)) setCredits(parsed);
        }
    }, []);

    // Persist critical auth state changes.
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (apiKey) localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
        else localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }, [apiKey]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (authToken) localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
        else localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }, [authToken]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (adminKey) localStorage.setItem(STORAGE_KEYS.ADMIN_KEY, adminKey);
        else localStorage.removeItem(STORAGE_KEYS.ADMIN_KEY);
    }, [adminKey]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEYS.IS_ADMIN, String(isAdmin));
    }, [isAdmin]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (userId) localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        else localStorage.removeItem(STORAGE_KEYS.USER_ID);
    }, [userId]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (credits !== null) localStorage.setItem(STORAGE_KEYS.CREDITS, String(credits));
        else localStorage.removeItem(STORAGE_KEYS.CREDITS);
    }, [credits]);

    const refreshCredits = useCallback(async () => {
        if (!userId || !supabase) return;

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
        if (!userId || !supabase) return;

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
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from("endpoint_pricing")
                .select("endpoint, cost");

            if (error) throw error;
            if (data) {
                const pricingMap = (data as PricingRow[]).reduce<Record<string, number>>((acc, item) => {
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
        if (userId && supabase) {
            const sb = supabase;
            refreshCredits();
            fetchUserStatus();

            // Set up realtime subscription
            const channel = sb
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
                sb.removeChannel(channel);
            };
        }
    }, [userId, refreshCredits, fetchUserStatus]);

    return (
        <AuthContext.Provider
            value={{
                apiKey,
                setApiKey,
                authToken,
                setAuthToken,
                adminKey,
                setAdminKey,
                credits,
                setCredits,
                userId,
                setUserId,
                isAdmin,
                setIsAdmin,
                pricing,
                clearApiKey,
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
