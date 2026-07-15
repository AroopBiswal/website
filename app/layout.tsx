import type { Metadata } from "next";
import { DM_Sans, Fredoka, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aroop · Software Engineer",
  description:
    "Personal website of Aroop Biswal, Software Engineer at Google. Projects, experience, and contact.",
};

// Explicit toggle choice wins; otherwise follow the system setting; if that
// can't be read, default to dark.
const themeInit = `(function(){var t;try{t=localStorage.getItem("site-theme")}catch(e){}try{if(t!=="light"&&t!=="dark")t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}catch(e){t=t||"dark"}if(t==="dark")document.documentElement.dataset.theme="dark"})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} ${dmSans.variable} ${inter.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
