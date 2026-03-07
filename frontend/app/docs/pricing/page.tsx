import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Receipt, CreditCard, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PricingDocsPage() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
            <div className="space-y-4">
                <Badge variant="outline" className="text-orange-600 border-orange-500/20 bg-orange-500/5 px-3 py-1 text-sm font-semibold tracking-wide">
                    Billing & Economy
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Pricing & Credits</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    FireForge operates on a simple, pay-as-you-go credit system. You only pay for what you actually use, with no hidden monthly fees.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-orange-500/20 bg-orange-500/5 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-600">
                            <Zap className="h-5 w-5" />
                            Credit Deductions
                        </CardTitle>
                        <CardDescription>How much each operation costs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Operation</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Scrape URL</TableCell>
                                    <TableCell className="text-right text-orange-600 font-bold">1 Credit</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Crawl (Per Page)</TableCell>
                                    <TableCell className="text-right text-orange-600 font-bold">1 Credit</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Map Domain</TableCell>
                                    <TableCell className="text-right text-orange-600 font-bold">1 Credit</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Search (Per Result)</TableCell>
                                    <TableCell className="text-right text-orange-600 font-bold">1 Credit</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Batch Scrape (Per URL)</TableCell>
                                    <TableCell className="text-right text-orange-600 font-bold">1 Credit</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="border-border bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-orange-500" />
                            Top-Up Rates
                        </CardTitle>
                        <CardDescription>Buying additional credits</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold">$5</span>
                            <span className="text-muted-foreground">/ 1,000 credits</span>
                        </div>
                        <ul className="space-y-3 font-medium text-sm text-muted-foreground">
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Instant credit delivery</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Safe processing via Polar</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-600" /> No expiration date on credits</li>
                            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-orange-600" /> Volume discounts available</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-orange-500" />
                    How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="text-3xl font-bold text-orange-500/20">01.</div>
                        <h4 className="font-bold">Register</h4>
                        <p className="text-sm text-muted-foreground">Create an account and get 50 free credits to test the API instantly.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-3xl font-bold text-orange-500/20">02.</div>
                        <h4 className="font-bold">Consume</h4>
                        <p className="text-sm text-muted-foreground">Every successful API call deducts credits from your balance based on the tables above.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-3xl font-bold text-orange-500/20">03.</div>
                        <h4 className="font-bold">Top Up</h4>
                        <p className="text-sm text-muted-foreground">When your balance runs low, simply buy a credit pack to continue your projects.</p>
                    </div>
                </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-8 text-center space-y-4">
                <div className="flex justify-center">
                    <div className="bg-orange-500/20 p-4 rounded-full">
                        <Coins className="h-10 w-10 text-orange-600" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold">Ready to get more credits?</h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Choose a pack that fits your needs. Our payments are handled securely by Polar.
                </p>
                <div className="pt-2">
                    <a href={process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL || "#"} target="_blank">
                        <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                            Buy 1,000 Credits Now
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
}
