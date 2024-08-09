import PostEditor from "@/components/posts/editor/PostEditor";
import prisma from "@/lib/prisma";
import PostItem from "@/components/posts/PostItem";
import { postInclude } from "@/lib/types";
import TrendsSidebar from "@/components/TrendsSidebar";

export default async function Home() {
    const posts = await prisma.post.findMany({
        include: postInclude,
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <main className="flex w-full min-w-0 gap-5">
            <div className="w-full min-w-0 space-y-5">
                <PostEditor />
                {posts.map((post) => (
                    <PostItem post={post} key={post.id} />
                ))}
            </div>
            <TrendsSidebar />
        </main>
    );
}
