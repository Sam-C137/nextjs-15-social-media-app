import Link from "next/link";
import UserMenuButton from "@/components/navigation/UserMenuButton";
import { SearchInput } from "@/components/ui/search-input";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-10 bg-card shadow-sm">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-5 py-3">
                <Link
                    href="/public"
                    className="text-2xl font-bold text-primary"
                >
                    bugbook
                </Link>
                <SearchInput />
                <UserMenuButton className="sm:ms-auto" />
            </div>
        </header>
    );
}
