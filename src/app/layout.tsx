import type { Metadata, Viewport } from "next";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import "@/styles/globals.css";

export const metadata: Metadata = {
    title: "LSAT Mission — The Lounge",
    description: "Community hub for live practice, peer review, and strategy sharing.",
};

export const viewport: Viewport = {
    themeColor: "#7f56d9",
    colorScheme: "light",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-primary antialiased">
                <RouteProvider>
                    <Theme>{children}</Theme>
                </RouteProvider>
            </body>
        </html>
    );
}
