"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, UserCheck, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(email, password, name);
      router.push("/dashboard");
    } catch {
      // error handled by store
    }
  };

  const handleGuestAccess = async () => {
    setGuestLoading(true);
    try {
      const guestEmail = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}@placementmentor.app`;
      await useAuthStore.getState().register(guestEmail, "GuestPassword123!", "Guest User");
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030612] text-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#070b19] border-slate-800/80 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Brain className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
          <CardDescription className="text-slate-400">Get started with AI Placement Mentor</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-950/60 border border-red-900 p-3 text-xs text-red-300">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 text-xs font-semibold">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[#040714] border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-xs font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#040714] border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-xs font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#040714] border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3.5">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold" disabled={isLoading || guestLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="relative w-full my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#070b19] px-2 text-slate-500 font-semibold">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGuestAccess}
              disabled={guestLoading}
              className="w-full border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium"
            >
              {guestLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="mr-2 h-4 w-4 text-emerald-400" />}
              Continue as Guest (No Login Required)
            </Button>

            <p className="text-xs text-slate-400 text-center pt-2">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-400 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
