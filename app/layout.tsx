import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Colitas Felices",
    description: "Adopta una mascota y encuentra tu nuevo mejor amigo en Colitas Felices. Explora perfiles de perros adorables, conoce sus historias y encuentra el compañero perfecto para tu hogar. ",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
  return (
        <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col">
            <LayoutWrapper>
                {children}
            </LayoutWrapper>
        </body>
        </html>
    );
}
