"use client"
import Link from "next/link";
import { useState, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Shield,
    Upload,
    Brain,
    Cpu,
    CheckCircle,
    AlertCircle,
    Loader2,
    Hash,
    FileCheck,
    Sparkles,
    Search,
    ShieldCheck,
    ArrowRight
} from "lucide-react";
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
    const [network, setNetwork] = useState<"PUBLIC" | "LOCAL">("PUBLIC");
    const [showJson, setShowJson] = useState(false);
    const [analysisJson, setAnalysisJson] = useState<string | null>(null);

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
            const localData = await parseDocumentWithAI(file);

            let finalHash = "";
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
                fraudStatus = response.data.isFraudulent || (response.data.similarity !== "100%");
                reason = response.data.fraudReason || (response.data.similarity !== "100%" ? `Similarity check failed (${response.data.similarity})` : undefined);
            } catch (err) {
                const canonical = createCanonicalData(
                    localData.recipientName || "UNKNOWN",
                    localData.recipientId || "UNKNOWN",
                    localData.documentType || "UNKNOWN"
                );
                finalHash = hashStudentData(canonical);
            }

            const enriched = { ...localData, hash: finalHash, isFraudulent: fraudStatus, fraudReason: reason };
            setAnalysis(enriched);
            setAnalysisJson(JSON.stringify({ protocol: "AcadLedger_V2", analysis: enriched, timestamp: new Date().toISOString() }, null, 2));
            setStep('report');
        } catch (error) {
            console.error(error);
            setStep('idle');
        }
    };

    const handleVerifyOnChain = async () => {
        if (!analysis?.hash) return;
        setStep('verifying');
        try {
            // Respect selected network
            const rpc = network === "PUBLIC"
                ? "https://rpc-amoy.polygon.technology/"
                : "http://localhost:8549";

            const provider = new ethers.JsonRpcProvider(rpc);
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS || "0xA09916427843c35a233BF355bFAF1C735F9e75fa",
                abi,
                provider
            );

            const result = await contract.verifyDocument(analysis.hash);
            setBlockchainStatus(result[0] ? "VALID" : "INVALID");
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
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[35%] h-[35%] bg-cyan-600/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-[20%] right-[10%] w-[35%] h-[35%] bg-purple-600/5 blur-[100px] rounded-full" />
            </div>

            <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-2xl transition-all duration-300">
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative h-10 w-10 p-1 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-all duration-500 shadow-2xl group-hover:shadow-cyan-500/10">
                            <img src="/New Project 100 [31F474F].png" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">AcadLedger</span>
                            <span className="text-[8px] font-sans text-cyan-400 tracking-[0.2em] uppercase opacity-60">Global Protocol</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/explorer" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors">Explorer</Link>
                        <Link href="/verifier" className="text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors border-b border-cyan-500/50 pb-1">Verify</Link>
                        <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors">Dashboard</Link>
                    </nav>

                    <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                        <button
                            onClick={() => setNetwork("PUBLIC")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${network === "PUBLIC" ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Amoy
                        </button>
                        <button
                            onClick={() => setNetwork("LOCAL")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${network === "LOCAL" ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Node
                        </button>
                    </div>

                    <Button onClick={() => open()} variant="outline" className="border-white/5 bg-white/5 rounded-2xl h-11 px-6 font-bold tracking-wide">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Authority"}
                    </Button>
                </div>
            </header>

            <main className="flex-1 relative z-10 container py-12 max-w-5xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Public Verification</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                        Upload any issued certificate to perform an <span className="text-cyan-400 font-medium">AI Visual Audit</span> and <span className="text-purple-400 font-medium">On-Chain Authentication</span>.
                    </p>
                </div>

                {step === 'idle' || step === 'analyzing' ? (
                    <div className={`p-10 rounded-[3rem] border transition-all duration-700 min-h-[400px] flex flex-col items-center justify-center ${step === 'analyzing' ? 'bg-cyan-500/5 border-cyan-500/30' : 'glassmorphism border-white/10'}`}>
                        {step === 'analyzing' ? (
                            <div className="text-center space-y-8 w-full max-w-md">
                                <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black/40">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-cyan-400 shadow-[0_0_20px_cyan] animate-scan z-10" />
                                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                                        <Brain className="h-10 w-10 text-cyan-400 animate-pulse" />
                                        <span className="text-xs font-sans font-bold tracking-[0.3em] text-cyan-400 uppercase">Analyzing_Pixels...</span>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 animate-[progress_2s_ease-in-out_infinite]" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="h-28 w-28 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/10">
                                    <Upload className="h-12 w-12 text-slate-400" />
                                </div>
                                <label className="w-full max-w-md">
                                    <Button asChild className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg cursor-pointer">
                                        <span>Select Official Document</span>
                                    </Button>
                                    <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                                </label>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="grid lg:grid-cols-2 gap-10">
                            {/* AI Report */}
                            <div className="glassmorphism p-8 rounded-[2.5rem] border-white/10">
                                <div className="flex items-center gap-4 mb-8">
                                    <Brain className="h-6 w-6 text-cyan-400" />
                                    <h3 className="text-xl font-black tracking-widest uppercase">AI_Visual_Audit</h3>
                                </div>
                                {analysis?.isFraudulent ? (
                                    <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/20 text-center space-y-6">
                                        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                                        <h4 className="text-2xl font-bold text-red-500">Tampering Detected</h4>
                                        <p className="text-red-400/80 text-sm font-mono uppercase">{analysis.fraudReason}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex gap-6 p-6 rounded-[2rem] bg-green-500/5 border border-green-500/20">
                                            <FileCheck className="h-8 w-8 text-green-500" />
                                            <div>
                                                <h4 className="text-xl font-bold text-green-500">Visual Integrity Passed</h4>
                                                <p className="text-slate-400 text-xs mt-1">NO_SIGNS_OF_MANIPULATION</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <DataField label="Recipient" value={analysis?.recipientName} />
                                            <DataField label="ID" value={analysis?.recipientId} isMono />
                                            <DataField label="Schema" value={analysis?.documentType} className="col-span-2" isSpecial />
                                        </div>
                                        <Button onClick={() => setShowJson(!showJson)} variant="outline" className="w-full text-[10px] font-black tracking-widest uppercase rounded-full">
                                            {showJson ? "Hide Data Matrix" : "View Data Matrix"}
                                        </Button>
                                        {showJson && <pre className="bg-black/40 p-4 rounded-xl text-[10px] text-cyan-500/80 overflow-auto">{analysisJson}</pre>}
                                    </div>
                                )}
                            </div>

                            {/* Blockchain Verification */}
                            <div className={`p-8 rounded-[2.5rem] border transition-all ${blockchainStatus === 'VALID' ? 'bg-purple-500/5 border-purple-500/30' : 'glassmorphism border-white/10'}`}>
                                <div className="flex items-center gap-4 mb-8">
                                    <Cpu className="h-6 w-6 text-purple-400" />
                                    <h3 className="text-xl font-black tracking-widest uppercase">On-Chain_Sync</h3>
                                </div>
                                {blockchainStatus === 'IDLE' ? (
                                    <div className="h-[300px] flex flex-col items-center justify-center space-y-8">
                                        <p className="text-slate-500 text-sm text-center">Verify the extracted fingerprint against the immutable ledger.</p>
                                        <Button onClick={handleVerifyOnChain} className="w-full h-16 rounded-2xl bg-cyber-gradient text-white font-bold text-lg shadow-xl shadow-purple-500/20">
                                            Execute Verification
                                        </Button>
                                    </div>
                                ) : step === 'verifying' ? (
                                    <div className="h-[300px] flex flex-col items-center justify-center space-y-6">
                                        <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
                                        <span className="text-xs font-extrabold tracking-widest text-purple-400 uppercase animate-pulse">Querying_Polygon...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-6 text-center">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 ${blockchainStatus === 'VALID' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                                            {blockchainStatus === 'VALID' ? <CheckCircle className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
                                        </div>
                                        <h4 className={`text-2xl font-bold uppercase ${blockchainStatus === 'VALID' ? 'text-green-500' : 'text-red-500'}`}>
                                            {blockchainStatus === 'VALID' ? "Authenticated" : "Proof Failed"}
                                        </h4>
                                        <Button onClick={reset} variant="ghost" className="text-slate-500 uppercase text-[10px] font-black">Reset Protocol</Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Truth Chain Visualization */}
                        {analysis && (
                            <div className="glassmorphism p-10 rounded-[3rem] border-white/5 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck className="h-32 w-32" /></div>
                                <div className="flex items-center gap-6 mb-12">
                                    <div className="h-14 w-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                                        <ShieldCheck className="h-8 w-8 text-cyan-400" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight uppercase italic">Trust_Chain_Verification</h3>
                                </div>

                                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                                    <StepBox title="1. Metadata State" color="cyan">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name: <span className="text-white ml-2">{analysis.recipientName}</span></p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">UID: <span className="text-white ml-2">{analysis.recipientId}</span></p>
                                        </div>
                                    </StepBox>
                                    <StepBox title="2. Canonical JSON" color="purple">
                                        <pre className="text-[9px] font-mono text-purple-300 break-all leading-tight">
                                            {JSON.stringify(createCanonicalData(analysis.recipientName!, analysis.recipientId!, analysis.documentType!), null, 1)}
                                        </pre>
                                    </StepBox>
                                    <StepBox title="3. Result Digest" color="green">
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2">Keccak-256 Hash</p>
                                        <p className="text-[9px] font-mono text-green-400 break-all leading-tight bg-green-500/5 p-2 rounded-lg border border-green-500/10">
                                            {hashStudentData(createCanonicalData(analysis.recipientName!, analysis.recipientId!, analysis.documentType!))}
                                        </p>
                                    </StepBox>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="py-12 border-t border-white/5 opacity-40">
                <div className="container flex justify-between items-center whitespace-nowrap overflow-hidden">
                    <span className="text-xs font-bold uppercase tracking-widest">AcadLedger Protocol v2.5.0</span>
                    <span className="text-xs font-mono text-slate-500">Polygon Amoy Testnet • Secure Audit Baseline</span>
                </div>
            </footer>
        </div>
    );
}

function StepBox({ title, children, color }: { title: string, children: React.ReactNode, color: string }) {
    const colors = {
        cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
        purple: "border-purple-500/20 bg-purple-500/5 text-purple-400",
        green: "border-green-500/20 bg-green-500/5 text-green-400"
    }[color as 'cyan' | 'purple' | 'green'];

    return (
        <div className={`p-6 rounded-[2rem] border ${colors}`}>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">{title}</h4>
            {children}
        </div>
    );
}

function DataField({ label, value, isMono = false, isSpecial = false, className = "" }: { label: string, value: string | undefined, isMono?: boolean, isSpecial?: boolean, className?: string }) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">{label}</span>
            <div className={`px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] ${isMono ? 'font-mono text-xs' : 'font-semibold text-sm'} ${isSpecial ? 'bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400' : 'text-white'}`}>
                {value || "-"}
            </div>
        </div>
    );
}
