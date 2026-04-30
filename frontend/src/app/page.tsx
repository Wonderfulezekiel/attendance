'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, ShieldCheck, MapPin, CheckCircle2,
  ScanLine, BarChart3, BellRing, User,
  Lock, LayoutDashboard, Users, Settings, QrCode
} from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans antialiased overflow-x-hidden">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-sm">
              <ScanLine className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Attendance</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-6 h-10 font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Text */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted text-foreground text-xs font-semibold tracking-wide uppercase mb-6 rounded-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Beta Available
                </div>
                
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95] text-foreground mb-8">
                  Check-in.<br />
                  <span className="text-muted-foreground">Reinvented.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
                  Eliminate manual roll calls. Secure, location-verified attendance tracking designed for modern universities and massive lecture halls.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8 text-base font-semibold group">
                      Start your workspace
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#features" className="w-full sm:w-auto hidden sm:block">
                    <Button size="lg" variant="outline" className="w-full h-14 border-border text-foreground hover:bg-accent rounded-none px-8 text-base font-semibold">
                      Explore features
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Visuals - Realistic SaaS Dashboard Mockup */}
              <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square flex items-center justify-center p-4 md:p-8 perspective-[2000px]">
                {/* Ambient background glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                
                {/* Dashboard Window */}
                <div className="relative w-full max-w-lg bg-background rounded-xl border border-border/50 shadow-2xl overflow-hidden flex flex-col transform rotate-y-[-10deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-0 hover:scale-[1.02]">
                  
                  {/* MacOS Style Titlebar */}
                  <div className="h-10 bg-muted/40 border-b border-border/50 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    </div>
                    <div className="mx-auto flex items-center gap-2 bg-background border border-border/50 rounded-md px-24 py-1">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium">app.attendance.com/live/csc411</span>
                    </div>
                  </div>

                  {/* App Layout */}
                  <div className="flex flex-1 h-[320px]">
                    {/* Mini Sidebar */}
                    <div className="w-12 bg-muted/20 border-r border-border/50 flex flex-col items-center py-4 gap-4">
                      <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center mb-2">
                        <ScanLine className="w-3 h-3" />
                      </div>
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <Settings className="w-4 h-4 text-muted-foreground mt-auto" />
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-5 flex flex-col gap-4 bg-background/50">
                      
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">CSC 411: Software Engineering</h3>
                          <p className="text-[10px] text-muted-foreground">Live Attendance Session</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Live</span>
                        </div>
                      </div>

                      <div className="flex gap-4 h-full">
                        {/* QR Code Container */}
                        <div className="w-1/3 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg flex flex-col items-center justify-center p-3 shadow-sm relative overflow-hidden">
                          {/* Animated Scan Line */}
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/50 blur-[1px] animate-[scan_3s_ease-in-out_infinite]" />
                          
                          <QrCode className="w-16 h-16 text-zinc-900 dark:text-white mb-2" strokeWidth={1.5} />
                          <div className="text-[10px] text-muted-foreground font-mono">CODE: <span className="font-bold text-foreground">AX89B</span></div>
                        </div>

                        {/* Real-time Student Feed */}
                        <div className="flex-1 flex flex-col gap-2 relative">
                          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Recent Scans (124/150)</div>
                          
                          {/* Student Row 1 */}
                          <div className="flex items-center justify-between bg-card border border-border/50 p-2 rounded-md shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">EJ</div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-foreground">Ezekiel J.</span>
                                <span className="text-[9px] text-muted-foreground">CSC/20/1234</span>
                              </div>
                            </div>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          </div>

                          {/* Student Row 2 */}
                          <div className="flex items-center justify-between bg-card border border-border/50 p-2 rounded-md shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">MS</div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-foreground">Michael S.</span>
                                <span className="text-[9px] text-muted-foreground">CSC/20/4567</span>
                              </div>
                            </div>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          </div>

                          {/* Student Row 3 - Faded to show scroll */}
                          <div className="flex items-center justify-between bg-card border border-border/50 p-2 rounded-md shadow-sm opacity-50">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">DS</div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-foreground">Dwight S.</span>
                                <span className="text-[9px] text-muted-foreground">CSC/20/8901</span>
                              </div>
                            </div>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Highlights - Brutalist Grid */}
        <section id="features" className="py-24 bg-card text-card-foreground border-t-8 border-foreground">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                Engineered for scale.<br />
                Designed for speed.
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
                We've stripped away the complexity of traditional attendance systems. What's left is a powerful, precise, and completely frictionless experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
              {/* Feature 1 */}
              <div className="bg-card p-10 lg:p-12 hover:bg-muted/50 transition-colors">
                <MapPin className="w-10 h-10 text-primary mb-8" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold mb-4">Geofenced Restrictions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Pinpoint accuracy. Students can only check-in when physically present in the designated lecture hall or classroom. Zero proxy attendance.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card p-10 lg:p-12 hover:bg-muted/50 transition-colors">
                <BarChart3 className="w-10 h-10 text-primary mb-8" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold mb-4">Real-time Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Instantly visualize attendance patterns. Export beautifully formatted reports for administration with a single click.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card p-10 lg:p-12 hover:bg-muted/50 transition-colors">
                <BellRing className="w-10 h-10 text-primary mb-8" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold mb-4">Automated Triggers</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Set thresholds and let the system handle the rest. Automatic email alerts to students when their attendance drops below university requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow / Details Section */}
        <section className="py-32 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1 flex flex-col gap-8">
                <div className="flex gap-6 items-start group">
                  <div className="w-12 h-12 bg-muted flex-shrink-0 flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">01</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-foreground">Create Session</h4>
                    <p className="text-muted-foreground">Lecturers initiate a secure session with a unique, dynamically regenerating QR code.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start group">
                  <div className="w-12 h-12 bg-muted flex-shrink-0 flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">02</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-foreground">Student Scan</h4>
                    <p className="text-muted-foreground">Students scan the code via the web app. Device GPS confirms they are within the lecture theater boundaries.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start group">
                  <div className="w-12 h-12 bg-muted flex-shrink-0 flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">03</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-foreground">Instant Sync</h4>
                    <p className="text-muted-foreground">Data is instantly validated and synced to the dashboard, providing the lecturer with a real-time headcount.</p>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 bg-muted/30 border-2 border-border p-8 md:p-12 relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-background" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '8px 8px', color: 'var(--foreground)', opacity: 0.2 }} />
                
                <h3 className="text-3xl font-bold mb-8 text-foreground relative z-10">The standard for compliance.</h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between p-5 bg-card border-2 border-border shadow-[4px_4px_0px_0px_var(--foreground)]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted flex items-center justify-center rounded-sm"><User className="w-6 h-6 text-foreground" /></div>
                      <div>
                        <div className="font-bold text-foreground">Michael Scott</div>
                        <div className="text-sm text-muted-foreground font-medium">Computer Science</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider border border-green-500/20">Present</div>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-card border-2 border-border shadow-[4px_4px_0px_0px_var(--foreground)] opacity-75">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted flex items-center justify-center rounded-sm"><User className="w-6 h-6 text-foreground" /></div>
                      <div>
                        <div className="font-bold text-foreground">Dwight Schrute</div>
                        <div className="text-sm text-muted-foreground font-medium">Software Engineering</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-destructive/10 text-destructive dark:text-red-400 text-xs font-bold uppercase tracking-wider border border-destructive/20">Absent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-foreground font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>Attendance Infrastructure</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Attendance. Built for scale.
          </div>
        </div>
      </footer>
    </div>
  );
}
