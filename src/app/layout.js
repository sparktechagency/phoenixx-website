"use client";
import "./globals.css";
import Navbar from "@/components/Navber";
import { usePathname } from "next/navigation";



export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');
  return (
    <html lang="en">
      <body
        className={`antialiased`}
         cz-shortcut-listen="true"
      >
      {!isAuthPage && <Navbar />}
        {children}
      </body>
    </html>
  );
}
