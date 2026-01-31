"use client"
import Link from "next/link";
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Upload, Brain, Cpu, CheckCircle, AlertCircle, Loader2, Hash, FileCheck, Sparkles, Search } from "lucide-react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from 'wagmi'
import { parseDocumentWithAI, ExtractedDocumentData } from "@/lib/ai-utils";
import { hashStudentData, createCanonicalData } from "@/lib/privacy-utils";
import { verifyOnChain } from "@/lib/blockchain";
import axios from "axios";
import { ethers } from "ethers";
import { abi } from "@/lib/contract";

type VerifierStep = 'idle' | 'analyzing' | 'report' | 'verifying' | 'result';

export default function VerifierPage() {
    const { open } = useWeb3Modal();
    const { address } = useAccount();

    const [step, setStep] = useState<VerifierStep>('idle');
    const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<ExtractedDocumentData | null>(null);
    const [blockchainStatus, setBlockchainStatus] = useState<"IDLE" | "VALID" | "INVALID" | "ERROR">("IDLE");

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBlockchainStatus("IDLE");
        setAnalysis(null);
        setFileType(file.type);

        const reader = new FileReader();
        reader.onload = (e) => setUploadedPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        setStep('analyzing');
        try {
            // Step 1: Extract data first (Local AI)
            const localData = await parseDocumentWithAI(file);

            // Step 2: Try to get canonical hash from external backend for Visual Audit
            let finalHash = "";
            let similarityResult = "N/A";
            let fraudStatus = localData.isFraudulent;
            let reason = localData.fraudReason;

            try {
                const formData = new FormData();
                formData.append("pdf", file);

                const response = await axios.post("https://ledger.palatepals.com/verify", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 8000
                });

                finalHash = response.data.hash;
                similarityResult = response.data.similarity;
                fraudStatus = response.data.isFraudulent || (response.data.similarity !== "100%");
                reason = response.data.fraudReason || (response.data.similarity !== "100%" ? `Similarity check failed (${response.data.similarity})` : undefined);
            } catch (backendError) {
                console.warn("External verification service unreachable. Using local AI extraction and fingerprinting.", backendError);
                // Fallback: Generate hash locally from extracted metadata
                const canonical = createCanonicalData(
                    localData.recipientName || "UNKNOWN",
                    localData.recipientId || "UNKNOWN",
                    localData.documentType || "UNKNOWN"
                );
                finalHash = hashStudentData(canonical);
            }

            setAnalysis({
                ...localData,
                hash: finalHash,
                isFraudulent: fraudStatus,
                fraudReason: reason
            });

            setStep('report');
        } catch (error: any) {
            console.error("Verification analysis failed:", error);
            setStep('idle');
            // Optionally set an error state here if you have one
        }
    };

    const handleVerifyOnChain = async () => {
        if (!analysis?.hash) return;
        setStep('verifying');
        try {
            // Step 3: Check blockchain for the canonical hash
            const isValid = await verifyOnChain(analysis.hash);

            if (isValid) {
                // Step 4: Fetch detailed record if valid
                const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
                const contract = new ethers.Contract(
                    process.env.NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS || "0xA09916427843c35a233BF355bFAF1C735F9e75fa",
                    abi,
                    provider
                );

                const result = await contract.verifyDocument(analysis.hash);
                const ipfsURI = result[4];

                if (ipfsURI) {
                    const { data: docData } = await axios.get("/api/register", {
                        params: { cid: ipfsURI.replace("ipfs://", "") }
                    });

                    if (docData?.data) {
                        // Update analysis with verified on-chain data
                        setAnalysis(prev => ({
                            ...prev!,
                            recipientName: docData.data.recipient.fullName,
                            recipientId: docData.data.recipient.id,
                            documentType: docData.data.document.type,
                        }));
                    }
                }

                setBlockchainStatus("VALID");
            } else {
                setBlockchainStatus("INVALID");
            }
            setStep('result');
        } catch (error) {
            console.error(error);
            setBlockchainStatus("ERROR");
            setStep('result');
        }
    };

    const reset = () => {
        setStep('idle');
        setUploadedPreview(null);
        setAnalysis(null);
        setBlockchainStatus("IDLE");
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#020617] text-slate-50">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[35%] h-[35%] bg-cyan-600/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-[20%] right-[10%] w-[35%] h-[35%] bg-purple-600/5 blur-[100px] rounded-full" />
            </div>

            <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl transition-all duration-300">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative overflow-hidden h-10 w-10 p-1.5 rounded-xl bg-white flex items-center justify-center border border-white/10 group-hover:scale-110 transition-all duration-500 shadow-2xl group-hover:shadow-white/20">
                            <img src="/sethu-logo.png" alt="SIT Logo" className="w-full h-auto object-contain" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 group-hover:to-white transition-all duration-500">
                                AcadLedger
                            </span>
                            <span className="text-[8px] font-mono text-cyan-400 leading-none tracking-[0.2em] font-black uppercase opacity-60">SIT_Protocol</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Button
                            onClick={() => open()}
                            variant="outline"
                            className="relative overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 rounded-2xl h-11 px-6 group transition-all duration-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {address ? (
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse" />
                                    <span className="font-mono text-xs font-bold tracking-wider">{address.slice(0, 6)}...{address.slice(-4)}</span>
                                </div>
                            ) : (
                                <span className="relative z-10 font-bold tracking-wide">Connect Authority</span>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 container py-12 max-w-5xl">
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
                        Public Verification
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                        Upload any issued certificate to perform an <span className="text-cyan-400 font-medium">AI Visual Audit</span> and <span className="text-purple-400 font-medium">On-Chain Authentication</span>.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* Left Side: Upload & AI Scanner */}
                    <div className="lg:col-span-12 xl:col-span-12">
                        {step === 'idle' || step === 'analyzing' ? (
                            <div className={`p-10 rounded-[3rem] border transition-all duration-700 min-h-[400px] flex flex-col items-center justify-center ${step === 'analyzing' ? 'bg-cyan-500/5 border-cyan-500/30 shadow-2xl shadow-cyan-500/5' : 'glassmorphism border-white/10'}`}>
                                {step === 'analyzing' ? (
                                    <div className="text-center space-y-8 w-full max-w-md">
                                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                                            {fileType?.startsWith('image/') ? (
                                                <img src={uploadedPreview!} alt="Source" className="w-full h-full object-cover grayscale opacity-50" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
                                                    <FileCheck className="h-16 w-16 text-cyan-400 mb-4 animate-pulse" />
                                                    <span className="text-white font-mono text-xs tracking-widest uppercase">PDF_SOURCE_LOADED</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 top-0 h-1 bg-cyan-400 shadow-[0_0_20px_cyan] animate-scan z-10" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Brain className="h-10 w-10 text-cyan-400 animate-pulse" />
                                                    <span className="text-xs font-mono font-bold tracking-[0.3em] text-cyan-400">ANALYZING_PIXELS...</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500 animate-[progress_2s_ease-in-out_infinite]" />
                                            </div>
                                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-loose">
                                                Scanning document fabric... <br />
                                                Detecting Photoshop artifacts... <br />
                                                Extracting structured metadata...
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-28 w-28 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/10 group hover:scale-110 hover:border-cyan-500/40 transition-all duration-500">
                                            <Upload className="h-12 w-12 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                        </div>
                                        <div className="text-center max-w-sm mb-10">
                                            <h3 className="text-2xl font-bold text-white mb-3">Drop Certificate Source</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                Professional verification protocol. Supported formats: PDF, JPG, PNG. Max file size: 10MB.
                                            </p>
                                        </div>
                                        <label className="w-full max-w-md">
                                            <Button className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-cyan-500/50 font-bold text-lg relative overflow-hidden group transition-all">
                                                <span className="relative z-10 flex items-center justify-center gap-2">
                                                    <Search className="h-5 w-5 text-cyan-400" />
                                                    Select Official Document
                                                </span>
                                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                            </Button>
                                            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                                        </label>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                                {/* Result Dashboard */}
                                <div className="grid lg:grid-cols-2 gap-10">
                                    {/* AI Integrity Report */}
                                    <div className="glassmorphism p-8 rounded-[2.5rem] border-white/10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="h-10 w-10 glassmorphism rounded-xl flex items-center justify-center">
                                                <Brain className="h-6 w-6 text-cyan-400" />
                                            </div>
                                            <h3 className="text-xl font-black tracking-widest text-white/90 uppercase">AI_Visual_Audit</h3>
                                        </div>

                                        {analysis?.isFraudulent ? (
                                            <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/20 text-center space-y-6">
                                                <div className="h-20 w-20 bg-red-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto border border-red-500/20 animate-pulse">
                                                    <AlertCircle className="h-10 w-10 text-red-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-bold text-red-500 mb-2">Tampering Detected</h4>
                                                    <p className="text-red-400/80 text-sm leading-relaxed font-mono uppercase tracking-tighter">
                                                        {analysis.fraudReason || "Digital anomalies detected in typography and pixel alignment."}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-green-500/5 border border-green-500/20 shadow-lg shadow-green-500/5">
                                                    <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0">
                                                        <FileCheck className="h-8 w-8 text-green-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-bold text-green-500">Visual Integrity Passed</h4>
                                                        <p className="text-slate-400 text-xs mt-1">NO_SIGNS_OF_IMAGE_MANIPULATION</p>
                                                    </div>
                                                </div>

                                                {analysis && (
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                                            <DataField label="Recipient_Identity" value={analysis.recipientName} className="animate-in fade-in slide-in-from-bottom-4 duration-500" />
                                                            <DataField label="Credential_UID" value={analysis.recipientId} isMono className="animate-in fade-in slide-in-from-bottom-4 duration-700" />
                                                            <DataField label="Schema_Type" value={analysis.documentType} className="col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-1000" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Blockchain Authentication */}
                                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${blockchainStatus === 'VALID' ? 'bg-purple-500/[0.03] border-purple-500/30' : 'glassmorphism border-white/10'}`}>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="h-10 w-10 glassmorphism rounded-xl flex items-center justify-center">
                                                <Cpu className="h-6 w-6 text-purple-400" />
                                            </div>
                                            <h3 className="text-xl font-black tracking-widest text-white/90 uppercase">On-Chain_Sync</h3>
                                        </div>

                                        {blockchainStatus === 'IDLE' ? (
                                            <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-8">
                                                <p className="text-slate-500 text-sm max-w-[250px] leading-relaxed">
                                                    Query the immutable ledger to verify the extracted cryptographic fingerprint.
                                                </p>
                                                <Button
                                                    onClick={handleVerifyOnChain}
                                                    className="w-full h-16 rounded-[1.25rem] bg-cyber-gradient text-white font-black text-lg shadow-xl shadow-purple-500/20 hover:scale-[1.03] transition-all"
                                                >
                                                    Execute Verification
                                                </Button>
                                            </div>
                                        ) : step === 'verifying' ? (
                                            <div className="flex flex-col items-center justify-center h-[300px] space-y-6">
                                                <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
                                                <span className="text-xs font-mono tracking-[0.4em] text-purple-400 uppercase animate-pulse">QUERYING_POLYGON...</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-8 animate-in zoom-in duration-500">
                                                {blockchainStatus === 'VALID' ? (
                                                    <div className="space-y-8 text-center pt-4">
                                                        <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/50 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                                            <CheckCircle className="h-12 w-12 text-green-500" />
                                                        </div>
                                                        <div className="bg-green-500/10 p-6 rounded-[2rem] border border-green-500/20">
                                                            <h4 className="text-2xl font-black text-green-500 mb-1 uppercase tracking-tighter italic">Ledger Authenticated</h4>
                                                            <p className="text-xs text-green-400/70 font-mono tracking-widest">CRYPTOGRAPHIC_PROOF_EXISTS_ON_CHAIN</p>
                                                        </div>
                                                        <p className="text-slate-400 text-sm leading-relaxed px-4">
                                                            This record has been officially attested by the institution and remains unalterable on the L2 network.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-8 text-center pt-4">
                                                        <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                                            <AlertCircle className="h-12 w-12 text-red-500" />
                                                        </div>
                                                        <div className="bg-red-500/10 p-6 rounded-[2rem] border border-red-500/20">
                                                            <h4 className="text-2xl font-black text-red-500 mb-1 uppercase tracking-tighter italic">Proof Mismatch</h4>
                                                            <p className="text-xs text-red-400/70 font-mono tracking-widest">NO_RECORD_FOUND_ON_LEDGER</p>
                                                        </div>
                                                        <p className="text-slate-400 text-sm leading-relaxed px-4">
                                                            The document hash does not exist on the blockchain. This document may be informal or illegitimate.
                                                        </p>
                                                    </div>
                                                )}

                                                <Button onClick={reset} variant="outline" className="w-full h-14 rounded-xl border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-all uppercase text-xs font-black tracking-widest">
                                                    Reset Protocol
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-white/5 relative z-10 w-full">
                <div className="container flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        <span className="text-sm font-bold tracking-tight text-white uppercase">AcadLedger Protocol</span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                        SECURE_SCAN_V2.0.4 • POLYGON_L2 • GEMINI_1.5
                    </p>
                </div>
            </footer>
        </div>
    );
}

function DataField({ label, value, isMono = false, className = "" }: { label: string, value: string | undefined, isMono?: boolean, className?: string }) {
    return (
        <div className={`space-y-2 group/field ${className}`}>
            <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-[.3em] font-black block font-mono group-hover/field:text-cyan-400 transition-colors duration-300">{label}</span>
                <div className="h-[1px] flex-1 bg-white/[0.03] group-hover/field:bg-cyan-500/20 transition-colors" />
            </div>
            <div className={`
                relative overflow-hidden px-5 py-4 rounded-2xl 
                bg-gradient-to-br from-white/[0.04] to-transparent 
                border border-white/5 text-white/90 
                group-hover/field:border-cyan-500/30 group-hover/field:from-white/[0.08]
                group-hover/field:translate-x-1 transition-all duration-500 shadow-lg
                ${isMono ? 'font-mono text-sm font-bold text-cyan-400/90' : 'font-sans font-black text-xl tracking-tighter'}
            `}>
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover/field:opacity-100 transition-opacity" />
                <span className="relative z-10 uppercase">{value || 'NOT_DECODED'}</span>
            </div>
        </div>
    );
}
