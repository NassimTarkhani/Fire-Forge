"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RegisterDialog } from "@/components/auth/RegisterDialog";
import {
  Flame,
  ArrowRight,
  Code2,
  Cpu,
  Zap,
  Database,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Terminal as TerminalIcon,
  Layers,
  Route,
  Search,
  ListChecks
} from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen selection:bg-orange-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 bg-background overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center pt-20 pb-16 text-center px-4">
        <motion.div
          style={{ opacity, scale }}
          className="space-y-8 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            FireForge API v1.2 is here
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground leading-[1.1]"
          >
            Turn the web into <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-rose-600">
              Structured Data.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed"
          >
            The lightning-fast API for web scraping, crawling, and mapping.
            Bypass bots, handle JS, and get clean data in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
          >
            <Button
              size="lg"
              onClick={() => setIsRegisterOpen(true)}
              className="w-full sm:w-auto text-lg h-14 px-10 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 shadow-2xl shadow-orange-500/20 group transition-all"
            >
              Start Scraping Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link href="/docs" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-10 text-lg border-2 hover:bg-muted/50 transition-all">
                Documentation
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Animated Code Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 w-full max-w-4xl mx-auto relative group"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-rose-600 rounded-2xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative rounded-xl border border-border bg-slate-950 shadow-2xl overflow-hidden text-left">
            {/* Terminal Header */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">GET /v1/scrape</div>
            </div>
            {/* Terminal Content */}
            <div className="p-6 font-mono text-sm leading-6 sm:leading-7 overflow-x-auto whitespace-pre">
              <div className="flex gap-3">
                <span className="text-slate-500">$</span>
                <span className="text-slate-200">curl -X POST "https://api.fireforge.dev/v1/scrape" \</span>
              </div>
              <div className="flex gap-3 pl-6">
                <span className="text-sky-400">-H "Authorization: Bearer fg_prod_..." \</span>
              </div>
              <div className="flex gap-3 pl-6">
                <span className="text-sky-400">-d '{"{"} "url": "https://example.com" {"}"}'</span>
              </div>
              <div className="mt-4 border-t border-white/5 pt-4">
                <div className="text-green-400">{"{"}</div>
                <div className="text-green-400 pl-4">"success": <span className="text-orange-400">true</span>,</div>
                <div className="text-green-400 pl-4">"data": {"{"}</div>
                <div className="text-green-400 pl-8">"title": <span className="text-sky-300">"Example Domain"</span>,</div>
                <div className="text-green-400 pl-8">"content": <span className="text-sky-300">"# Hello World\\nThis is scraped data..."</span>,</div>
                <div className="text-green-400 pl-8">"credits_used": <span className="text-orange-400">1</span></div>
                <div className="text-green-400 pl-4">{"}"}</div>
                <div className="text-green-400">{"}"}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">How it Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Three simple steps to unlock the power of any website.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-orange-500/20 via-orange-500 to-orange-500/20 -z-10"></div>

            {[
              { step: "01", title: "Generate Key", desc: "Register in seconds and get your permanent API key instantly.", icon: Database },
              { step: "02", title: "Target URL", desc: "Choose any website and our proxy network handles the rest.", icon: Globe },
              { step: "03", title: "Get Structured Data", desc: "Receive clean markdown, HTML or JSON ready for your LLM or DB.", icon: CheckCircle2 }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="space-y-6 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-orange-500/20 border-4 border-background">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm max-w-[250px]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="bg-muted/30 py-24 border-y border-border/50">
        <div className="container mx-auto max-w-7xl px-4 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Powerful Capabilities</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Everything you need to scale your data extraction without the headache of proxies and bot management.</p>
            </div>
            <Link href="/playground">
              <Button variant="outline" size="lg" className="h-12 border-2 px-6 font-bold group">
                Try Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "JS Rendering", desc: "Chrome-powered rendering to extract data from SPAs like React and Vue.", icon: Code2, color: "text-blue-500" },
              { title: "Anti-Bot Bypass", desc: "Advanced headers and browser fingerprint rotation to stay invisible.", icon: ShieldCheck, color: "text-green-500" },
              { title: "Sitemap Mapping", desc: "Instantly discover every URL on a domain with the Map endpoint.", icon: Layers, color: "text-orange-500" },
              { title: "Crawl Any Site", desc: "Automated recursive crawling with smart link extraction.", icon: Route, color: "text-purple-500" },
              { title: "AI Search", desc: "Search the web and scrape results in a single API call.", icon: Search, color: "text-red-500" },
              { title: "Batch Support", desc: "Process thousands of URLs concurrently with extreme performance.", icon: ListChecks, color: "text-cyan-500" }
            ].map((feat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-background border border-border shadow-sm group transition-all hover:border-orange-500/20"
              >
                <div className={cn("mb-6 bg-muted p-4 rounded-xl w-fit group-hover:scale-110 transition-transform", feat.color)}>
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 overflow-hidden relative">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30">
          <div className="w-[800px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-600/5 p-12 text-center space-y-8 backdrop-blur-md"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-black uppercase tracking-widest">
            Ready to Build?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Step into the future of data extraction.</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Join developers worldwide using FireForge to power their AI agents, search engines, and datasets.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => setIsRegisterOpen(true)}
              className="w-full sm:w-auto text-lg h-14 px-10 bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-lg shadow-orange-500/20"
            >
              Get 50 Free Credits <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-background relative z-10">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <span className="font-sans font-black text-2xl tracking-tighter italic bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent uppercase">
              FireForge
            </span>
          </div>

          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/playground" className="hover:text-foreground transition-colors">Playground</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <a href="#" className="hover:text-foreground transition-colors">Discord</a>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <Database className="h-3 w-3" /> Powered by FireForge v1.2
            <span>&copy; 2026 FireForge Ltd.</span>
          </div>
        </div>
      </footer>

      <RegisterDialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen} />
    </div>
  );
}
