import { Metadata } from "next";
import LoginForm from "@/app/(auth)/login/LoginForm";
import Link from "next/link";
import Image from "next/image";
import loginImage from "@/assets/login-image.jpg";

export const metadata: Metadata = {
    title: "Login",
};

export default function LoginPage() {
    return (
        <main className="flex h-screen items-center justify-center p-5">
            <section className="flex h-full max-h-[40rem] max-w-[64rem] overflow-hidden rounded-2xl bg-card shadow-2xl">
                <div className="w-full space-y-10 overflow-y-hidden p-10 md:w-1/2">
                    <h1 className="text-center text-3xl font-bold">
                        Login to bugbook
                    </h1>
                    <LoginForm className="space-y-5" />
                    <div className="space-y-5 text-center">
                        Don&apos;t have an account?{" "}
                        <Link
                            href={"/signup"}
                            className="hover:text-blue-600 hover:underline"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
                <Image
                    src={loginImage}
                    alt=""
                    className="hidden w-1/2 object-cover md:block"
                />
            </section>
        </main>
    );
}
