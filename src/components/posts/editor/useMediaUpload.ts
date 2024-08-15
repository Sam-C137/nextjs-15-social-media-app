import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

export interface Attachment {
    file: File;
    mediaId?: string;
    isUploading: boolean;
}

export default function useMediaUpload() {
    const { toast } = useToast();
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>();

    const { startUpload, isUploading } = useUploadThing("attachment", {
        onBeforeUploadBegin(files) {
            const renamed = files.map((file) => {
                const ext = file.name.split(".").pop();
                return new File(
                    [file],
                    `attachment_${crypto.randomUUID()}.${ext}`,
                    {
                        type: file.type,
                    },
                );
            });

            setAttachments((prev) => [
                ...prev,
                ...renamed.map((file) => ({
                    file,
                    isUploading: true,
                })),
            ]);

            return renamed;
        },
        onUploadProgress: setUploadProgress,
        onClientUploadComplete(res) {
            setAttachments((prev) =>
                prev.map((a) => {
                    const found = res.find((r) => r.name === a.file.name);

                    if (!found) return a;

                    return {
                        ...a,
                        mediaId: found.serverData.mediaId,
                        isUploading: false,
                    };
                }),
            );
        },
        onUploadError(e) {
            setAttachments((prev) =>
                prev.filter((attachments) => !attachments.isUploading),
            );
            toast({
                variant: "destructive",
                description: e.message,
            });
        },
    });

    async function handleStartUpload(files: File[]) {
        if (isUploading) {
            toast({
                variant: "destructive",
                description: "Please wait until the current upload completes",
            });
            return;
        }

        if (attachments.length + files.length > 5) {
            toast({
                variant: "destructive",
                description: "You can only upload up to 5 attachments per post",
            });
            return;
        }

        await startUpload(files);
    }

    function removeAttachment(fileName: string) {
        setAttachments((prev) =>
            prev.filter((attachments) => attachments.file.name !== fileName),
        );
    }

    function reset() {
        setAttachments([]);
        setUploadProgress(undefined);
    }

    return {
        startUpload: handleStartUpload,
        attachments,
        isUploading,
        uploadProgress,
        removeAttachment,
        reset,
    };
}
