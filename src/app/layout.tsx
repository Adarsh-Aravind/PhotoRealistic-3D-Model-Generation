import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'VibeCode - AI 3D Generator',
    description: 'Generate photorealistic 3D models from prompts and images.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={clsx(inter.className, "bg-black text-white antialiased h-screen overflow-hidden")}>
                {children}
            </body>
        </html>
    );
}
