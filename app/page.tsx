"use client"
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, UserCircle2, Building2, FileSearch, CheckCircle, Zap, ShieldCheck, Search, Award, Layers, Cpu, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from 'wagmi'
import { motion } from "framer-motion";

export default function Home() {
  const { open } = useWeb3Modal();
  const { address } = useAccount();
  const [isFlipped, setIsFlipped] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-50 selection:bg-purple-500/30 font-sans">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-600/5 blur-[160px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 p-1.5 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-white/5">
              <img src="/sethu-logo.png" alt="SIT Logo" className="w-full h-auto object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              AcadLedger
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => open()}
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all rounded-full px-6 font-medium"
            >
              {address ? (
                <div className="flex gap-2 items-center">
                  <UserCircle2 className="h-5 w-5 mr-1 text-purple-400" />
                  <span className="font-mono text-sm">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </div>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 container py-20 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl w-full mb-32"
        >
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-8 uppercase tracking-wider"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Verified Academy Ledger
            </motion.div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white">
              Secure <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 italic">Credentials</span>
              <br /> for SIT.
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed font-light mb-12 max-w-lg">
              Empower Sethu Institute of Technology with a tamper-proof system for issuing and verifying official documents.
              Modern tech meets institutional trust.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link href="/issuer">
                <Button className="h-16 px-10 rounded-2xl bg-cyber-gradient text-white font-bold text-lg shadow-2xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all">
                  Get Started
                </Button>
              </Link>
              <Link href="/verifier">
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold text-lg backdrop-blur-md">
                  Verify Document
                </Button>
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5, x: 50 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, x: 0 }}
            transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
            className="relative group lg:ml-auto perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />
            <motion.div
              className="relative w-full h-full preserve-3d cursor-pointer"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Front Side */}
              <div className="backface-hidden">
                <CertificateTeaser />
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 h-full w-full">
                <div className="glassmorphism p-10 rounded-[3.5rem] border-white/30 h-full flex flex-col justify-center items-center text-center shadow-2xl">
                  <Award className="h-16 w-16 text-cyan-400 mb-6" />
                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">Protocol_Security</h3>
                  <div className="space-y-4 text-slate-400 text-sm font-light">
                    <p>Verified via Polygon Cardona zkEVM</p>
                    <p>Encryption: Keccak-256</p>
                    <p>Identity Provider: SIT_Authority</p>
                  </div>
                  <div className="mt-8 px-6 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-[10px] font-mono tracking-widest uppercase">
                    Status: Immutable_Proof_Confirmed
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          {...fadeIn}
          className="grid lg:grid-cols-2 gap-10 max-w-6xl w-full items-stretch"
        >
          {/* Institution Card */}
          <Link href="/issuer" className="group h-full">
            <div className="glassmorphism p-10 rounded-[3.5rem] hover:border-purple-500/50 hover:bg-white/10 transition-all duration-700 h-full flex flex-col items-center text-center group-hover:-translate-y-3 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-600/20 transition-all" />

              <div className="h-24 w-24 bg-purple-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-white/5 shadow-inner">
                <Building2 className="h-12 w-12 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-white tracking-tight">Institutional Portal</h2>
              <p className="text-slate-400 mb-10 leading-relaxed font-light px-4">
                Execute document attestation, manage alumni records, and anchor cryptographic proofs to the secure L2 ledger.
              </p>
              <Button className="mt-auto w-full h-16 rounded-[2rem] bg-cyber-gradient hover:opacity-90 font-bold text-lg shadow-xl shadow-purple-500/20 transition-all">
                Access Dashboard
              </Button>
            </div>
          </Link>

          {/* Verifier Card */}
          <Link href="/verifier" className="group h-full">
            <div className="glassmorphism p-10 rounded-[3.5rem] hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-700 h-full flex flex-col items-center text-center group-hover:-translate-y-3 relative overflow-hidden border-dashed shadow-2xl">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-600/10 blur-3xl -ml-16 -mb-16 group-hover:bg-cyan-600/20 transition-all" />

              <div className="h-24 w-24 bg-cyan-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 border border-white/5 shadow-inner">
                <FileSearch className="h-12 w-12 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-white tracking-tight">Public Verification</h2>
              <p className="text-slate-400 mb-10 leading-relaxed font-light px-4">
                Utilize neural visual audit to detect document tampering and instantly verify authenticity on the blockchain.
              </p>
              <Button variant="outline" className="mt-auto w-full h-16 rounded-[2rem] border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 font-bold text-lg transition-all backdrop-blur-sm">
                Enter Scanner
              </Button>
            </div>
          </Link>
        </motion.div>

        {/* Features Section */}
        <div className="mt-52 w-full max-w-6xl">
          <motion.div
            {...fadeIn}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Absolute Integrity.</h2>
            <div className="h-1.5 w-24 bg-cyber-gradient mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: <ShieldCheck className="h-8 w-8" />, color: 'purple', title: "Tamper-Proof Protocol", desc: "Documents are secured with Keccak-256 hashing, making forgery mathematically impossible." },
              { icon: <Zap className="h-8 w-8" />, color: 'cyan', title: "Neural Visual Audit", desc: "AI analyzes pixel patterns to detect font inconsistencies or layer manipulations in real-time." },
              { icon: <Layers className="h-8 w-8" />, color: 'blue', title: "Polygon L2 Settlement", desc: "Inherits Ethereum's security while providing instant, low-cost attestation at scale." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.desc}
                  color={feature.color as any}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* User Guide Section */}
        <motion.div
          {...fadeIn}
          className="mt-52 w-full max-w-6xl overflow-hidden"
        >
          <div className="glassmorphism p-12 rounded-[4rem] border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyber-gradient" />

            {!address && (
              <div className="mb-12 p-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <div className="text-left">
                    <p className="text-white font-bold tracking-tight uppercase">Wallet_Disconnected</p>
                    <p className="text-red-400/80 text-sm font-light">Check your connectivity of wallet to interact with the protocol.</p>
                  </div>
                </div>
                <Button onClick={() => open()} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl px-8 h-12 font-bold transition-all shadow-lg shadow-red-500/20">
                  Connect Now
                </Button>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-20">
              <div>
                <h2 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase italic">Platform_Instruction</h2>
                <div className="space-y-10 text-left">
                  <GuideItem
                    num="A"
                    title="Establish Authority"
                    desc="Connect your Web3 identity via the status bar. This allows you to sign documents or verify their on-chain anchors."
                  />
                  <GuideItem
                    num="B"
                    title="Upload & Parse"
                    desc="Our Neural Engine V2 scans the document layout. It detects inconsistencies that are invisible to the human eye."
                  />
                  <GuideItem
                    num="C"
                    title="Anchor & Trust"
                    desc="Once validated, the document's SHA-256 digest is committed to Polygon L2 for eternal immutability."
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="glassmorphism p-8 rounded-[3rem] border-white/5 bg-cyber-gradient/5">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    Why AcadLedger?
                  </h4>
                  <p className="text-slate-400 leading-relaxed font-light mb-6">
                    Designed specifically for SIT, AcadLedger bridges the gap between traditional paper credentials and the decentralized future. No more fake degrees, no more slow verification processes.
                  </p>
                  <ul className="space-y-3">
                    {['Zero Gas Fees for Students', 'Instant Verification API', 'GDPR Compliant Hashing'].map((text, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/70">
                        <CheckCircle className="h-4 w-4 text-green-400" /> {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <footer className="mt-40 py-20 border-t border-white/5 w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-6 text-slate-500 text-sm font-bold tracking-tight uppercase font-mono">
            <span className="flex items-center gap-2 group cursor-default">
              <div className="h-2 w-2 rounded-full bg-green-500 group-hover:animate-ping" /> Polygon L2
            </span>
            <span className="flex items-center gap-2 group cursor-default">
              <div className="h-2 w-2 rounded-full bg-purple-500" /> Web3Auth
            </span>
            <span className="flex items-center gap-2 group cursor-default">
              <div className="h-2 w-2 rounded-full bg-cyan-500" /> Neural_V2
            </span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-xs text-slate-600 font-bold uppercase tracking-[0.2em]">
              © 2024 AcadLedger Protocol
            </p>
            <p className="text-[10px] text-slate-700 font-mono italic">
              Empowering SIT and the Next Generation of Scholars.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: 'purple' | 'cyan' | 'blue' }) {
  const colors = {
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/5",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5"
  };

  return (
    <div className="glassmorphism p-10 rounded-[3rem] hover:bg-white/10 transition-all duration-700 relative overflow-hidden group border-white/10 shadow-2xl">
      <div className={`h-20 w-20 ${colors[color]} rounded-[2rem] flex items-center justify-center mb-8 border group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-xl`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-base leading-relaxed font-light">{description}</p>
    </div>
  );
}

function WorkflowStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-10 items-start relative group">
      <div className="h-24 w-24 rounded-[2rem] glassmorphism bg-white/5 flex items-center justify-center text-4xl font-black italic text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 transition-all duration-700 shrink-0 border-white/10 z-10 shadow-2xl">
        {num}
      </div>
      <div className="pt-4">
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-cyan-400 transition-colors uppercase italic">{title}</h3>
        <p className="text-slate-400 max-w-xl text-lg leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  );
}

function CertificateTeaser() {
  return (
    <div className="relative glassmorphism p-10 rounded-[3.5rem] border-white/30 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] scale-[0.9] lg:scale-100 transition-all hover:scale-[1.02] duration-1000 overflow-hidden">
      <div className="absolute top-10 right-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-400"
        >
          <CheckCircle className="h-4 w-4" />
          Verified
        </motion.div>
      </div>

      <div className="flex items-center gap-6 mb-12 pb-10 border-b border-white/5">
        <div className="h-32 w-32 bg-white rounded-[2.5rem] flex items-center justify-center p-4 shadow-2xl overflow-hidden border border-white/20 transition-transform duration-700 hover:rotate-6">
          <img src="/sethu-logo.png" alt="SIT Logo" className="w-full h-auto object-contain" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">SIT_SYSTEMS</h3>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Institutional Node 0x92A
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {[
          { label: "Recipient", val: "Jane Smith" },
          { label: "Document Category", val: "B.Tech Information Technology" },
          { label: "Issue Date", val: "June 15, 2024" },
          { label: "Registry ID", val: "SIT-EN-8829-X" }
        ].map((item, idx) => (
          <TeaserRow key={idx} label={item.label} value={item.val} delay={0.6 + (idx * 0.1)} />
        ))}
      </div>

      <div className="mt-14 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-green-400">
          <ShieldCheck className="h-5 w-5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] font-mono">Ledger_Authenticated</span>
        </div>
        <div className="h-12 w-12 glassmorphism rounded-2xl flex items-center justify-center border-purple-500/20 group hover:border-purple-500/50 transition-colors">
          <Cpu className="h-6 w-6 text-purple-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function TeaserRow({ label, value, delay }: { label: string, value: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex justify-between items-center group/row py-1 border-b border-white/[0.02]"
    >
      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest group-hover/row:text-slate-400 transition-colors">{label}</span>
      <span className={`text-base font-bold text-white group-hover/row:text-cyan-400 transition-colors uppercase tracking-tight ${label === 'Recipient' ? 'font-serif italic' : ''}`}>
        {value}
      </span>
    </motion.div>
  );
}

function GuideItem({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 font-black italic shrink-0 group-hover:bg-cyan-400 group-hover:text-black transition-all">
        {num}
      </div>
      <div>
        <h4 className="text-white font-bold mb-1 uppercase tracking-tight">{title}</h4>
        <p className="text-slate-500 text-sm font-light leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
