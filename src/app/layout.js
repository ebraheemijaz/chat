// app/layout.jsx
"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./context/AuthContext";
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen w-full bg-coursebuddy text-white">
        <AuthProvider>
        <Header />
        <main className="flex-1 w-full">
          {children}
          </main>
        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
