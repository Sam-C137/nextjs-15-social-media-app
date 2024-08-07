"use client";

import { Session, User } from "lucia";
import React from "react";

type SessionContext = {
    user: User;
    session: Session;
};

const SessionContext = React.createContext<SessionContext | undefined>(
    undefined,
);

export default function SessionProvider({
    children,
    value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = React.useContext(SessionContext);

    if (!context)
        throw new Error(
            "useSession must be used within Session context provider",
        );

    return context;
}
