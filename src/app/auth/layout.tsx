import { ThemeToggle } from "@/components/theme-toggle";
import { Package2 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center">
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="container mx-auto flex h-14 items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <Package2 className="h-6 w-6" />
                        <span className="font-bold">Auth Boilerplate</span>
                    </Link>
                    <div className="flex-1" />
                    <ThemeToggle />
                </div>
            </header>
            <main className="flex w-full flex-1 items-center justify-center">
                <div className="w-full max-w-md p-4">
                    <div className="bg-card rounded-xl shadow-lg p-4 sm:p-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
} 