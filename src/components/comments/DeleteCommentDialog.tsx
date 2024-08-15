import { CommentData } from "@/lib/types";
import { useDeleteComment } from "@/components/comments/mutations";
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

interface DeleteCommentDialogProps {
    comment: CommentData;
    open: boolean;
    onClose: () => void;
}

export default function DeleteCommentDialog({
    comment,
    open,
    onClose,
}: DeleteCommentDialogProps) {
    const deleteComment = useDeleteComment();

    function handleOpenChange(open: boolean) {
        if (!open || !deleteComment.isPending) {
            onClose();
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Comment?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Are you sure you want to delete this comment? This action
                    cannot be undone.
                </DialogDescription>
                <DialogFooter>
                    <LoadingButton
                        variant="destructive"
                        onClick={() =>
                            deleteComment.mutate(comment.id, {
                                onSuccess: onClose,
                            })
                        }
                        loading={deleteComment.isPending}
                    >
                        Delete
                    </LoadingButton>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={deleteComment.isPending}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
