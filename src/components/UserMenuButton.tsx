"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { LogOutIcon, UserIcon } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

interface UserMenuButtonProps {
    className?: string;
}

export default function UserMenuButton({ className }: UserMenuButtonProps) {
    const { user } = useSession();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar
                    className={cn("cursor-pointer", className)}
                    src={user.avatarUrl}
                    fallback={user.displayName}
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    Logged in as @{user.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={`/users/${user.username}`}>
                    <DropdownMenuItem>
                        <UserIcon className="mr-2 size-4" />
                        Profile
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={async () => {
                        await logout();
                    }}
                >
                    <LogOutIcon className="mr-2 size-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
