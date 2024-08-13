import { PostData } from "@/lib/types";
import { useDeletePost } from "@/components/posts/post-item/mutations";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";

interface DeletePostDialogProps {
    post: PostData;
    open: boolean;
    onClose: () => void;
}

export default function DeletePostDialog({
    post,
    open,
    onClose,
}: DeletePostDialogProps) {
    const deletePost = useDeletePost();

    function handleOpenChange(open: boolean) {
        if (!open || !deletePost.isPending) {
            onClose();
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Post?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Are you sure you want to delete this post? This action
                    cannot be undone.
                </DialogDescription>
                <DialogFooter>
                    <LoadingButton
                        variant="destructive"
                        onClick={() =>
                            deletePost.mutate(post.id, { onSuccess: onClose })
                        }
                        loading={deletePost.isPending}
                    >
                        Delete
                    </LoadingButton>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={deletePost.isPending}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
