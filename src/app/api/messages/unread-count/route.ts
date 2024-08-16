import { validateRequest } from "@/auth";
import streamServerClient from "@/lib/stream";

export async function GET() {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { total_unread_count } = await streamServerClient.getUnreadCount(
            user.id,
        );

        return Response.json({
            unreadCount: total_unread_count,
        });
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
