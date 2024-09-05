// RootLayout.js
"use client"
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
// Import the Inter font from Google
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '700'], // You can add different font weights
});



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
      <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
