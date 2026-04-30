'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, QrCode, TrendingUp, Bell, ArrowRight, ShieldCheck,
  MapPin, CheckCircle2, User, Activity, Clock
} from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid-pattern relative overflow-hidden">
      {/* Dynamic Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] rounded-[100%] bg-primary/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Attendance</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/register">
              <Button className="rounded-full px-6 shadow-md shadow-primary/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pb-24 relative z-10">

        {/* Hero Section */}
        <div className="pt-24 lg:pt-32 pb-16 px-6 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 animate-fade-in-up">
            <Activity className="w-4 h-4" />
            <span>The new standard for university attendance</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Smart roll calls.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Zero friction.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Say goodbye to paper registers. Empower your campus with lightning-fast QR check-ins, real-time analytics, and automated risk alerts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/register">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg font-semibold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1" icon={<ArrowRight className="w-5 h-5" />}>
                Start for free
              </Button>
            </Link>
          </div>
        </div>

        {/* High-Fidelity Animated Mockup */}
        <div className="px-6 max-w-5xl mx-auto mb-32 relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {/* Decorative glow behind mockup */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent blur-3xl -z-10 rounded-full opacity-50" />

          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

            {/* Main Content Area (Live QR) */}
            <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/50 relative overflow-hidden">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-semibold text-foreground">Live Session</span>
              </div>

              <div className="text-center mb-8 mt-4">
                <h3 className="text-2xl font-bold text-foreground mb-1">Software Engineering 301</h3>
                <p className="text-muted-foreground">Prof. Alan Turing &bull; Room 402</p>
              </div>

              {/* Pulsing QR Code */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-lg group-hover:bg-primary/30 transition-all duration-1000 animate-pulse" />
                <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-border/10 transform transition-transform hover:scale-105 duration-500">
                  <QrCode className="w-48 h-48 text-zinc-900" />
                  {/* Scanning laser line animation */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 blur-[1px] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              </div>

              <div className="mt-8 px-6 py-3 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Location Restricted: Science Building</span>
              </div>
            </div>

            {/* Sidebar (Live Check-ins) */}
            <div className="w-full md:w-80 bg-background/50 p-6 flex flex-col h-[500px]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black text-foreground">142<span className="text-lg text-muted-foreground font-medium">/150</span></div>
                  <div className="text-sm text-muted-foreground">Students Present</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent font-bold">
                  94%
                </div>
              </div>

              <div className="text-sm font-semibold text-foreground mb-4 flex items-center justify-between">
                <span>Recent Check-ins</span>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="flex-1 overflow-hidden relative">
                {/* Fade out masks */}
                <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-background to-transparent z-10" />
                <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-background to-transparent z-10" />

                {/* Animated List */}
                <div className="space-y-3 absolute top-0 w-full animate-[scrollUp_10s_linear_infinite]">
                  {[
                    { name: 'Sarah Connor', time: 'Just now' },
                    { name: 'John Smith', time: '1m ago' },
                    { name: 'Emily Chen', time: '1m ago' },
                    { name: 'Michael Scott', time: '2m ago' },
                    { name: 'Dwight Schrute', time: '2m ago' },
                    { name: 'Jim Halpert', time: '3m ago' },
                    { name: 'Pam Beesly', time: '3m ago' },
                  ].map((student, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.time}</div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Bento Grid */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Everything you need.</h2>
            <p className="text-lg text-muted-foreground">Built for modern universities that demand excellence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Bento Box */}
            <div className="md:col-span-2 bg-card border border-border/50 rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">Geofenced Check-ins</h3>
              <p className="text-lg text-muted-foreground max-w-md">
                Prevent proxy attendance instantly. Our smart QR codes verify the student's physical location within the lecture hall boundaries before marking them present.
              </p>
            </div>

            {/* Medium Bento Box 1 */}
            <div className="bg-card border border-border/50 rounded-3xl p-8 relative overflow-hidden group hover:border-accent/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Live Analytics</h3>
              <p className="text-muted-foreground">
                Get beautiful, interactive charts showing attendance trends across entire departments in real-time.
              </p>
            </div>

            {/* Medium Bento Box 2 */}
            <div className="bg-card border border-border/50 rounded-3xl p-8 relative overflow-hidden group hover:border-destructive/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
                <Bell className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Automated Alerts</h3>
              <p className="text-muted-foreground">
                Automatically email students the moment their attendance drops below the university threshold.
              </p>
            </div>

            {/* Medium Bento Box 3 */}
            <div className="md:col-span-2 bg-card border border-border/50 rounded-3xl p-8 lg:p-12 relative overflow-hidden group hover:border-primary/50 transition-colors flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-foreground mb-4">Export in One Click</h3>
              <p className="text-lg text-muted-foreground max-w-md">
                Generate comprehensive PDF and CSV reports for administrative compliance without any manual data entry.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Global Animation Styles for Mockup */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}} />

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">Secure University Infrastructure</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Attendance. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
