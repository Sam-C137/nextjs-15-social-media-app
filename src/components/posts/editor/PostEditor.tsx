"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/app/(main)/SessionProvider";
import "./styles.css";
import { useCreatePost } from "@/components/posts/editor/mutations";
import { LoadingButton } from "@/components/ui/loading-button";

export default function PostEditor() {
    const { user } = useSession();
    const createPost = useCreatePost();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bold: false,
                italic: false,
            }),
            Placeholder.configure({
                placeholder: "What's crack-a-lackin'?",
            }),
        ],
    });

    const input =
        editor?.getText({
            blockSeparator: "\n",
        }) || "";

    function onSubmit() {
        createPost.mutate(
            {
                content: input,
            },
            {
                onSuccess: () => {
                    editor?.commands.clearContent();
                },
            },
        );
    }

    return (
        <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex gap-5">
                <Avatar
                    src={user.avatarUrl}
                    fallback={user.displayName}
                    className="hidden w-[2.75rem] sm:inline"
                />
                <EditorContent
                    editor={editor}
                    className="max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3"
                />
            </div>
            <div className="flex justify-end">
                <LoadingButton
                    loading={createPost.isPending}
                    type="submit"
                    onClick={onSubmit}
                    disabled={!input.trim()}
                    className="min-w-20"
                >
                    Create Post
                </LoadingButton>
            </div>
        </div>
    );
}
