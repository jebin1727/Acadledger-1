"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, Building2, Search, UserCircle2 } from "lucide-react";
import Image from "next/image";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from 'wagmi'

export default function Home() {
  const { open } = useWeb3Modal();

  const { address,  } = useAccount();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CertifyChain</span>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => open()} variant="outline">
              {address ? <div className="flex gap-2 items-center">
                <UserCircle2 className="h-8 w-8 mr-2" />
                {address.slice(0, 6)}...{address.slice(-4)}
              </div> : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Secure Document Issuance and Verification
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Empower your institution with a tamper-proof system for
                  issuing and verifying official documents. Reduce fraud and
                  build trust with blockchain-backed verification.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href="/dashboard">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/verify">
                    <Button size="lg" variant="outline">
                      Verify a Document
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative lg:pl-10">
                <div className="relative bg-white shadow-lg rounded-lg p-6 border">
                  <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    Verified
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 p-2 rounded-full bg-muted flex items-center justify-center">
                      <Image
                        className="h-full w-full text-muted-foreground"
                        src={"/Sethu_Institute_of_Technology_Logo.png"}
                        width={100}
                        height={100}
                        alt="Sethu LOGO"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">
                        Sethu Institute of Technology
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Official Degree Certificate
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Recipient:</span>
                      <span className="font-medium">Jane Smith</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Document Type:
                      </span>
                      <span className="font-medium">Bachelor of Science</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Issue Date:</span>
                      <span className="font-medium">June 15, 2023</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Document ID:
                      </span>
                      <span className="font-medium">BSC-2023-78912</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileCheck className="h-4 w-4" />
                    <span>Verified on July 10, 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">
                Platform Features
              </h2>
              <p className="text-muted-foreground mt-4 max-w-[700px] mx-auto">
                Our comprehensive solution provides everything institutions need
                to issue and manage secure, verifiable documents.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Tamper-Proof Security
                </h3>
                <p className="text-muted-foreground">
                  Documents are secured with blockchain technology, making them
                  impossible to forge or alter.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Verification</h3>
                <p className="text-muted-foreground">
                  Third parties can verify document authenticity in seconds
                  using our simple verification portal.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg border shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Customizable Templates
                </h3>
                <p className="text-muted-foreground">
                  Create and manage document templates that match your
                  institution's branding and requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">
                How It Works
              </h2>
              <p className="text-muted-foreground mt-4 max-w-[700px] mx-auto">
                Our platform simplifies the process of issuing and verifying
                official documents.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="absolute top-0 left-6 h-full w-px bg-border md:block hidden"></div>
                <div className="absolute top-6 left-6 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:block hidden">
                  1
                </div>
                <div className="pl-0 md:pl-16">
                  <h3 className="text-xl font-bold mb-2">
                    Institution Registration
                  </h3>
                  <p className="text-muted-foreground">
                    Institutions register and set up their profile with official
                    details and authorized signatories.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-0 left-6 h-full w-px bg-border md:block hidden"></div>
                <div className="absolute top-6 left-6 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:block hidden">
                  2
                </div>
                <div className="pl-0 md:pl-16">
                  <h3 className="text-xl font-bold mb-2">Document Issuance</h3>
                  <p className="text-muted-foreground">
                    Create and issue official documents with unique identifiers
                    and digital signatures.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-6 left-6 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:block hidden">
                  3
                </div>
                <div className="pl-0 md:pl-16">
                  <h3 className="text-xl font-bold mb-2">
                    Verification Process
                  </h3>
                  <p className="text-muted-foreground">
                    Recipients and third parties can verify document
                    authenticity using the document ID or QR code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-10">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">CertifyChain</span>
          </div>
          <div className="text-center md:text-left text-sm text-muted-foreground">
            © 2023 CertifyChain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
