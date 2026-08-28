"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, LogOut, X } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/resume-analysis", label: "RESUME" },
  { href: "/jd-match", label: "JD MATCH" },
  { href: "/roadmap", label: "ROADMAP" },
  { href: "/chat", label: "CHAT" },
  { href: "/interview-prep", label: "INTERVIEW" },
  { href: "/classroom", label: "CLASSROOM" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AYU";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 border-r border-slate-800/60 bg-[#111927] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto text-slate-300 font-sans select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Top Brand Logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/40">
            <Link href="/dashboard" className="flex items-center gap-3 font-extrabold text-xl tracking-wider text-white">
              <GraduationCap className="h-7 w-7 text-purple-400" />
              <span>MENTOR</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 py-6 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === "/chat" && pathname === "/counselor") || (link.href === "/resume-analysis" && pathname === "/resume-analyzer") || (link.href === "/jd-match" && pathname === "/skill-gap") || (link.href === "/interview-prep" && pathname === "/mock-interview");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "block px-4 py-3 rounded-md text-xs font-bold tracking-widest transition-all",
                    isActive
                      ? "text-white bg-blue-600/30 border-l-4 border-blue-500 font-extrabold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile & Logout Section */}
        <div className="p-4 space-y-4 border-t border-slate-800/40">
          <Link href="/profile" className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-800/40 rounded-lg transition-colors">
            <Avatar className="h-10 w-10 border border-slate-700 bg-slate-800">
              <AvatarFallback className="bg-purple-900/60 text-purple-200 font-bold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "ayu"}</p>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">PROFILE</p>
            </div>
          </Link>

          <Button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-widest py-2.5 rounded-full shadow-lg transition-all"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            LOGOUT
          </Button>
        </div>
      </aside>
    </>
  );
}
