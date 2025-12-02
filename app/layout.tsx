import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "sonner" // <--- IMPORTANTE

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Marketplace 3D Chile",
  description: "Descubre y compra productos únicos impresos en 3D en Chile.",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <Toaster position="bottom-right" /> {/* <--- AGREGAR ESTO */}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
