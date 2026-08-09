import type { Metadata } from "next";
import { DM_Sans, Fredoka, Inter, Space_Grotesk } from "next/font/google";
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

// Nav / menu bar type: geometric grotesque, reads more modern and professional
// than the playful Fredoka used for the hero and sticker buttons.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
    // suppressHydrationWarning: the theme init script sets data-theme on <html>
    // before hydration, so the attribute intentionally differs from the SSR HTML.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fredoka.variable} ${dmSans.variable} ${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
