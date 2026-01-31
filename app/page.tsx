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

      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-2xl transition-all duration-300">
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 p-1 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-cyan-500/5">
              <img src="/New Project 100 [31F474F].png" alt="AcadLedger Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              AcadLedger
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 mr-8">
            <Link href="/explorer" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors">Explorer</Link>
            <Link href="/verifier" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors">Verify</Link>
            <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-colors">Dashboard</Link>
          </nav>

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
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1] text-white">
              Global Integrity <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">of Credentials.</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-normal mb-12 max-w-lg">
              Empowering institutions with a tamper-proof protocol for issuing and verifying academic documents.
              Modern technology meets institutional trust.
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
                  <Sparkles className="h-12 w-12 text-cyan-400 mb-6 animate-pulse" />
                  <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest font-sans">Evolution of Trust</h3>
                  <div className="space-y-6 w-full px-6 text-left">
                    {[
                      { icon: <Shield className="h-4 w-4" />, text: "Phase 1: Zero-Knowledge Minting" },
                      { icon: <Cpu className="h-4 w-4" />, text: "Phase 2: Neural Integrity Check" },
                      { icon: <Layers className="h-4 w-4" />, text: "Phase 3: Polygon L2 Settlement" }
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + (i * 0.1) }}
                        className="flex items-center gap-4 text-slate-300 text-xs font-medium"
                      >
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                          {step.icon}
                        </div>
                        {step.text}
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-10 px-6 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-sans font-bold tracking-[0.2em] uppercase">
                    Platform Standard: Active
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
              <h2 className="text-2xl font-bold mb-4 text-white tracking-tight">Institutional Portal</h2>
              <p className="text-sm text-slate-400 mb-10 leading-relaxed font-normal px-4">
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
              <h2 className="text-2xl font-bold mb-4 text-white tracking-tight">Public Verification</h2>
              <p className="text-sm text-slate-400 mb-10 leading-relaxed font-normal px-4">
                Utilize neural visual audit to detect document alterations and instantly verify authenticity on the ledger.
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
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Absolute Integrity.</h2>
            <div className="h-1.5 w-20 bg-cyber-gradient mx-auto rounded-full" />
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
                  <div className="text-left font-sans">
                    <p className="text-white font-bold tracking-tight uppercase">Wallet Disconnected</p>
                    <p className="text-red-400/80 text-sm font-medium">Connect your wallet to interact with the protocol.</p>
                  </div>
                </div>
                <Button onClick={() => open()} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl px-8 h-12 font-bold transition-all shadow-lg shadow-red-500/20">
                  Connect Now
                </Button>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-20">
              <div>
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight uppercase font-sans">Protocol Instruction</h2>
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
                  <p className="text-slate-400 leading-relaxed font-normal mb-6">
                    AcadLedger bridges the gap between traditional paper credentials and the decentralized future. No more fake degrees, no more slow verification processes.
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
            <p className="text-[10px] text-slate-700 font-sans font-medium">
              The Universal Standard for Academic Credentialing.
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
      <div className="h-24 w-24 rounded-[2rem] glassmorphism bg-white/5 flex items-center justify-center text-4xl font-bold text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/50 transition-all duration-700 shrink-0 border-white/10 z-10 shadow-2xl">
        {num}
      </div>
      <div className="pt-4">
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-cyan-400 transition-colors uppercase font-sans">{title}</h3>
        <p className="text-slate-400 max-w-xl text-lg leading-relaxed font-normal">{desc}</p>
      </div>
    </div>
  );
}

function CertificateTeaser() {
  return (
    <div className="relative glassmorphism p-12 rounded-[3.5rem] border-white/30 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] scale-[0.9] lg:scale-100 transition-all hover:scale-[1.02] duration-1000 overflow-hidden flex flex-col items-center justify-center min-h-[480px]">
      <div className="absolute top-10 right-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Verified
        </motion.div>
      </div>

      <div className="relative group w-full flex flex-col items-center">
        <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full animate-pulse transition-all group-hover:bg-cyan-500/20" />
        <div className="relative h-48 w-48 bg-[#020617] rounded-full flex items-center justify-center p-0.5 shadow-2xl overflow-hidden border border-white/10 transition-transform duration-1000 group-hover:scale-105 group-hover:rotate-1">
          <img src="/New Project 100 [31F474F].png" alt="AcadLedger Logo" className="w-full h-full object-cover" />
        </div>

        <div className="mt-10 text-center">
          <h3 className="text-3xl font-bold text-white tracking-widest uppercase font-sans mb-3">AcadLedger</h3>
          <div className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-sans text-cyan-400/60 uppercase tracking-[0.4em] font-bold">Global Trust Engine</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 right-10 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-green-400/80">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-sans">Ledger Authenticated</span>
        </div>
        <div className="h-10 w-10 glassmorphism rounded-xl flex items-center justify-center border-purple-500/10">
          <Cpu className="h-5 w-5 text-purple-400/60" />
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
      className="flex justify-between items-center group/row py-1.5 border-b border-white/[0.02]"
    >
      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em] group-hover/row:text-slate-400 transition-colors font-sans">{label}</span>
      <span className={`text-sm font-bold text-white group-hover/row:text-cyan-400 transition-colors uppercase tracking-tight font-sans`}>
        {value}
      </span>
    </motion.div>
  );
}

function GuideItem({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 font-bold shrink-0 group-hover:bg-cyan-400 group-hover:text-black transition-all">
        {num}
      </div>
      <div>
        <h4 className="text-white font-bold mb-1 uppercase tracking-tight">{title}</h4>
        <p className="text-slate-500 text-sm font-light leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
