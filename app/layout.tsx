import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Outfit, Fraunces } from "next/font/google";
import { cookieToInitialState } from "wagmi";
import { config, projectId, metadata as WMetadata } from "@/lib/config";
import { headers } from "next/headers";
import WagmiProviderComp from "@/lib/wagmi-provider";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

if (!projectId) throw new Error("Project ID is not defined");

// Create modal
createWeb3Modal({
  metadata: WMetadata,
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "AcadLedger - Document Issuance and Verification Platform",
  description:
    "Secure document issuance and verification platform for institutions",
  generator: "v0.dev",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const initialState = cookieToInitialState(config, headersList.get("cookie"));


  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${fraunces.variable} font-sans`}>
        {" "}
        <WagmiProviderComp initialState={initialState}>
          {children}
        </WagmiProviderComp>
      </body>
    </html>
  );
}
