"use client"
import Link from "next/link";
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Upload, Brain, Cpu, CheckCircle, AlertCircle, Loader2, ExternalLink, FileText, Hash, Sparkles } from "lucide-react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from 'wagmi'
import { hashStudentData, PrivateStudentData } from "@/lib/privacy-utils";
import { attestOnChain } from "@/lib/blockchain";
import { parseDocumentWithAI, ExtractedDocumentData } from "@/lib/ai-utils";

// Workflow step type
type WorkflowStep = 'idle' | 'uploading' | 'extracting' | 'extracted' | 'hashing' | 'attesting' | 'complete' | 'error';

export default function IssuerPage() {
    const { open } = useWeb3Modal();
    const { address } = useAccount();

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-purple-400" />
                        <span className="text-xl font-bold text-white">AcadLedger</span>
                        <span className="text-xs font-mono bg-purple-500/20 text-purple-300 px-2 py-1 rounded ml-2">DEMO</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button onClick={() => open()} variant="outline" className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20">
                            {address ? address.slice(0, 6) + "..." + address.slice(-4) : "Connect Wallet"}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-8 max-w-6xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">🎓 Document Attestation Demo</h1>
                    <p className="text-purple-300">Upload Document → AI Extracts Metadata → Attest on Blockchain → Get Transaction Hash</p>
                </div>

                {!address ? (
                    <div className="max-w-md mx-auto p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
                        <div className="h-20 w-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="h-10 w-10 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet to Start Demo</h3>
                        <p className="text-purple-300 mb-6">You need to connect Metamask to sign attestation transactions</p>
                        <Button onClick={() => open()} className="bg-purple-600 hover:bg-purple-700">
                            Connect Wallet
                        </Button>
                    </div>
                ) : (
                    <DemoWorkflow address={address} />
                )}
            </main>
        </div>
    );
}

function DemoWorkflow({ address }: { address: string }) {
    const [step, setStep] = useState<WorkflowStep>('idle');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
    const [documentHash, setDocumentHash] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFile(file);
        setStep('uploading');
        setError(null);
        setExtractedData(null);
        setDocumentHash(null);
        setTxHash(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setUploadedPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        // Extract with AI
        setStep('extracting');
        try {
            const data = await parseDocumentWithAI(file);
            setExtractedData(data);
            setStep('extracted');
        } catch (err: any) {
            setError("AI extraction failed: " + err.message);
            setStep('error');
        }
    };

    const handleAttest = async () => {
        if (!extractedData) return;

        setStep('hashing');
        setError(null);

        try {
            // Create hash from extracted data
            const studentData: PrivateStudentData = {
                recipientName: extractedData.recipientName || "Unknown",
                recipientId: extractedData.recipientId || "N/A",
                recipientEmail: "demo@acadledger.com",
                documentType: extractedData.documentType || "Certificate",
                documentDescription: `Confidence: ${(extractedData.confidenceScore * 100).toFixed(0)}%`,
                issuedAt: Date.now(),
            };

            const hash = hashStudentData(studentData);
            setDocumentHash(hash);

            setStep('attesting');

            // Attest on blockchain
            const result = await attestOnChain(hash);

            if (result.success && result.txHash) {
                setTxHash(result.txHash);
                setStep('complete');
            } else {
                setError(result.error || "Attestation failed");
                setStep('error');
            }
        } catch (err: any) {
            setError(err.message || "Process failed");
            setStep('error');
        }
    };

    const reset = () => {
        setStep('idle');
        setUploadedFile(null);
        setUploadedPreview(null);
        setExtractedData(null);
        setDocumentHash(null);
        setTxHash(null);
        setError(null);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Upload & Preview */}
            <div className="space-y-6">
                {/* Step 1: Upload */}
                <div className={`p-6 rounded-2xl border transition-all ${step === 'idle' ? 'bg-purple-500/10 border-purple-500/50' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step !== 'idle' ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'}`}>
                            {step !== 'idle' ? '✓' : '1'}
                        </div>
                        <h3 className="text-lg font-semibold text-white">Upload Document</h3>
                    </div>

                    <label className="block cursor-pointer">
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all hover:border-purple-400 ${uploadedPreview ? 'border-green-500/50' : 'border-white/20'}`}>
                            {uploadedPreview ? (
                                <img src={uploadedPreview} alt="Uploaded" className="max-h-48 mx-auto rounded-lg shadow-lg" />
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                                    <p className="text-white font-medium">Drop image or click to upload</p>
                                    <p className="text-purple-300 text-sm">PDF, JPG, PNG supported</p>
                                </>
                            )}
                        </div>
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
                    </label>
                    {uploadedFile && (
                        <p className="mt-2 text-sm text-purple-300 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> {uploadedFile.name}
                        </p>
                    )}
                </div>

                {/* Step 2: AI Extraction */}
                <div className={`p-6 rounded-2xl border transition-all ${step === 'extracting' ? 'bg-purple-500/10 border-purple-500/50 animate-pulse' : step === 'extracted' || step === 'hashing' || step === 'attesting' || step === 'complete' ? 'bg-white/5 border-green-500/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${['extracted', 'hashing', 'attesting', 'complete'].includes(step) ? 'bg-green-500 text-white' : step === 'extracting' ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-400'}`}>
                            {['extracted', 'hashing', 'attesting', 'complete'].includes(step) ? '✓' : step === 'extracting' ? <Loader2 className="h-4 w-4 animate-spin" /> : '2'}
                        </div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-400" /> AI Metadata Extraction
                        </h3>
                    </div>

                    {step === 'extracting' && (
                        <div className="flex items-center gap-3 text-purple-300">
                            <Sparkles className="h-5 w-5 animate-pulse" />
                            <span>Gemini AI analyzing document...</span>
                        </div>
                    )}

                    {extractedData && (
                        <div className="bg-black/30 rounded-xl p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-purple-400">Name</span>
                                    <p className="text-white font-medium">{extractedData.recipientName || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-purple-400">ID</span>
                                    <p className="text-white font-medium">{extractedData.recipientId || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-purple-400">Document Type</span>
                                    <p className="text-white font-medium">{extractedData.documentType || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {extractedData.isFraudulent ? (
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                    )}
                                    <span className={extractedData.isFraudulent ? 'text-red-400' : 'text-green-400'}>
                                        {extractedData.isFraudulent ? 'Fraud Detected!' : 'Document Authentic'}
                                    </span>
                                </div>
                                <span className="text-purple-300 text-sm">
                                    Confidence: {(extractedData.confidenceScore * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Blockchain */}
            <div className="space-y-6">
                {/* Step 3: Hash Generation */}
                <div className={`p-6 rounded-2xl border transition-all ${step === 'hashing' ? 'bg-purple-500/10 border-purple-500/50' : ['attesting', 'complete'].includes(step) ? 'bg-white/5 border-green-500/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${['attesting', 'complete'].includes(step) ? 'bg-green-500 text-white' : step === 'hashing' ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-400'}`}>
                            {['attesting', 'complete'].includes(step) ? '✓' : step === 'hashing' ? <Loader2 className="h-4 w-4 animate-spin" /> : '3'}
                        </div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Hash className="h-5 w-5 text-purple-400" /> Generate Hash
                        </h3>
                    </div>

                    {documentHash && (
                        <div className="bg-black/30 rounded-xl p-4">
                            <span className="text-purple-400 text-xs uppercase">Keccak256 Hash</span>
                            <p className="text-green-400 font-mono text-xs break-all mt-1">{documentHash}</p>
                        </div>
                    )}
                </div>

                {/* Step 4: Blockchain Attestation */}
                <div className={`p-6 rounded-2xl border transition-all ${step === 'attesting' ? 'bg-purple-500/10 border-purple-500/50 animate-pulse' : step === 'complete' ? 'bg-green-500/10 border-green-500/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'complete' ? 'bg-green-500 text-white' : step === 'attesting' ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-400'}`}>
                            {step === 'complete' ? '✓' : step === 'attesting' ? <Loader2 className="h-4 w-4 animate-spin" /> : '4'}
                        </div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-purple-400" /> Blockchain Attestation
                        </h3>
                    </div>

                    {step === 'attesting' && (
                        <div className="flex items-center gap-3 text-purple-300">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Confirm transaction in Metamask...</span>
                        </div>
                    )}

                    {txHash && (
                        <div className="bg-black/30 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-green-400 font-semibold">
                                <CheckCircle className="h-5 w-5" />
                                <span>Attestation Successful!</span>
                            </div>
                            <div>
                                <span className="text-purple-400 text-xs uppercase">Transaction Hash</span>
                                <p className="text-green-400 font-mono text-xs break-all mt-1">{txHash}</p>
                            </div>
                            <a
                                href={`https://ganache-explorer.local/tx/${txHash}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-100 text-sm"
                            >
                                <ExternalLink className="h-4 w-4" /> View on Explorer (Local Network)
                            </a>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {step === 'extracted' && !extractedData?.isFraudulent && (
                        <Button
                            onClick={handleAttest}
                            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            <Cpu className="mr-2 h-5 w-5" /> Attest on Blockchain
                        </Button>
                    )}

                    {step === 'extracted' && extractedData?.isFraudulent && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-center">
                            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                            Cannot attest fraudulent document
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 'complete' && (
                        <Button onClick={reset} variant="outline" className="w-full border-green-500/50 text-green-400 hover:bg-green-500/20">
                            ✨ Attest Another Document
                        </Button>
                    )}
                </div>

                {/* Wallet Info */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-400">Connected Wallet</span>
                        <span className="text-white font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-purple-400">Network</span>
                        <span className="text-green-400">Ganache Local (Chain 1337)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
