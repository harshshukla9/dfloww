import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";
import { WalletProvider } from "./components/WalletProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "dkflow | Prediction Markets",
  description:
    "Trade on real-world events. Powered by dFlow on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <WalletProvider>
          <div
            style={{
              display: "flex",
              minHeight: "100vh",
            }}
          >
            <Sidebar />
            <main
              style={{
                flex: 1,
                marginLeft: 240,
                minHeight: "100vh",
              }}
            >
              {children}
            </main>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
