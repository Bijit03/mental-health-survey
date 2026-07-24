import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mental-health concept survey",
  description:
    "An anonymous formative survey for a mental-health service concept.",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
