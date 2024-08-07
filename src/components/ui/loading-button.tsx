import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
    loading?: boolean;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ loading, disabled, className, children, ...props }, ref) => {
        return (
            <Button
                disabled={loading || disabled}
                className={cn("flex items-center gap-2", className)}
                {...props}
            >
                {loading && <Loader2 className="animate-spin" />}
                {children}
            </Button>
        );
    },
);
LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
