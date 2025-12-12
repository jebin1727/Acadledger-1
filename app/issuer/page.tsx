"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, PenTool, Download, History, PlusSquare } from "lucide-react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from 'wagmi'

export default function IssuerPage() {
    const { open } = useWeb3Modal();
    const { address } = useAccount();

    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b bg-white">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">AcadLedger</span>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded ml-2">ISSUER MODE</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button onClick={() => open()} variant="outline">
                            {address ? address.slice(0, 6) + "..." + address.slice(-4) : "Login as Institution"}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-12 max-w-5xl">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar / Menu */}
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg border">
                            <h3 className="font-semibold mb-4 text-slate-700">Actions</h3>
                            <div className="space-y-2">
                                <Button variant="secondary" className="w-full justify-start">
                                    <PlusSquare className="h-4 w-4 mr-2" /> Issue New Credential
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                                    <History className="h-4 w-4 mr-2" /> History (Coming Soon)
                                </Button>
                            </div>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <h3 className="font-semibold mb-2 text-purple-900">Demo Tools</h3>
                            <p className="text-xs text-purple-700 mb-4">
                                We don't have a real backend yet, so use these samples to test the verification flow.
                            </p>
                            <div className="space-y-2">
                                <a href="/sample-degree.html" target="_blank" className="block">
                                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                                        <Download className="h-4 w-4 mr-2" /> Get Valid Sample
                                    </Button>
                                </a>
                                <div className="text-center text-xs text-muted-foreground pt-1">
                                    Save as PDF or Screenshot
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Issue Credentials</h1>
                            <p className="text-muted-foreground">
                                Create tamper-proof documents anchord on Polygon.
                            </p>
                        </div>

                        {!address ? (
                            <div className="h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-8 space-y-4">
                                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Shield className="h-8 w-8 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Connect Wallet to Start</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        You need to sign transactions to attest documents on-chain.
                                    </p>
                                </div>
                                <Button onClick={() => open()}>Connect Wallet</Button>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-8 text-center space-y-6">
                                <div className="mx-auto h-20 w-20 bg-green-50 rounded-full flex items-center justify-center">
                                    <PenTool className="h-10 w-10 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">Institution Dashboard Active</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        In a real production app, this is where you would fill out a form (Name, Degree, ID) to generate the PDF and mint the hash.
                                    </p>
                                </div>
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded text-sm border border-yellow-200">
                                    <strong>Demo Tip:</strong> Use the "Get Valid Sample" button on the left to download a test certificate, then switch to the Verifier page to test it.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
