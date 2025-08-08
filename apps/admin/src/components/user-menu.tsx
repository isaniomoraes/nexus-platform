"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@nexus/ui/components";
import { useMe } from "@/src/hooks/use-me";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const router = useRouter();
  const me = useMe();
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8">
          {/* TODO: Add user avatar */}
          <AvatarImage
            src="https://api.dicebear.com/9.x/lorelei/svg?seed=Eden"
            alt={me.data?.data.name ?? "User"}
          />
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            BT
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-2">
          <div className="text-sm font-medium leading-none">
            {me.data?.data.name ?? "Account"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {me.data?.data.email ?? ""}
          </div>
        </div>
        <DropdownMenuSeparator />
        <Link href="/profile" className="no-underline">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            void handleLogout();
          }}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
