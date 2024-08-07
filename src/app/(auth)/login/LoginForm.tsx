"use client";

import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, LoginUserDetails } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { login } from "@/app/(auth)/login/actions";

interface LoginFormProps extends React.HTMLAttributes<"div"> {}

export default function LoginForm({ className, ...props }: LoginFormProps) {
    const [error, setError] = useState<string>();
    const [isPending, startTransition] = useTransition();

    const form = useForm<LoginUserDetails>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    async function onSubmit(credentials: LoginUserDetails) {
        setError(undefined);
        startTransition(async () => {
            const { error } = await login(credentials);
            if (error) setError(error);
        });
    }

    return (
        <Form {...form}>
            <form
                className={cn(className)}
                onSubmit={form.handleSubmit(onSubmit)}
            >
                {error && (
                    <p className="text-center text-destructive">{error}</p>
                )}
                <FormField
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    name="username"
                />
                <FormField
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <PasswordInput
                                    placeholder="Password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    name="password"
                />
                <LoadingButton
                    type="submit"
                    loading={isPending}
                    className="w-full"
                >
                    Log In
                </LoadingButton>
            </form>
        </Form>
    );
}
