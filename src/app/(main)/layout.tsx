import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "@/app/(main)/SessionProvider";
import Navbar from "@/components/Navbar";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await validateRequest();

    if (!session.user) redirect("/login");

    return (
        <SessionProvider value={session}>
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <div className="mx-auto max-w-7xl p-5">{children}</div>
            </div>
        </SessionProvider>
    );
}
