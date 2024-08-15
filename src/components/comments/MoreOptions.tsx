import { CommentData } from "@/lib/types";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Trash2 } from "lucide-react";
import DeleteCommentDialog from "@/components/comments/DeleteCommentDialog";

interface MoreOptionsProps {
    comment: CommentData;
    className?: string;
}

export default function MoreOptions({ className, comment }: MoreOptionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        className={cn(className)}
                    >
                        <MoreHorizontal className="size-5 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                        <span className="flex items-center gap-3 text-destructive">
                            <Trash2 className="size-4" />
                            Delete
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DeleteCommentDialog
                comment={comment}
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
            />
        </>
    );
}
