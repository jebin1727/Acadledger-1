"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, UserCircle2, Building2, FileSearch } from "lucide-react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from 'wagmi'

export default function Home() {
  const { open } = useWeb3Modal();
  const { address } = useAccount();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AcadLedger</span>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => open()} variant="outline">
              {address ? <div className="flex gap-2 items-center">
                <UserCircle2 className="h-8 w-8 mr-2" />
                {address.slice(0, 6)}...{address.slice(-4)}
              </div> : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Credential Trust Framework</h1>
          <p className="text-lg text-slate-600">
            Secure, AI-Augmented attestation on Polygon Layer 2. Select your role to continue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Institution Card */}
          <Link href="/issuer" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-xl transition-all h-full flex flex-col items-center text-center cursor-pointer group-hover:border-primary/50">
              <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">I am an Institution</h2>
              <p className="text-slate-500 mb-6">
                Issue new credentials, manage student records, and attest hashes to the blockchain.
              </p>
              <Button className="mt-auto w-full group-hover:bg-primary/90">
                Login to Dashboard
              </Button>
            </div>
          </Link>

          {/* Verifier Card */}
          <Link href="/verifier" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-xl transition-all h-full flex flex-col items-center text-center cursor-pointer group-hover:border-blue-500/50">
              <div className="h-20 w-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileSearch className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">I want to Verify</h2>
              <p className="text-slate-500 mb-6">
                Upload a document to check for AI tampering and blockchain authentication.
              </p>
              <Button variant="outline" className="mt-auto w-full group-hover:border-blue-500 group-hover:text-blue-600">
                Verify Document
              </Button>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-slate-400 font-mono">
            Powered by Gemini 1.5 Flash • Polygon Amoy Testnet
          </p>
        </div>
      </main>
    </div>
  );
}
