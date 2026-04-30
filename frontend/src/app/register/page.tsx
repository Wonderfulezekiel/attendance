'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ScanLine,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';

type RoleTab = 'student' | 'lecturer' | 'admin';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleTab>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data: any = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: role,
    };

    if (role === 'student') data.matric_number = formData.get('identifier');
    if (role === 'lecturer') data.staff_number = formData.get('identifier');

    try {
      api.resetAuthState();
      await api.post('/auth/register', data);
      // Auto login after register
      const response = await api.post('/auth/login', { email: data.email, password: data.password });
      login(response.access_token, response.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: RoleTab; label: string }[] = [
    { value: 'student', label: 'Student' },
    { value: 'lecturer', label: 'Lecturer' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background bg-grid-pattern relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/90/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground mb-4 rounded-sm shadow-lg">
            <ScanLine className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Attendance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Smart Lecture Attendance System
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-foreground text-center mb-6">
            Create a new account
          </h2>

          {/* Role selector tabs */}
          <div className="flex bg-background rounded-md p-1 mb-6">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-sm transition-all duration-200 cursor-pointer',
                  role === r.value
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-muted-foreground'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Register form */}
          {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">{error}</div>}
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              name="full_name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={<User className="w-4 h-4" />}
              required
              id="register-name"
            />
            
            <Input
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@university.edu"
              icon={<Mail className="w-4 h-4" />}
              required
              id="login-email"
            />

            <div className="relative">
              <Input
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={<Lock className="w-4 h-4" />}
                required
                id="register-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-muted-foreground transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {role !== 'admin' && (
              <Input
                name="identifier"
                label={role === 'student' ? 'Matric Number' : 'Staff Number'}
                type="text"
                placeholder={role === 'student' ? 'e.g. CSC/20/1234' : 'e.g. STF-5678'}
                icon={<User className="w-4 h-4" />}
                required
                id="register-identifier"
              />
            )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-border/50 bg-input accent-primary"
                  required
                />
                <span className="text-muted-foreground">I agree to the Terms & Conditions</span>
              </label>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign Up
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in instead
            </Link>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Secure university attendance management system
        </p>
      </div>
    </div>
  );
}
