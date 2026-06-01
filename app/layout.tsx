import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300","400","500","600"], variable: "--font-dm-sans" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: "Video Tracker",
  description: "Video Production Tracker — Internal Tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${dmMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vt-theme');if(t)document.documentElement.classList.add(t);}catch(e){}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
