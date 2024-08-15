import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
    InfiniteData,
    QueryFilters,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { useUploadThing } from "@/lib/uploadthing";
import { UpdateProfileDetails } from "@/lib/validations";
import { updateUserProfile } from "@/app/(main)/users/[username]/actions";
import { Paginated } from "@/lib/utils";
import { PostData } from "@/lib/types";

export function useUpdateProfile() {
    const { toast } = useToast();
    const router = useRouter();
    const client = useQueryClient();
    const { startUpload } = useUploadThing("avatar");

    return useMutation({
        mutationFn: async ({
            data,
            avatar,
        }: {
            data: UpdateProfileDetails;
            avatar?: File;
        }) => {
            return Promise.all([
                updateUserProfile(data),
                avatar && startUpload([avatar]),
            ]);
        },
        onSuccess: async ([updatedUser, uploadResults]) => {
            const newAvatarUrl = uploadResults?.[0];
            const queryFilter: QueryFilters = {
                queryKey: ["post-feed"],
            };
            await client.cancelQueries(queryFilter);

            client.setQueriesData<
                InfiniteData<Paginated<PostData>, string | null>
            >(queryFilter, (oldData) => {
                if (!oldData) return;

                return {
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page) => ({
                        nextCursor: page.nextCursor,
                        items: page.items.map((item) => {
                            if (item.user.id === updatedUser.id) {
                                return {
                                    ...item,
                                    user: {
                                        ...updatedUser,
                                        avatarUrl:
                                            newAvatarUrl?.serverData
                                                .avatarUrl ||
                                            updatedUser.avatarUrl,
                                    },
                                };
                            }
                            return item;
                        }),
                    })),
                };
            });

            router.refresh();
            toast({
                description: "Profile updated",
            });
        },
        onError(error) {
            console.error(error);
            toast({
                variant: "destructive",
                description: "Failed to update profile. Please try again",
            });
        },
    });
}
