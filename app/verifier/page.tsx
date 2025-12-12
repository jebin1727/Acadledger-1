"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Upload, CheckCircle, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from 'wagmi'
import { useState } from "react";
import { parseDocumentWithAI, ExtractedDocumentData } from "@/lib/ai-utils";
import { hashStudentData } from "@/lib/privacy-utils";
import { useAttestation } from "@/hooks/use-attestation";

export default function VerifierPage() {
    const { open } = useWeb3Modal();
    const { address } = useAccount();

    // --- AI & Blockchain Logic ---
    const [file, setFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<ExtractedDocumentData | null>(null);
    const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);
    const { attestCredential, isAttesting, txHash, isSuccess } = useAttestation();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setAnalysis(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setIsAnalyzeLoading(true);
        try {
            const result = await parseDocumentWithAI(file);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
            alert("AI Analysis Failed. Check console.");
        } finally {
            setIsAnalyzeLoading(false);
        }
    };

    const handleMint = () => {
        if (!analysis) return;
        const studentData = {
            recipientName: analysis.recipientName || "",
            recipientEmail: "",
            recipientId: analysis.recipientId || "",
            documentType: analysis.documentType || "",
            documentDescription: "AI Extracted Credential",
            issuedAt: Date.now(),
        };
        const hash = hashStudentData(studentData);
        attestCredential(hash as `0x${string}`);
    };
    // -----------------------------

    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b bg-white">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">AcadLedger</span>
                        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">VERIFIER MODE</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {!address && <Button onClick={() => open()} variant="ghost">Connect Wallet (Optional)</Button>}
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-12 max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-4">Verify Documents</h1>
                    <p className="text-muted-foreground">
                        Upload a certificate image or PDF. Our AI will check for tampering, and the Blockchain will check for validity.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-xl border overflow-hidden">
                    {!analysis ? (
                        <div className="p-12 flex flex-col items-center gap-8 min-h-[400px] justify-center">
                            <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center">
                                <Upload className="h-10 w-10 text-blue-600" />
                            </div>
                            <div className="text-center space-y-4 w-full max-w-md">
                                <label className="block w-full cursor-pointer">
                                    <span className="sr-only">Choose file</span>
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:bg-slate-50 transition">
                                        <p className="text-sm font-medium text-slate-600">Click to Upload Certificate</p>
                                        <p className="text-xs text-slate-400 mt-2">Supports PDF, PNG, JPG</p>
                                    </div>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                {file && (
                                    <div className="text-sm font-medium text-blue-700 bg-blue-50 p-2 rounded">
                                        Selected: {file.name}
                                    </div>
                                )}
                            </div>
                            <Button size="lg" onClick={handleAnalyze} disabled={!file || isAnalyzeLoading} className="w-full max-w-sm">
                                {isAnalyzeLoading ? "AI Analyzing Pixels..." : "Analyze Document"}
                            </Button>
                        </div>
                    ) : (
                        <div className="p-8 space-y-8 animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center justify-between border-b pb-6">
                                <h2 className="text-2xl font-bold">Analysis Report</h2>
                                <Button variant="outline" onClick={() => setAnalysis(null)}>Scan Another</Button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-muted-foreground mb-4 uppercase tracking-wider text-xs">Visual Integrity (AI)</h3>
                                    {analysis.isFraudulent ? (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                                            <h4 className="text-xl font-bold text-red-700">Tampering Detected</h4>
                                            <p className="text-red-600 mt-2">{analysis.fraudReason || "Visual artifacts suggest editing."}</p>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                                            <h4 className="text-xl font-bold text-green-700">Visually Authentic</h4>
                                            <p className="text-green-600 mt-2">No signs of digital tampering found.</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-muted-foreground mb-4 uppercase tracking-wider text-xs">Extracted Data</h3>
                                    <div className="space-y-4 bg-slate-50 p-6 rounded-lg border">
                                        <div>
                                            <label className="text-xs text-slate-500">Recipient Name</label>
                                            <p className="font-medium text-lg">{analysis.recipientName}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">Degree/Credential</label>
                                            <p className="font-medium">{analysis.documentType}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">ID Number</label>
                                            <p className="font-medium text-mono">{analysis.recipientId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Blockchain Verification Section - Only show if Valid */}
                            {!analysis.isFraudulent && (
                                <div className="pt-6 border-t">
                                    <h3 className="font-semibold mb-4">Blockchain Authentication</h3>
                                    <div className="flex items-center gap-4">
                                        <Button
                                            onClick={handleMint}
                                            disabled={isAttesting || !address}
                                            variant={isSuccess ? "outline" : "default"}
                                            className="flex-1"
                                        >
                                            {!address ? "Connect Wallet to Check Chain" :
                                                isAttesting ? "Checking Chain..." :
                                                    isSuccess ? "Verified on Polygon!" : "Verify on Polygon Amoy"}
                                        </Button>
                                        {isSuccess && (
                                            <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" className="p-3 bg-slate-100 rounded hover:bg-slate-200 transition">
                                                <LinkIcon className="h-5 w-5 text-slate-700" />
                                            </a>
                                        )}
                                    </div>
                                    {!address && <p className="text-xs text-center mt-2 text-muted-foreground">You need to connect a wallet to query the smart contract.</p>}
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
