"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { Menu, LogOut, User } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuthStore();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-800/80 bg-[#050817]/90 backdrop-blur-md px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-slate-800 bg-slate-900/80 hover:bg-slate-800">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-600/20 text-blue-400 font-bold text-xs">
                {initials || "GU"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#070b19] border-slate-800 text-slate-200" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-white">{user?.name || "Guest User"}</p>
              <p className="text-xs leading-none text-slate-400">
                {user?.email || "guest@placementmentor.app"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-800" />
          <Link href="/profile">
            <DropdownMenuItem className="focus:bg-slate-900 focus:text-white cursor-pointer">
              <User className="mr-2 h-4 w-4 text-blue-400" />
              Profile
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem onClick={logout} className="focus:bg-slate-900 focus:text-red-400 cursor-pointer text-red-400">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
