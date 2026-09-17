import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "DMK IT Solutions | Technology That Helps Your Business Grow",
  description: "DMK IT Solutions helps local and growing businesses attract customers, automate work, and understand their data through websites, business technology, automation, and analytics.",
  metadataBase: new URL("https://dmkitsolutions.com")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}