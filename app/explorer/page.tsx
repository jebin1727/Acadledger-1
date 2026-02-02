"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { abi } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Search,
    ExternalLink,
    Clock,
    ShieldCheck,
    AlertTriangle,
    Hash,
    User,
    ArrowLeft,
    WifiOff
} from "lucide-react";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS || "0xA09916427843c35a233BF355bFAF1C735F9e75fa";

interface BlockchainDocument {
    docHash: string;
    issuer: string;
    issuedAt: bigint;
    revoked: boolean;
    ipfsURI: string;
}

export default function ExplorerPage() {
    const [documents, setDocuments] = useState<BlockchainDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [network, setNetwork] = useState<"PUBLIC" | "LOCAL">("PUBLIC");
    const [error, setError] = useState<string | null>(null);

    const RPC_URL = network === "PUBLIC"
        ? "https://rpc-amoy.polygon.technology/"
        : "http://localhost:8549";

    useEffect(() => {
        const fetchAllDocs = async () => {
            try {
                setLoading(true);
                setError(null);
                const provider = new ethers.JsonRpcProvider(RPC_URL);

                // Timeout check to handle 'Failed to fetch' gracefully
                await Promise.race([
                    provider.getNetwork(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("NETWORK_UNREACHABLE")), 4000))
                ]);

                const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
                const docs = await contract.listDocuments();

                const sortedDocs = [...docs].sort((a, b) => Number(b.issuedAt) - Number(a.issuedAt));
                setDocuments(sortedDocs);
            } catch (err: any) {
                console.error("Ledger Sync Error:", err);
                setError(network === "LOCAL"
                    ? "Local Node Unreachable. Ensure Docker eth-node1 is running at port 8549."
                    : "Public Amoy RPC Connection Failed. Check your internet or try again later.");
                setDocuments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllDocs();
    }, [network, RPC_URL]);

    const filteredDocs = documents.filter(doc =>
        doc.docHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.issuer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-cyan-500/30">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
            </div>

            <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-2xl transition-all duration-300">
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="h-10 w-10 p-1 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-cyan-500/10">
                                <img src="/New Project 100 [31F474F].png" alt="AcadLedger" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">AcadLedger <span className="text-cyan-400 text-xs font-mono ml-2 uppercase tracking-widest opacity-60">Explorer</span></span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                            <button
                                onClick={() => setNetwork("PUBLIC")}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${network === "PUBLIC" ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Public Amoy
                            </button>

                            <button
                                onClick={() => setNetwork("LOCAL")}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${network === "LOCAL" ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Local Node
                            </button>
                        </div>
                        <Link href="/">
                            <Button variant="ghost" className="rounded-full text-slate-400 hover:text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest h-10 px-6">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container py-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Global Ledger History</h1>
                        <p className="text-slate-400 font-light text-lg italic">Real-time audit of all academic anchors committed to the protocol.</p>
                    </div>

                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter by Hash or Issuer..."
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-500/40 transition-all font-sans"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-6 rounded-3xl bg-red-500/5 border border-red-500/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                        <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <WifiOff className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Connection Error</p>
                            <p className="text-sm text-slate-400 font-sans">{error}</p>
                        </div>
                    </div>
                )}

                <div className="glassmorphism rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
                    <Table>
                        <TableHeader className="bg-white/[0.02]">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="py-6 font-bold uppercase tracking-widest text-[10px] text-slate-500 pl-8">Document Fingerprint</TableHead>
                                <TableHead className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Issuer Identity</TableHead>
                                <TableHead className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Timestamp</TableHead>
                                <TableHead className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Status</TableHead>
                                <TableHead className="font-bold uppercase tracking-widest text-[10px] text-slate-500 text-right pr-8">Audit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-white/5 animate-pulse">
                                        <TableCell colSpan={5} className="py-8 text-center text-slate-600 font-mono text-xs uppercase tracking-widest border-none">Hydrating Ledger Stream...</TableCell>
                                    </TableRow>
                                ))
                            ) : filteredDocs.length === 0 ? (
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableCell colSpan={5} className="py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-4">
                                            <Hash className="h-12 w-12 opacity-20" />
                                            <p className="font-bold uppercase tracking-widest text-xs">{error ? "Data Fetch Blocked" : "No records found matching query"}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDocs.map((doc, idx) => (
                                    <TableRow key={idx} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <TableCell className="py-6 pl-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                                    <Hash className="h-4 w-4 text-cyan-400" />
                                                </div>
                                                <code className="text-xs font-mono text-slate-300 bg-white/5 px-2 py-1 rounded-md">{doc.docHash.slice(0, 10)}...{doc.docHash.slice(-8)}</code>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-3.5 w-3.5 text-purple-400" />
                                                <span className="text-xs font-mono text-slate-400">{doc.issuer.slice(0, 6)}...{doc.issuer.slice(-4)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                <Clock className="h-3.5 w-3.5" />
                                                {new Date(Number(doc.issuedAt) * 1000).toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {doc.revoked ? (
                                                <div className="flex items-center gap-2 text-red-500 bg-red-500/5 px-3 py-1 rounded-full border border-red-500/20 w-fit">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Revoked</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-500 bg-green-500/5 px-3 py-1 rounded-full border border-green-500/20 w-fit">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Valid</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <a
                                                href={network === "PUBLIC" ? `https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}` : "#"}
                                                target="_blank"
                                                className="inline-flex items-center px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all focus:outline-none"
                                            >
                                                Details <ExternalLink className="ml-2 h-3 w-3" />
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>

            <footer className="mt-20 py-12 border-t border-white/5 bg-black/40">
                <div className="container flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${error ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
                            {network === "PUBLIC" ? "Public Amoy Sync" : "Local Node Sync"} {error ? "Offline" : "Active"}
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div>Block #842,402</div>
                    </div>
                    <div>© 2024 AcadLedger Explorer • Open Source Verification</div>
                </div>
            </footer>
        </div>
    );
}
