"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Coins, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PricingPage() {
    const { getCost } = useAuth();
    const checkoutUrl = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL || "#";

    return (
        <div className="container py-16 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">

            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Simple, Transparent Pricing</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Pay only for what you use. Top up your balance anytime.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                {/* Free Tier */}
                <Card className="border-2 border-muted shadow-sm flex flex-col pt-6">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold font-sans">Starter</CardTitle>
                        <CardDescription className="text-base pt-2">Perfect for side projects and evaluating the API.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <div className="flex items-baseline text-5xl font-extrabold">
                            Free
                        </div>
                        <ul className="space-y-3 font-medium text-muted-foreground">
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-orange-500" /> 50 Free Credits</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-orange-500" /> Access to all endpoints</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-orange-500" /> Community support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Link href="/" className="w-full">
                            <Button className="w-full text-lg h-12 border-2" variant="outline">Sign Up Now</Button>
                        </Link>
                    </CardFooter>
                </Card>

                {/* Paid Tier / Pay As You Go */}
                <Card className="border-2 border-orange-500 shadow-xl shadow-orange-500/10 flex flex-col relative pt-6 overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-red-600"></div>
                    <div className="absolute top-4 right-4 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Pay as you go
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold font-sans">Pro Credits</CardTitle>
                        <CardDescription className="text-base pt-2">Top up your balance for production use.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <div className="flex items-baseline text-5xl font-extrabold">
                            $5
                            <span className="text-lg text-muted-foreground font-medium ml-2">/ 1,000 credits</span>
                        </div>
                        <ul className="space-y-3 font-medium text-muted-foreground">
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-orange-500" /> Pay only for what you use</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-orange-500" /> Volume discounts available</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-orange-500" /> Priority email support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Link href={checkoutUrl} target="_blank" className="w-full">
                            <Button className="w-full text-lg h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0">
                                Buy Credits via Polar
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            <div className="max-w-3xl mx-auto pt-16">
                <h3 className="text-2xl font-bold mb-6 text-center">Credit Usage Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/50 p-4 rounded-xl text-center border">
                        <div className="font-bold text-lg text-foreground mb-1">Scrape</div>
                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400">{getCost("/v1/scrape")} Credit{getCost("/v1/scrape") !== 1 ? "s" : ""}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl text-center border">
                        <div className="font-bold text-lg text-foreground mb-1">Search</div>
                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400">{getCost("/v1/search")} Credit{getCost("/v1/search") !== 1 ? "s" : ""} / Result</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl text-center border">
                        <div className="font-bold text-lg text-foreground mb-1">Map</div>
                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400">{getCost("/v1/map")} Credit{getCost("/v1/map") !== 1 ? "s" : ""}</div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl text-center border">
                        <div className="font-bold text-lg text-foreground mb-1">Crawl</div>
                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400">{getCost("/v1/crawl")} Credit{getCost("/v1/crawl") !== 1 ? "s" : ""} / Page</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
