"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Sparkles, Zap, Users, BarChart3, Mail, BookOpen, Brain, Play, CheckCircle, Star, ArrowDown, Globe, Menu, X, Rocket, Clock, Target, TrendingUp, Shield, Layers, Palette, Code, Database, Smartphone, Globe2, CheckCircle2, DollarSign, MessageSquare, Calendar, FileText, Settings, BarChart, MailOpen, UserPlus, Timer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' },
]

const keyBenefits = [
  {
    icon: Brain,
    title: "Write Better, Faster",
    description: "AI that actually helps you create compelling content, not just generate generic text. Get real suggestions that improve your voice.",
    benefit: "Save 3+ hours per week"
  },
  {
    icon: Users,
    title: "Build Real Relationships",
    description: "Turn subscribers into engaged community members with automated sequences that feel personal, not robotic.",
    benefit: "2x higher engagement rates"
  },
  {
    icon: DollarSign,
    title: "Monetize Your Knowledge",
    description: "Create and sell email courses without the complexity. Your expertise becomes your income stream.",
    benefit: "Average $500+ monthly revenue"
  },
  {
    icon: TrendingUp,
    title: "Grow Without the Grind",
    description: "Smart automation handles the repetitive work while you focus on what matters—creating amazing content.",
    benefit: "3x faster audience growth"
  }
]

const whatMakesUsDifferent = [
  {
    title: "AI That Actually Gets You",
    description: "Unlike generic AI tools, our system learns your writing style and suggests improvements that sound like you, not a robot."
  },
  {
    title: "All-in-One Simplicity",
    description: "Stop juggling 5 different tools. Create content, build courses, and automate emails—all in one beautiful platform."
  },
  {
    title: "Creator-First Design",
    description: "Built by creators, for creators. Every feature solves a real problem we've faced in our own content businesses."
  },
  {
    title: "No Learning Curve",
    description: "Start creating immediately. No complex setup, no weeks of learning—just powerful tools that work from day one."
  }
]


export default function Home() {
  const [menuState, setMenuState] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <header>
        <nav className="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent">
          <div className="m-auto max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex w-full justify-between lg:w-auto">
                <Link href="/" aria-label="home" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">K</span>
                  </div>
                  <span className="text-xl font-bold text-primary">Kreeew</span>
                </Link>

                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className={`m-auto size-6 duration-200 ${menuState ? 'rotate-180 scale-0 opacity-0' : ''}`} />
                  <X className={`absolute inset-0 m-auto size-6 duration-200 ${menuState ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-0 opacity-0'}`} />
                </button>
              </div>

              <div className={`bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent ${menuState ? 'flex' : 'lg:flex'}`}>
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        >
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                  <ThemeToggle />
                  <Button asChild variant="outline" size="sm">
                    <Link href="/auth/signin">
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/auth/signup">
                      <span>Get Started</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="overflow-hidden">
        <section>
          <div className="relative pt-24">
            <div className="mx-auto max-w-7xl px-6">
              <div className="max-w-3xl text-center sm:mx-auto lg:mr-auto lg:mt-0 lg:w-4/5">
                <Link
                  href="/"
                  className="rounded-lg mx-auto flex w-fit items-center gap-2 border p-1 pr-3 mb-8"
                >
                  <span className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium">Beta</span>
                  <span className="text-sm text-muted-foreground">Join early creators building the future</span>
                  <span className="bg-border block h-4 w-px"></span>
                  <ArrowRight className="size-4" />
                </Link>

                <h1 className="text-balance text-4xl font-semibold md:text-5xl xl:text-6xl xl:leading-tight">
                  Turn your ideas into{" "}
                  <span className="text-primary relative">
                    income streams
                    <div className="absolute -bottom-1 left-0 right-0 h-2 bg-primary/20 rounded-full -z-10"></div>
                  </span>
                </h1>
                
                <p className="mx-auto mt-8 hidden max-w-2xl text-wrap text-lg text-muted-foreground sm:block">
                  Create content that converts, build email courses that sell, and automate your way to a thriving creative business—all with AI that actually helps, not hinders.
                </p>
                
                <p className="mx-auto mt-6 max-w-2xl text-wrap text-muted-foreground sm:hidden">
                  Create content that converts, build email courses that sell, and automate your way to a thriving creative business.
                </p>

                <div className="mt-8">
                  <Button size="lg" asChild>
                    <Link href="/auth/signup">
                      <Rocket className="relative size-4" />
                      <span className="text-nowrap">Start Creating</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Hero Dashboard Preview */}
            <div className="relative mx-auto mt-16 max-w-6xl overflow-hidden px-4">
              <div className="relative rounded-2xl border border-border/25 bg-card/50 backdrop-blur-sm p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                    <div className="h-3 bg-muted/50 rounded w-full"></div>
                    <div className="h-3 bg-muted/50 rounded w-5/6"></div>
                    <div className="h-3 bg-muted/50 rounded w-4/5"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-secondary/20 rounded w-2/3"></div>
                    <div className="h-3 bg-muted/50 rounded w-full"></div>
                    <div className="h-3 bg-muted/50 rounded w-3/4"></div>
                    <div className="h-3 bg-muted/50 rounded w-5/6"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-accent/20 rounded w-4/5"></div>
                    <div className="h-3 bg-muted/50 rounded w-full"></div>
                    <div className="h-3 bg-muted/50 rounded w-2/3"></div>
                    <div className="h-3 bg-muted/50 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="bg-background relative z-10 pb-16">
          <div className="m-auto max-w-5xl px-6">
            <h2 className="text-center text-lg font-medium text-muted-foreground">Built for creators who want results, not just followers</h2>
            <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
              <div className="text-2xl font-bold text-muted-foreground/60">Content Creators</div>
              <div className="text-2xl font-bold text-muted-foreground/60">Course Creators</div>
              <div className="text-2xl font-bold text-muted-foreground/60">Newsletter Writers</div>
              <div className="text-2xl font-bold text-muted-foreground/60">Solo Entrepreneurs</div>
              <div className="text-2xl font-bold text-muted-foreground/60">Digital Marketers</div>
              <div className="text-2xl font-bold text-muted-foreground/60">Online Educators</div>
            </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6">
              What you'll actually{" "}
              <span className="text-primary">achieve</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real results that matter to your creative business, not just fancy features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {keyBenefits.map((benefit, index) => (
              <Card key={index} className="group hover:shadow-medium transition-all duration-300 border-0 shadow-soft hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {benefit.benefit}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  <CardDescription className="text-base">{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="bg-muted/30 py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-semibold mb-6">
                Why creators choose{" "}
                <span className="text-primary">Kreeew</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We solve the real problems creators face, not the ones that look good in marketing copy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {whatMakesUsDifferent.map((item, index) => (
                <div key={index} className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border">
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Pricing Preview Section */}
        <section id="pricing" className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6">
              Start building your{" "}
              <span className="text-primary">creative business</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Begin with our free plan and upgrade as your audience grows. No hidden fees, no long-term contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle className="text-xl">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">1 Publication</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">100 Subscribers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Basic AI Features</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Email Templates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">Most Popular</Badge>
              <CardHeader>
                <CardTitle className="text-xl">Creator</CardTitle>
                <CardDescription>For serious content creators</CardDescription>
                <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Unlimited Publications</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">5,000 Subscribers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Advanced AI Features</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Email Automation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Email Courses</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Analytics Dashboard</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
                <div className="text-3xl font-bold">$99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Everything in Creator</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">25,000 Subscribers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Priority Support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Custom Domains</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Advanced Analytics</span>
          </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">API Access</span>
          </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-0 shadow-hard">
            <CardContent className="text-center py-20">
              <h2 className="text-4xl md:text-5xl font-semibold mb-6">
                Ready to turn your ideas into{" "}
                <span className="text-primary">income?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Join the beta and be among the first creators to build their dream business with AI-powered tools.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="shadow-glow-lg text-lg px-8 py-6 h-auto">
                  Start Your Business - It's Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="text-xl font-bold text-primary">Kreeew</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
                <Link href="/support" className="hover:text-foreground transition-colors">
                  Support
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
              © 2024 Kreeew. All rights reserved.
            </div>
        </div>
        </footer>
      </main>
    </div>
  );
}