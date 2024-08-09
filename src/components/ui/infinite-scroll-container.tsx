import React from "react";
import { useInView } from "react-intersection-observer";

interface InfiniteScrollContainerProps extends React.PropsWithChildren {
    className?: string;
    onBottomReached: () => void;
}

const InfiniteScrollContainer = React.forwardRef<
    HTMLDivElement,
    InfiniteScrollContainerProps
>(({ children, className, onBottomReached }, ref) => {
    const { ref: interSectionRef } = useInView({
        rootMargin: "200px",
        onChange(inView) {
            if (inView) {
                onBottomReached();
            }
        },
    });

    return (
        <div className={className} ref={ref}>
            {children}
            <div ref={interSectionRef} />
        </div>
    );
});
InfiniteScrollContainer.displayName = "IntersectionObserverEntry";

export { InfiniteScrollContainer };
