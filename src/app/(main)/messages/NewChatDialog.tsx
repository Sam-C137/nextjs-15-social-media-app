import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DefaultStreamChatGenerics, useChatContext } from "stream-chat-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/app/(main)/SessionProvider";
import { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { UserResponse } from "stream-chat";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckIcon, Loader2, SearchIcon, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { LoadingButton } from "@/components/ui/loading-button";

interface NewChatDialogProps {
    onOpenChange: (open: boolean) => void;
    onChatCreated: () => void;
}

export default function NewChatDialog({
    onOpenChange,
    onChatCreated,
}: NewChatDialogProps) {
    const { client, setActiveChannel } = useChatContext();
    const { toast } = useToast();
    const { user: loggedInUser } = useSession();
    const [searchInput, setSearchInput] = useState("");
    const searchInputDebounced = useDebounce(searchInput);
    const [selectedUsers, setSelectedUsers] = useState<
        UserResponse<DefaultStreamChatGenerics>[]
    >([]);
    const { data, isPending, isError, isSuccess } = useQuery({
        queryKey: ["stream-users", searchInputDebounced],
        queryFn: async () =>
            client.queryUsers(
                {
                    id: { $ne: loggedInUser.id },
                    role: { $ne: "admin" },
                    ...(searchInputDebounced
                        ? {
                              $or: [
                                  {
                                      name: {
                                          $autocomplete: searchInputDebounced,
                                      },
                                  },
                                  {
                                      username: {
                                          $autocomplete: searchInputDebounced,
                                      },
                                  },
                              ],
                          }
                        : {}),
                },
                { name: 1, username: 1 },
                { limit: 15 },
            ),
    });
    const mutation = useMutation({
        mutationFn: async () => {
            const channel = client.channel("messaging", {
                members: [loggedInUser.id, ...selectedUsers.map((u) => u.id)],
                name:
                    selectedUsers.length > 1
                        ? loggedInUser.displayName +
                          ", " +
                          selectedUsers.map((u) => u.name).join(", ")
                        : undefined,
            });
            await channel.create();
            return channel;
        },
        onSuccess: (channel) => {
            setActiveChannel(channel);
            onChatCreated();
        },
        onError(error) {
            console.error("Error starting chat", error);
            toast({
                variant: "destructive",
                description: "Error starting chat, please try again",
            });
        },
    });

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="bg-card p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>New chat</DialogTitle>
                </DialogHeader>
                <div>
                    <div className="group relative">
                        <SearchIcon className="absolute left-5 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground group-focus-within:text-primary" />
                        <input
                            placeholder="Search users..."
                            className="h-12 w-full pe-4 ps-14 focus:outline-none"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                    {selectedUsers.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 p-2">
                            {selectedUsers.map((user) => (
                                <SelectedUserTag
                                    key={user.id}
                                    user={user}
                                    onRemove={() => {
                                        setSelectedUsers((prev) =>
                                            prev.filter(
                                                (u) => u.id !== user.id,
                                            ),
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    <hr />
                    <div className="h-96 overflow-y-auto">
                        {data &&
                            data?.users.map((user) => (
                                <UserResult
                                    user={user}
                                    selected={selectedUsers.some(
                                        (u) => u.id === user.id,
                                    )}
                                    key={user.id}
                                    onClick={() => {
                                        setSelectedUsers((prev) =>
                                            prev.some((u) => u.id === user.id)
                                                ? prev.filter(
                                                      (u) => u.id !== user.id,
                                                  )
                                                : [...prev, user],
                                        );
                                    }}
                                />
                            ))}
                        {data && data.users.length < 1 && (
                            <p className="my-3 text-center text-muted-foreground">
                                No users found. Try a different name.
                            </p>
                        )}
                        {isPending && (
                            <Loader2 className="mx-auto my-3 animate-spin" />
                        )}
                        {isError && (
                            <p className="my-3 text-center text-destructive">
                                An error occurred while searching for users
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter className="px-6 pb-6">
                    <LoadingButton
                        disabled={
                            selectedUsers.length < 1 || mutation.isPending
                        }
                        loading={mutation.isPending}
                        onClick={() => mutation.mutate()}
                    >
                        Start Chat
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface UserResultProps {
    user: UserResponse<DefaultStreamChatGenerics>;
    selected: boolean;
    onClick: () => void;
}

function UserResult({ user, selected, onClick }: UserResultProps) {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/50"
        >
            <div className="flex items-center gap-2">
                <Avatar src={user.image} fallback={user.name || ""} />
                <div className="flex flex-col text-start">
                    <p className="font-bold">{user.name}</p>
                    <p className="text-muted-foreground">@{user.username}</p>
                </div>
            </div>
            {selected && <CheckIcon className="size-5 text-green-500" />}
        </button>
    );
}

interface SelectedUserTagProps {
    user: UserResponse<DefaultStreamChatGenerics>;
    onRemove: () => void;
}

function SelectedUserTag({ user, onRemove }: SelectedUserTagProps) {
    return (
        <button
            onClick={onRemove}
            className="flex items-center gap-2 rounded-full border p-1 hover:bg-muted/50"
        >
            <Avatar src={user.image} fallback={user.name || ""} size={24} />
            <p className="font-bold">{user.name}</p>
            <X className="mx-2 size-5 text-muted-foreground" />
        </button>
    );
}
