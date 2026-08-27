import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BookNParty — Find & Book Party Venues",
  description:
    "Discover and book premium party venues, banquet halls, rooftops, farmhouses, and more for your celebrations. Corporate events, birthdays, weddings — all in one place.",
  keywords: "party venues, book banquet hall, event spaces, farmhouse booking, rooftop party",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e1b4b",
              color: "#fff",
              border: "1px solid rgba(139,92,246,0.3)",
            },
          }}
        />
      </body>
    </html>
  );
}
