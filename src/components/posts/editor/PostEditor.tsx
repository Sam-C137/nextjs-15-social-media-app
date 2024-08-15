"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/app/(main)/SessionProvider";
import "./styles.css";
import { useCreatePost } from "@/components/posts/editor/mutations";
import { LoadingButton } from "@/components/ui/loading-button";
import useMediaUpload, {
    Attachment,
} from "@/components/posts/editor/useMediaUpload";
import { ClipboardEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useDropzone } from "@uploadthing/react";

export default function PostEditor() {
    const { user } = useSession();
    const createPost = useCreatePost();
    const {
        startUpload,
        isUploading,
        uploadProgress,
        reset,
        attachments,
        removeAttachment,
    } = useMediaUpload();
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: startUpload,
    });
    const { onClick, ...rootProps } = getRootProps();

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
                mediaIds: attachments
                    .map((attachment) => attachment.mediaId!)
                    .filter(Boolean),
            },
            {
                onSuccess: () => {
                    editor?.commands.clearContent();
                    reset();
                },
            },
        );
    }

    async function onPaste(e: ClipboardEvent<HTMLInputElement>) {
        const files = Array.from(e.clipboardData.items)
            .filter((item) => item.kind === "file")
            .map((item) => item.getAsFile()) as File[];

        await startUpload(files);
    }

    return (
        <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex gap-5">
                <Avatar
                    src={user.avatarUrl}
                    fallback={user.displayName}
                    className="hidden w-[2.75rem] sm:inline"
                />
                <div {...rootProps} className="w-full">
                    <EditorContent
                        editor={editor}
                        className={cn(
                            "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3",
                            isDragActive && "outline-dashed",
                        )}
                        onPaste={onPaste}
                    />
                    <input {...getInputProps()} />
                </div>
            </div>
            {attachments.length > 0 && (
                <AttachmentPreviews
                    attachments={attachments}
                    removeAttachment={removeAttachment}
                />
            )}
            <div className="flex items-center justify-end gap-3">
                {isUploading && (
                    <>
                        <span className="text-sm">{uploadProgress ?? 0}%</span>
                        <Loader2 className="size-5 animate-spin text-primary" />
                    </>
                )}
                <AddAttachmentButton
                    onFilesSelected={startUpload}
                    disabled={isUploading || attachments.length >= 5}
                />
                <LoadingButton
                    loading={createPost.isPending}
                    type="submit"
                    onClick={onSubmit}
                    disabled={!input.trim() || isUploading}
                    className="min-w-20"
                >
                    Create Post
                </LoadingButton>
            </div>
        </div>
    );
}

interface AddAttachmentButtonProps {
    onFilesSelected: (files: File[]) => void;
    disabled: boolean;
}

function AddAttachmentButton({
    onFilesSelected,
    disabled,
}: AddAttachmentButtonProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <Button
                className="text-primary hover:text-primary"
                disabled={disabled}
                variant="ghost"
                size="icon"
                onClick={() => inputRef.current?.click()}
            >
                <ImageIcon size={20} />
            </Button>
            <input
                type="file"
                accept="image/*,video/*"
                multiple
                ref={inputRef}
                className="sr-only hidden"
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                        onFilesSelected(files);
                        e.target.value = "";
                    }
                }}
            />
        </>
    );
}

interface AttachmentPreviewsProps {
    attachments: Attachment[];
    removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
    attachments,
    removeAttachment,
}: AttachmentPreviewsProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3",
                attachments.length > 1 && "sm:grid sm:grid-cols-2",
            )}
        >
            {attachments.map((attachment) => (
                <AttachmentPreview
                    attachment={attachment}
                    onRemoveClick={() => removeAttachment(attachment.file.name)}
                    key={attachment.file.name}
                />
            ))}
        </div>
    );
}

interface AttachmentPreviewProps {
    attachment: Attachment;
    onRemoveClick: () => void;
}

function AttachmentPreview({
    attachment: { file, mediaId, isUploading },
    onRemoveClick,
}: AttachmentPreviewProps) {
    const src = URL.createObjectURL(file);

    return (
        <div
            className={cn(
                "relative mx-auto size-fit",
                isUploading && "opacity-50",
            )}
        >
            {file.type.startsWith("image") ? (
                <Image
                    src={src}
                    alt="Attachment preview"
                    width={500}
                    height={500}
                    className="size-fit max-h-[30rem] rounded-2xl"
                />
            ) : (
                <video controls className="size-fit max-h-[30rem] rounded-2xl">
                    <source src={src} type={file.type} />
                </video>
            )}
            {!isUploading && (
                <button
                    onClick={onRemoveClick}
                    className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    );
}
