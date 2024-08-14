import { LinkIt, LinkItUrl } from "react-linkify-it";
import Link from "next/link";
import UserMention from "@/components/UserMention";

export default function Linkify({ children }: React.PropsWithChildren) {
    return (
        <LinkifyUserName>
            <LinkifyHashTag>
                <LinkifyUrl>{children}</LinkifyUrl>
            </LinkifyHashTag>
        </LinkifyUserName>
    );
}

function LinkifyUrl({ children }: React.PropsWithChildren) {
    return (
        <LinkItUrl className="text-primary hover:underline">
            {children}
        </LinkItUrl>
    );
}

function LinkifyUserName({ children }: React.PropsWithChildren) {
    return (
        <LinkIt
            regex={/(@[a-zA-Z0-9_-]+)/}
            component={(match, key) => {
                const username = match.slice(1);

                return (
                    <UserMention username={username} key={key}>
                        {match}
                    </UserMention>
                );
            }}
        >
            {children}
        </LinkIt>
    );
}

function LinkifyHashTag({ children }: React.PropsWithChildren) {
    return (
        <LinkIt
            regex={/(#[a-zA-Z0-9]+)/}
            component={(match, key) => {
                const hashtag = match.slice(1);

                return (
                    <Link
                        href={`/hashtag/${hashtag}`}
                        className="text-primary hover:underline"
                        key={key}
                    >
                        {match}
                    </Link>
                );
            }}
        >
            {children}
        </LinkIt>
    );
}
