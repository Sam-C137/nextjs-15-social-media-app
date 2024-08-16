import { useSession } from "@/app/(main)/SessionProvider";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import ky from "@/lib/ky";

export default function useInitializeChatClient() {
    const { user } = useSession();
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);

    useEffect(() => {
        const client = StreamChat.getInstance(
            process.env.NEXT_PUBLIC_STREAM_KEY,
        );
        client
            .connectUser(
                {
                    id: user.id,
                    username: user.username,
                    name: user.displayName,
                    image: user.avatarUrl,
                },
                async () =>
                    ky
                        .get("/api/get-token")
                        .json<{
                            token: string;
                        }>()
                        .then((data) => data.token),
            )
            .catch((error) => console.error("Failed to connect user", error))
            .then(() => setChatClient(client));

        return () => {
            setChatClient(null);
            client
                .disconnectUser()
                .catch((error) =>
                    console.error("Failed to disconnect user", error),
                )
                .then(() => console.log("Connection closed"));
        };
    }, [user.avatarUrl, user.displayName, user.id, user.username]);

    return chatClient;
}
