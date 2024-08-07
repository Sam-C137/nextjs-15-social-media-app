"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SearchInput = ({ className }: { className?: string }) => {
    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const { value } = e.currentTarget["q"];
        value.trim();
        if (!value) return;
        router.push(`/search?q=${encodeURIComponent(value)}`);
    }

    return (
        <form
            onSubmit={onSubmit}
            className={cn(className)}
            method="GET"
            action="/search"
        >
            <div className="relative">
                <Input name="q" placeholder="Search" className="pe-10" />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground" />
            </div>
        </form>
    );
};

export { SearchInput };
