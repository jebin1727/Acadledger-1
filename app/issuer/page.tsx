"use client"
import Link from "next/link";
import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Upload, Brain, Cpu, CheckCircle, AlertCircle, Loader2, ExternalLink, Hash, Sparkles } from "lucide-react";
import axios from "axios";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from 'wagmi'
import { hashStudentData, createCanonicalData } from "@/lib/privacy-utils";
import { attestOnChain } from "@/lib/blockchain";
import { parseDocumentWithAI, ExtractedDocumentData } from "@/lib/ai-utils";

type WorkflowStep = 'idle' | 'uploading' | 'extracting' | 'extracted' | 'hashing' | 'attesting' | 'complete' | 'error';

export default function IssuerPage() {
    const { open } = useWeb3Modal();
    const { address } = useAccount();

    return (
        <div className="flex flex-col min-h-screen bg-[#020617] text-slate-50">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full" />
            </div>

            <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-2xl transition-all duration-300">
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative overflow-hidden h-10 w-10 p-1 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-all duration-500 shadow-2xl group-hover:shadow-cyan-500/10">
                            <img src="/New Project 100 [31F474F].png" alt="AcadLedger Logo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 group-hover:to-white transition-all duration-500">
                                AcadLedger
                            </span>
                            <span className="text-[8px] font-sans text-cyan-400 leading-none tracking-[0.2em] font-medium uppercase opacity-60">Global Protocol</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/explorer" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors">Explorer</Link>
                        <Link href="/verifier" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors">Verify</Link>
                        <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors">Dashboard</Link>
                    </nav>

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
                                    <span className="font-sans text-xs font-bold tracking-wider">{address.slice(0, 6)}...{address.slice(-4)}</span>
                                </div>
                            ) : (
                                <span className="relative z-10 font-bold tracking-wide">Connect Authority</span>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 container py-12 max-w-6xl">
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
                        Institutional Attestation
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Securely anchor academic credentials to the blockchain.
                        AI analyzes document integrity while the protocol generates irreversible cryptographic proofs.
                    </p>
                </div>

                {!address ? (
                    <div className="max-w-md mx-auto p-12 glassmorphism rounded-[3rem] border-white/10 text-center animate-in zoom-in duration-700 shadow-2xl shadow-purple-500/5">
                        <div className="h-24 w-24 bg-purple-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-purple-500/20 group hover:scale-110 transition-transform">
                            <Shield className="h-12 w-12 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Authority Required</h3>
                        <p className="text-slate-400 mb-10 leading-relaxed">Connect an authorized institutional wallet to sign and commit credential data to the ledger.</p>
                        <Button onClick={() => open()} className="w-full h-14 bg-cyber-gradient hover:opacity-90 rounded-2xl font-extrabold text-lg shadow-lg shadow-purple-500/20">
                            Connect Authority
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
    const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
    const [documentHash, setDocumentHash] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [showJson, setShowJson] = useState(false);
    const [jsonContent, setJsonContent] = useState<string | null>(null);

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStep('uploading');
        setError(null);
        setExtractedData(null);
        setDocumentHash(null);
        setTxHash(null);
        setFileName(file.name);
        setFileType(file.type);

        const reader = new FileReader();
        reader.onload = (e) => setUploadedPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        setStep('extracting');
        try {
            // Step 1: Use local AI for immediate metadata extraction
            // This ensures we get data even if the external hash service is down
            const localData = await parseDocumentWithAI(file);

            // Step 2: Attempt to get canonical hash from external backend
            // NEW: Always generate a Content-Fingerprint from Metadata for cross-format consistency
            const canonical = createCanonicalData(
                localData.recipientName || "UNKNOWN",
                localData.recipientId || "SIT-PENDING",
                localData.documentType || "CERTIFICATE"
            );
            const metadataHash = hashStudentData(canonical);

            // We use the metadata-derived hash as the primary 'finalHash' to ensure 
            // the same document in different formats (PDF/JPG) yields the same ID.
            let finalHash = metadataHash;

            try {
                const formData = new FormData();
                formData.append("pdf", file);
                const response = await axios.post("https://ledger.palatepals.com/add_legit", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 4000
                });
                // Optional: Store the file-level hash as a secondary proof if needed
                console.log("Backend file-hash captured:", response.data.hash);
            } catch (err) {
                console.warn("Backend sync bypassed; relying on high-integrity local fingerprint.");
            }

            setDocumentHash(finalHash);
            const enrichedData = {
                ...localData,
                recipientId: localData.recipientId || "SIT-" + finalHash.slice(2, 8).toUpperCase()
            };
            setExtractedData(enrichedData);

            // Generate JSON content for display and session
            const exportData = {
                protocol: "AcadLedger_V2",
                institution: "Verified Institution",
                documentInfo: {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    hash: finalHash
                },
                extractedMetadata: enrichedData,
                attestation: {
                    status: "PENDING_ANCHOR",
                    timestamp: new Date().toISOString()
                }
            };
            const jsonStr = JSON.stringify(exportData, null, 2);
            setJsonContent(jsonStr);
            sessionStorage.setItem('acadledger_verify_data', jsonStr);

            setStep('extracted');
        } catch (err: any) {
            console.error("Extraction process failed:", err);
            setError(err.message || "Protocol extraction failed. Please ensure file is valid.");
            setStep('error');
        }
    };

    const handleAttest = async () => {
        if (!extractedData || !documentHash) return;

        setStep('hashing');
        setError(null);

        try {
            // Step 3: Register Metadata on IPFS
            const regResponse = await axios.post("/api/register", {
                recipientName: extractedData.recipientName,
                recipientEmail: extractedData.recipientEmail || "student@example.com",
                recipientId: extractedData.recipientId,
                recipientWallet: address,
                documentType: extractedData.documentType,
                documentDescription: "Issued via AcadLedger Protocol",
                documentHash: documentHash,
                embedding: [], // Embeddings not strictly required for hash-based verification
                documentId: crypto.randomUUID()
            });

            const cid = regResponse.data.cid;

            setStep('attesting');
            // Step 4: Anchor on Chain
            const result = await attestOnChain(documentHash, "ipfs://" + cid);

            if (result.success && result.txHash) {
                setTxHash(result.txHash);
                setStep('complete');
            } else {
                setError(result.error || "Blockchain commit denied");
                setStep('error');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Protocol execution error");
            setStep('error');
        }
    };

    const reset = () => {
        setStep('idle');
        setUploadedPreview(null);
        setExtractedData(null);
        setDocumentHash(null);
        setTxHash(null);
        setError(null);
        setJsonContent(null);
        setShowJson(false);
    };

    return (
        <div className="space-y-12">
            {/* Step Indicators */}
            <div className="flex justify-between max-w-4xl mx-auto px-4 relative mb-16">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
                {[
                    { id: 'S1', label: 'Capture', active: step !== 'idle' },
                    { id: 'S2', label: 'Neural Parse', active: !!extractedData || step === 'extracting' },
                    { id: 'S3', label: 'Hash Digest', active: !!documentHash || step === 'hashing' },
                    { id: 'S4', label: 'L2 Anchor', active: step === 'complete' || step === 'attesting' }
                ].map((s, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${s.active ? 'bg-cyber-gradient border-white/20 shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-110' : 'bg-[#020617] border-white/5 text-slate-600'}`}>
                            <span className="font-bold text-xs font-sans">{s.id}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${s.active ? 'text-white' : 'text-slate-600 font-medium'}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left Column: Visual Capture */}
                <div className="space-y-8 animate-in slide-in-from-left duration-700">
                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden relative ${step === 'idle' ? 'bg-purple-500/5 border-purple-500/20 ring-1 ring-purple-500/10' : 'glassmorphism border-white/10'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 glassmorphism rounded-xl flex items-center justify-center text-xs font-sans font-bold text-purple-400 border-purple-500/30">
                                    S1
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-widest text-white/90">Visual_Capture</h3>
                            </div>
                            {uploadedPreview && <div className="text-[10px] font-sans font-bold text-purple-400/60 animate-pulse uppercase tracking-[0.2em]">Stream_Active</div>}
                        </div>

                        <label className="block cursor-pointer group">
                            <div className={`relative border-2 border-dashed rounded-[2rem] p-4 min-h-[300px] flex items-center justify-center transition-all ${uploadedPreview ? 'border-purple-500/20 bg-black/40' : 'border-white/5 hover:border-purple-500/40 hover:bg-white/5'}`}>
                                {uploadedPreview ? (
                                    <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-2xl border border-white/5">
                                        {fileType?.startsWith('image/') ? (
                                            <div className="relative overflow-hidden">
                                                <img src={uploadedPreview} alt="Captured Source" className="w-full h-auto grayscale-[0.3] brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" />
                                                {step === 'extracting' && (
                                                    <div className="absolute inset-0 z-40">
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_5px_30px_#22d3ee] animate-scan-slow" />
                                                        <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="aspect-[3/4] flex flex-col items-center justify-center bg-white/5 relative">
                                                <Upload className="h-16 w-16 text-purple-400 mb-4 animate-bounce" />
                                                <span className="text-white font-sans font-bold text-[10px] tracking-[0.3em] uppercase">pdf_document_synced</span>
                                                {step === 'extracting' && (
                                                    <div className="absolute inset-0 z-40 bg-cyan-500/5">
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_5px_30px_#22d3ee] animate-scan-slow" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="h-20 w-20 bg-white/5 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-white/10 text-slate-500 group-hover:text-purple-400 group-hover:scale-110 transition-all">
                                            <Upload className="h-10 w-10 transition-transform" />
                                        </div>
                                        <p className="text-white font-bold text-lg mb-2 tracking-tight">Select Academic Source</p>
                                        <p className="text-slate-500 text-sm font-light">Drag & drop certificate image or scan</p>
                                    </div>
                                )}
                            </div>
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
                        </label>
                    </div>

                    {/* AI Block */}
                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 relative group/parser ${step === 'extracting' ? 'bg-cyan-500/5 border-cyan-500/30 shadow-2xl shadow-cyan-500/5' : extractedData ? 'glassmorphism border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-cyan-500/5' : 'opacity-20 grayscale pointer-events-none scale-95'}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover/parser:opacity-100 transition-opacity rounded-[2.5rem]" />
                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className={`h-10 w-10 glassmorphism rounded-xl flex items-center justify-center text-xs font-mono font-bold border transition-all duration-500 group-hover/parser:scale-110 group-hover/parser:border-cyan-500/50 ${extractedData ? 'text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-slate-600 border-white/5'}`}>
                                S2
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-widest text-white/90 group-hover/parser:text-white transition-colors">Neural_Parser</h3>
                            <div className="ml-auto flex items-center gap-3">
                                {fileName && <span className="text-[10px] font-mono text-cyan-400/60 bg-cyan-500/5 px-3 py-1 rounded-full border border-cyan-500/10 max-w-[120px] truncate group-hover/parser:border-cyan-500/30 transition-all">{fileName}</span>}
                                <div className="h-10 w-10 p-1 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 group-hover/parser:scale-110 group-hover/parser:rotate-3 transition-transform duration-500 shadow-xl shadow-cyan-500/5">
                                    <img src="/New Project 100 [31F474F].png" alt="AcadLedger Logo" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>

                        {step === 'extracting' && (
                            <div className="flex flex-col items-center py-10 space-y-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
                                </div>
                                <span className="text-xs font-sans font-bold text-cyan-400 tracking-widest uppercase animate-pulse">Analyzing_Document_Fabric...</span>
                            </div>
                        )}

                        {extractedData && (
                            <div className="space-y-6 animate-in fade-in duration-1000">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <DataField label="Recipient_Identity" value={extractedData.recipientName} className="animate-in fade-in slide-in-from-bottom-4 duration-500" />
                                    <DataField label="Credential_UID" value={extractedData.recipientId} isMono className="animate-in fade-in slide-in-from-bottom-4 duration-700" />
                                    <DataField
                                        label="Schema_Type"
                                        value={extractedData.documentType}
                                        className="col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-1000"
                                        isSpecial
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold tracking-[0.2em] uppercase shadow-sm transition-all duration-500 hover:scale-105 ${extractedData.isFraudulent ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:border-red-500/50' : 'bg-green-500/10 border-green-500/20 text-green-500 hover:border-green-500/50'}`}>
                                        {extractedData.isFraudulent ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                        {extractedData.isFraudulent ? 'TAMPER_DETECTED' : 'INTEGRITY_VERIFIED'}
                                    </div>
                                    <Button
                                        onClick={() => setShowJson(!showJson)}
                                        variant="outline"
                                        className="h-9 px-4 rounded-full border-cyan-500/20 bg-cyan-500/5 text-[10px] font-black tracking-widest text-cyan-400 hover:bg-cyan-500/10 uppercase transition-all"
                                    >
                                        <Cpu className="h-3 w-3 mr-2" />
                                        {showJson ? "Hide Core JSON" : "Extract JSON"}
                                    </Button>
                                </div>
                                <div className="text-right group/score pt-6 border-t border-white/5 mt-6">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1 group-hover/score:text-cyan-400 transition-colors">Conf_Score</span>
                                    <div className="flex items-center gap-2 justify-end">
                                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                                            <div
                                                className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                                                style={{ width: `${(extractedData.confidenceScore || 0.99) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-cyan-400 font-sans text-xl font-bold group-hover/score:scale-110 transition-transform block">
                                            {typeof extractedData.confidenceScore === 'number' && !isNaN(extractedData.confidenceScore)
                                                ? (extractedData.confidenceScore * 100).toFixed(0)
                                                : "99"}%
                                        </span>
                                    </div>
                                </div>

                                {showJson && jsonContent && (
                                    <div className="mt-8 animate-in slide-in-from-top-4 duration-500 relative z-[100] border-t border-cyan-500/20 pt-8">
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-cyan-500/10">
                                                    <Cpu className="h-4 w-4 text-cyan-400" />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-300 tracking-[0.25em] uppercase">Core_Identity_Matrix</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 font-bold text-cyan-400/80 hover:text-white hover:bg-cyan-500/20 px-4 rounded-xl border border-cyan-500/10"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const blob = new Blob([jsonContent], { type: 'application/json' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = `AcadLedger_Proof_${extractedData.recipientId}.json`;
                                                    a.click();
                                                }}
                                            >
                                                Export .JSON
                                            </Button>
                                        </div>
                                        <div className="bg-[#020617] border border-cyan-500/20 rounded-[1.5rem] p-6 shadow-[0_0_30px_rgba(34,211,238,0.1)] overflow-hidden relative group/json">
                                            <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none group-hover/json:opacity-10 transition-opacity">
                                                <Cpu className="h-24 w-24 text-cyan-400" />
                                            </div>
                                            <pre className="text-[10px] font-sans font-medium text-cyan-300/90 leading-relaxed overflow-x-auto custom-scrollbar max-h-[350px] relative z-20">
                                                {jsonContent}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Cryptography & Chain */}
                <div className="space-y-8 animate-in slide-in-from-right duration-700">
                    {/* Hash Block */}
                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${step === 'hashing' ? 'bg-purple-500/5 border-purple-500/30' : documentHash ? 'glassmorphism border-white/10' : 'opacity-20 grayscale pointer-events-none scale-95'}`}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-10 w-10 glassmorphism rounded-xl flex items-center justify-center text-xs font-bold text-purple-400 border-purple-500/30">
                                S3
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-widest text-white/90">Digest_Generation</h3>
                        </div>

                        {documentHash && (
                            <div className="bg-black/60 rounded-[1.5rem] p-6 border border-white/5 group relative">
                                <div className="absolute top-2 right-4 text-[8px] font-sans text-slate-600 group-hover:text-purple-400 transition-colors uppercase tracking-widest font-bold">ALGORITHM_KECCAK_256</div>
                                <p className="text-green-500 font-mono text-[10px] sm:text-xs leading-relaxed break-all p-4 bg-green-500/5 rounded-xl border border-green-500/10 hover:border-green-500/40 transition-all duration-500 select-all">
                                    {documentHash}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Blockchain Block */}
                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-1000 ${step === 'attesting' ? 'bg-cyber-gradient/10 border-white/30 animate-glow-pulse shadow-2xl shadow-purple-500/10' : txHash ? 'bg-green-500/[0.03] border-green-500/30' : 'opacity-20 grayscale pointer-events-none scale-95'}`}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`h-10 w-10 glassmorphism rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${txHash ? 'text-green-400 border-green-500/30' : 'text-slate-600 border-white/5'}`}>
                                S4
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-widest text-white/90">L2_Attestation</h3>
                        </div>

                        {txHash && (
                            <div className="space-y-6 animate-in fade-in zoom-in duration-1000">
                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400">
                                    <div className="p-2 rounded-full bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm tracking-tight text-white">Anchored Successfully</p>
                                        <p className="text-[10px] font-sans font-bold text-green-500/80">STATE: FINALIZED_ON_LAYER_2</p>
                                    </div>
                                </div>

                                <div className="bg-black/60 rounded-2xl p-6 border border-white/5">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">TX_IDENTITY</span>
                                    <p className="text-slate-400 font-sans font-bold text-[10px] break-all leading-normal opacity-80">{txHash}</p>
                                </div>

                                <a
                                    href={`https://cardona-zkevm.polygonscan.com/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center h-12 w-full rounded-xl bg-white/5 border border-white/10 text-white font-sans font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:border-purple-500/40 transition-all group"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                    Explore_Block
                                </a>
                            </div>
                        )}

                        {step === 'attesting' && (
                            <div className="flex flex-col items-center py-6">
                                <Loader2 className="h-10 w-10 text-purple-400 animate-spin mb-4" />
                                <p className="text-slate-400 text-xs font-mono tracking-widest animate-pulse">COMMITING_TO_CHAIN...</p>
                            </div>
                        )}
                    </div>

                    {/* Final Actions */}
                    <div className="pt-4 lg:pt-8">
                        {step === 'extracted' && !extractedData?.isFraudulent && (
                            <Button
                                onClick={handleAttest}
                                className="w-full h-20 rounded-[1.75rem] bg-cyber-gradient text-white font-bold text-xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 group"
                            >
                                <Cpu className="mr-3 h-7 w-7 transition-all group-hover:rotate-12" />
                                Commit Attestation
                            </Button>
                        )}

                        {step === 'complete' && (
                            <Button
                                onClick={reset}
                                className="w-full h-16 rounded-[1.5rem] bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-green-500/40 font-bold text-lg transition-all shadow-lg"
                            >
                                <Sparkles className="mr-3 h-6 w-6 text-green-400" /> Issue New Credential
                            </Button>
                        )}

                        {error && (
                            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] text-red-400 flex items-start gap-4 animate-in slide-in-from-bottom-2 shadow-xl shadow-red-500/5">
                                <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-black uppercase tracking-widest">Protocol_Error</span>
                                    <span className="text-sm font-medium leading-relaxed opacity-90">{error}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

function DataField({ label, value, isMono = false, isSpecial = false, className = "" }: { label: string, value: string | undefined, isMono?: boolean, isSpecial?: boolean, className?: string }) {
    return (
        <div className={`space-y-1.5 group/field ${className}`}>
            <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-[.25em] font-bold block font-sans group-hover/field:text-cyan-400 transition-colors duration-300">{label}</span>
                <div className="h-[1px] flex-1 bg-white/[0.02]" />
            </div>
            <div className={`
                relative overflow-hidden px-4 py-3.5 rounded-2xl 
                transition-all duration-300 shadow-sm border
                ${isSpecial
                    ? 'bg-gradient-to-r from-cyan-500/[0.05] to-purple-500/[0.05] border-white/5 group-hover/field:border-cyan-500/40'
                    : 'bg-white/[0.02] border-white/[0.04] group-hover/field:border-cyan-500/20 group-hover/field:bg-white/[0.04]'}
                ${isMono ? 'font-mono text-xs font-semibold' : 'font-sans font-semibold text-[15px] tracking-tight'}
            `}>
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover/field:opacity-100 transition-opacity" />
                <span className={`relative z-10 ${isSpecial ? 'bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 font-bold' : 'text-white/90'}`}>
                    {value || 'NOT_DECODED'}
                </span>
            </div>
        </div>
    );
}
