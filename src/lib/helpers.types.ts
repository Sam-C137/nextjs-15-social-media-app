export type Optional<T> = T | null | undefined;

export type Paginated<T> = {
    items: T[];
    nextCursor: string | null;
};
