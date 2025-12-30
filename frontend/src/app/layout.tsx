import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'AI 故事創作工具',
    description: 'AI-powered story creation tool for screenwriters and content creators',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-TW">
            <body className="min-h-screen antialiased">
                {children}
            </body>
        </html>
    )
}
