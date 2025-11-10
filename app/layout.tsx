import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { Dancing_Script, Space_Mono as V0_Font_Space_Mono, Libre_Baskerville as V0_Font_Libre_Baskerville } from 'next/font/google'

// Initialize fonts with CSS variables
const spaceMono = V0_Font_Space_Mono({ 
  subsets: ['latin'], 
  weight: ["400","700"],
  variable: '--font-sans',
  display: 'swap',
})
const libreBaskerville = V0_Font_Libre_Baskerville({ 
  subsets: ['latin'], 
  weight: ["400","700"],
  variable: '--font-mono',
  display: 'swap',
})
const dancingScript = Dancing_Script({ 
  subsets: ["latin"], 
  weight: ["400", "700"],
  variable: '--font-signature',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Mikey's MPC App",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${libreBaskerville.variable} ${dancingScript.variable}`}>
      <body className={`${spaceMono.className} antialiased`}>{children}</body>
    </html>
  )
}
