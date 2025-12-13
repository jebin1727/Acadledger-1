"use client"
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, PenTool, Download, History, PlusSquare, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from 'wagmi'
import { hashStudentData, PrivateStudentData } from "@/lib/privacy-utils";
import { attestOnChain } from "@/lib/blockchain";

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
                            <div className="border rounded-lg p-8 space-y-6">
                                <div className="flex items-center gap-4 border-b pb-4">
                                    <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                                        <PenTool className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Issue New Credential</h3>
                                        <p className="text-sm text-muted-foreground">Fill in the student details to generate a secure attestation.</p>
                                    </div>
                                </div>

                                <IssuerForm />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function IssuerForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        recipientName: "Alice Student",
        recipientId: "STU-2024-001",
        recipientEmail: "alice@example.com",
        documentType: "Bachelor of Computer Science",
        documentDescription: "Awarded for completing all requirements.",
    });

    const handleIssue = async () => {
        setIsLoading(true);
        setError(null);
        setTxHash(null);

        try {
            // 1. Prepare Data
            const studentData: PrivateStudentData = {
                ...formData,
                issuedAt: Date.now(),
            };

            // 2. Hash Data (Privacy Layer)
            const hash = hashStudentData(studentData);
            console.log("Generated Hash:", hash);

            // 3. Attest on Blockchain (Truth Layer)
            const result = await attestOnChain(hash);

            if (result.success && result.txHash) {
                setTxHash(result.txHash);
            } else {
                setError(result.error || "Unknown error during attestation");
            }

        } catch (err: any) {
            setError(err.message || "Failed to process");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Student Name</Label>
                    <Input
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Student ID</Label>
                    <Input
                        value={formData.recipientId}
                        onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Document Type / Degree</Label>
                <Input
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label>Description / Major</Label>
                <Input
                    value={formData.documentDescription}
                    onChange={(e) => setFormData({ ...formData, documentDescription: e.target.value })}
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {error}
                </div>
            )}

            {txHash && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
                    <div className="flex items-center gap-2 font-semibold mb-1">
                        <CheckCircle className="h-4 w-4" /> Success! Attestation Minted.
                    </div>
                    <p className="font-mono text-xs break-all text-green-800 opacity-80">TX: {txHash}</p>
                    <p className="mt-2 text-xs text-black">
                        In a real app, we would now generate the PDF containing these details hidden in metadata.
                    </p>
                </div>
            )}

            <Button onClick={handleIssue} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Issuing & Attesting...
                    </>
                ) : (
                    <>
                        <PenTool className="mr-2 h-4 w-4" /> Issue Certificate (On-Chain)
                    </>
                )}
            </Button>
        </div>
    );
}
