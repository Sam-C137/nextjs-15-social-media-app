import { Metadata } from "next";
import TrendsSidebar from "@/components/navigation/TrendsSidebar";
import Notifications from "@/app/(main)/notifications/Notifications";

interface PageProps {}

export const metadata: Metadata = {
    title: "Notifications",
};

export default async function Page() {
    return (
        <main className="flex w-full min-w-0 gap-5">
            <div className="w-full min-w-0 space-y-5">
                <div className="rounded-2xl bg-card p-5 shadow-sm">
                    <h1 className="text-center text-2xl font-bold">
                        Notifications
                    </h1>
                </div>
                <Notifications />
            </div>
            <TrendsSidebar />
        </main>
    );
}
