import { UserData } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
    UpdateProfileDetails,
    updateUserProfileSchema,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateProfile } from "@/app/(main)/users/[username]/mutations";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/loading-button";
import Image, { StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { Camera } from "lucide-react";
import CropImageDialog from "@/components/CropImageDialog";
import Resizer from "react-image-file-resizer";

interface EditProfileDialogProps {
    user: UserData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
    user,
    open,
    onOpenChange,
}: EditProfileDialogProps) {
    const form = useForm<UpdateProfileDetails>({
        resolver: zodResolver(updateUserProfileSchema),
        defaultValues: {
            displayName: user.displayName,
            bio: user.bio || "",
        },
    });
    const updateProfile = useUpdateProfile();
    const [croppedImg, setCroppedImg] = useState<Blob | null>(null);

    async function onSubmit(data: UpdateProfileDetails) {
        const avatar = croppedImg
            ? new File([croppedImg], `avatar_${user.id}.webp`)
            : undefined;

        updateProfile.mutate(
            {
                data,
                avatar,
            },
            {
                onSuccess: () => {
                    setCroppedImg(null);
                    onOpenChange(false);
                },
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle> Edit profile </DialogTitle>
                </DialogHeader>
                <div className="5 space-y-1">
                    <Label>Profile Picture</Label>
                    <ImageInput
                        src={
                            croppedImg
                                ? URL.createObjectURL(croppedImg)
                                : user.avatarUrl || avatarPlaceholder
                        }
                        onImageCropped={setCroppedImg}
                    />
                </div>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-3"
                    >
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="eg: Paul Scholes"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="bio"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Something small about you"
                                            {...field}
                                            className="resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <LoadingButton
                                type="submit"
                                loading={updateProfile.isPending}
                            >
                                Save
                            </LoadingButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

interface ImageInputProps {
    src: string | StaticImageData;
    onImageCropped: (blob: Blob | null) => void;
}

function ImageInput({ src, onImageCropped }: ImageInputProps) {
    const [imgToCrop, setImgToCrop] = useState<File>();
    const inputRef = useRef<HTMLInputElement>(null);

    function onImageSelected(image: File | undefined) {
        if (!image) return;

        Resizer.imageFileResizer(
            image,
            1024,
            1024,
            "WEBP",
            100,
            0,
            (uri) => setImgToCrop(uri as File),
            "file",
        );
    }

    return (
        <>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageSelected(e.target.files?.[0])}
                ref={inputRef}
                className="sr-only hidden"
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group relative block"
            >
                <Image
                    src={src}
                    alt="Profile preview"
                    width={150}
                    height={150}
                    className="size-32 flex-none rounded-full object-cover"
                />
                <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black bg-opacity-30 text-white transition-colors duration-200 group-hover:bg-opacity-25">
                    <Camera size={24} />
                </span>
            </button>
            {imgToCrop && (
                <CropImageDialog
                    src={URL.createObjectURL(imgToCrop)}
                    aspectRatio={1}
                    onCropped={onImageCropped}
                    onClose={() => {
                        setImgToCrop(undefined);
                        if (inputRef.current) inputRef.current.value = "";
                    }}
                />
            )}
        </>
    );
}
