import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton: React.FC = () => {
    return (
        <div className="space-y-5">
            <LoadingItem />
            <LoadingItem />
            <LoadingItem />
        </div>
    );
};

function LoadingItem() {
    return (
        <div className="w-full animate-pulse space-y-3 rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex flex-wrap gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="5 space-y-1">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                </div>
            </div>
            <Skeleton className="h-16 rounded" />
        </div>
    );
}

export { LoadingSkeleton };
