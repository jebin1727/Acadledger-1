"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  FileText,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  Download,
  Eye,
  MoreHorizontal,
  FileCheck,
  UserCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useWalletClient } from "wagmi";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { ethers } from "ethers";
import { abi } from "@/lib/contract";

type InstitutionData = [
  [institutionAddress: string, metadata: string],
  [
    docHash: string,
    issuer: string,
    issuedAt: bigint,
    revoked: boolean,
    ipfsURI: string
  ][]
];

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { isConnected, address } = useAccount();

  const { data: client } = useWalletClient();

  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [institutionDetails, setInstitutionDetails] = useState<{
    name: string;
    documents: {
      recipient: {
        fullName: string;
        email: string;
        id: string;
        walletAddress: string;
      };
      document: {
        type: string;
        id: string;
        hash: string;
        description: string;
      };
      issuedAt: bigint;
      status: boolean;
    }[];
  } | null>(null);

  useEffect(() => {
    const loadInstitution = async () => {
      try {
        if (!client?.transport || !address) return;

        const provider = new ethers.BrowserProvider(client.transport);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS!,
          abi,
          signer
        );

        const result: [
          [institutionAddress: string, metadata: string],
          [
            docHash: string,
            issuer: string,
            issuedAt: bigint,
            revoked: boolean,
            ipfsURI: string
          ][]
        ] = await contract.getInstitutionWithDocuments(
          address
        );

        const metadataResponse = await axios.get("/api/register", {
          params: {
            cid: result[0][1].replace("ipfs://", ""), // institution metadata CID
          },
        });

        console.log(metadataResponse);

        const documentsMetadata: {
          recipient: {
            fullName: string;
            email: string;
            id: string;
            walletAddress: string;
          };
          document: {
            type: string;
            id: string;
            hash: string;
            description: string;
          };
          issuedAt: bigint;
          status: boolean;
        }[] = await Promise.all(
          result[1].slice(2).map(async (doc) => {
            const docResponse = await axios.get("/api/register", {
              params: {
                cid: doc[4], // document IPFS URI
              },
            });
            return {
              ...docResponse.data["data"],
              issuedAt: doc[2],
              status: doc[3],
            };
          })
        );

        setInstitution(result);
        setInstitutionDetails({
          name: metadataResponse.data["data"]["name"],
          documents: documentsMetadata,
        });
      } catch (error) {
        console.log(error);
      }
    };

    loadInstitution();
  }, [client]);

  const [newDocumentOpened, setNewDocumentOpened] = useState(false);

  const { data: walletClient } = useWalletClient();

  const onRevoke = async (hash: string) => {
    try {
      if (!walletClient) {
        return;
      }

      // console.log(data);
      // setLoading(true);

      // console.log(await connector?.getProvider())

      // Convert to EIP-1193 provider
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      console.log(signer);
      // const feeData = await provider.get();

      // console.log(feeData)

      // // Connect to contract
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS!,
        abi, // Your contract ABI
        signer
      );

      // const estimatedGas = await contract.getAddress;

      // console.log(await contract.issueDocument.staticCallResult("hash", "cid"))

      // Sign and send transaction
      const gas = await contract.revokeDocument.estimateGas(hash);
      const tx = await contract.revokeDocument(hash, {
        gasLimit: gas + gas / 40n,
      });
      await tx.wait();

      // // Handle successful transaction
      console.log("Transaction successful:", tx.hash);

      setInstitutionDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          documents: prev.documents.map((doc) => {
            if (doc.document.hash === hash) {
              return {
                ...doc,
                status: true
              };
            }
            return doc;
          })
        };
      });

      // setLoading(false);
    } catch (error) {
      console.log(error);
    }

    // Handle form submission
  };

  if (!isConnected) {
    return <LoginForm />;
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-cyan-600/5 blur-[120px] rounded-full" />
      </div>

      <aside className="hidden md:flex w-72 flex-col bg-black/10 backdrop-blur-3xl relative z-20">
        <div className="absolute right-0 inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="flex h-20 items-center justify-center border-b border-white/5 px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 p-1 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-cyan-500/10">
              <img src="/New Project 100 [31F474F].png" alt="AcadLedger Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight">AcadLedger</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-8">
          <div className="px-6 mb-8">
            <h2 className="mb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Navigation
            </h2>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl bg-white/5 border border-white/5 text-purple-400">
                <FileText className="h-5 w-5" />
                <span className="font-bold">Documents</span>
              </Button>
            </div>
          </div>
        </nav>
        <div className="mt-auto border-t border-white/5 p-6 space-y-4">
          <div className="glassmorphism p-4 rounded-2xl border-white/5">
            <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">Authenticated_As</p>
            <p className="text-xs font-mono text-white/70 truncate">{address?.slice(0, 16)}...</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all font-bold"
            onClick={() => setIsLoggedIn(false)}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 relative z-10">
        <header className="flex h-20 items-center gap-6 bg-black/10 backdrop-blur-2xl px-8 relative">
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="md:hidden h-10 w-10 bg-white/5 rounded-full flex items-center justify-center p-1 border border-white/10">
            <img src="/New Project 100 [31F474F].png" alt="AcadLedger Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="w-full flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="Lookup cryptographic hash..."
                className="w-full bg-white/5 border-white/10 pl-11 h-12 rounded-2xl focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">INSTITUTION</span>
              <span className="text-sm font-bold text-white">
                {institutionDetails ? institutionDetails.name : "RESOLVING..."}
              </span>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-white uppercase font-sans">
                Vault Records
              </h1>
              <p className="text-slate-400 text-sm font-normal">Managing immutable proofs of academic achievement.</p>
            </div>

            <Dialog open={newDocumentOpened}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setNewDocumentOpened(true)}
                  className="h-14 px-8 rounded-2xl bg-cyber-gradient text-white font-black text-lg shadow-xl shadow-purple-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all gap-3"
                >
                  <Plus className="h-6 w-6" />
                  Issue_Credential
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl glassmorphism border-white/10 text-white rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader className="mb-8">
                  <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Forge_Archive</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Prepare new academic data for cryptographic anchoring to the protocol.
                  </DialogDescription>
                </DialogHeader>
                <NewDocumentForm
                  onNewDocumentAdd={(newData: any) =>
                    setInstitutionDetails((prev) =>
                      prev
                        ? {
                          name: prev.name,
                          documents: prev.documents.concat(newData),
                        }
                        : null
                    )
                  }
                  onClose={() => setNewDocumentOpened(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="glassmorphism rounded-[2.5rem] border-white/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent h-16">
                  <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Hash_Identity</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recipient</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">State</TableHead>
                  <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutionDetails ? (
                  institutionDetails.documents.map((doc) => (
                    <TableRow key={doc.document.id} className="border-white/5 hover:bg-white/5 transition-colors h-20">
                      <TableCell className="px-8 font-mono text-[10px] text-purple-400 truncate max-w-[200px]">
                        {doc.document.hash}
                      </TableCell>
                      <TableCell>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                          {doc.document.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-white">{doc.recipient.fullName}</TableCell>
                      <TableCell className="text-slate-400 font-mono text-xs">
                        {new Date(Number(doc.issuedAt) * 1000).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${doc.status ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"
                          }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${doc.status ? "bg-red-500 shadow-[0_0_8px_red]" : "bg-green-500 shadow-[0_0_8px_green]"}`} />
                          {doc.status ? "Revoked" : "Live"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-xl">
                              <MoreHorizontal className="h-5 w-5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glassmorphism border-white/10 text-white rounded-xl">
                            <DropdownMenuItem
                              onClick={() => void onRevoke(doc.document.hash)}
                              className="text-red-400 focus:text-red-300 focus:bg-red-500/10 rounded-lg cursor-pointer font-bold"
                            >
                              Revoke Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 text-purple-400 animate-spin" />
                        <span className="text-xs font-mono tracking-widest text-slate-500">FETCHING_LEDGER_RECORDS...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
}

function LoginForm() {
  const { open } = useWeb3Modal();
  const { address } = useAccount();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] p-8 relative overflow-hidden">
      <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[150px] rounded-full" />

      <Card className="w-full max-w-lg glassmorphism border-white/10 rounded-[3rem] p-12 shadow-2xl relative z-10 transition-all hover:border-white/20">
        <CardHeader className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 p-3 rounded-3xl bg-white shadow-2xl shadow-white/10 border border-white/10">
              <img src="/sethu-logo.png" alt="SIT Logo" className="w-full h-auto object-contain" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-black tracking-tight uppercase italic text-white leading-none">
              Vault_Access
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg font-light">
              Secure institutional gateway. Connect your authority wallet to continue.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <Button
            className="w-full h-16 rounded-2xl bg-cyber-gradient text-white font-black text-xl shadow-2xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => open()}
          >
            {address ? (
              <div className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{address.slice(0, 8)}...{address.slice(-6)}</span>
              </div>
            ) : (
              "Connect Authority Wallet"
            )}
          </Button>
        </CardContent>
        <CardFooter className="justify-center border-t border-white/5 mt-8 pt-6">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">
            Protocol_Security_Active • AISX_v4
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

interface DocumentForm {
  recipientName: string;
  recipientEmail: string;
  recipientId: string;
  recipientWallet?: string;
  documentType: string;
  documentFile: FileList;
  documentDescription: string;
  documentId: string;
}

function NewDocumentForm({
  onClose,
  onNewDocumentAdd,
}: {
  onClose: () => void;
  onNewDocumentAdd: (newData: {
    recipient: {
      fullName: string;
      email: string;
      id: string;
      walletAddress: string;
    };
    document: {
      type: string;
      id: string;
      hash: string;
      description: string;
    };
    issuedAt: bigint;
    status: boolean;
  }) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentForm>();
  const { address, connector } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const newDocumentId = useMemo(() => crypto.randomUUID(), [])

  const onSubmit: SubmitHandler<DocumentForm> = async (data) => {
    try {
      if (!walletClient) {
        return;
      }

      // console.log(data);
      setLoading(true);

      const formData = new FormData();
      formData.append("pdf", data.documentFile[0]);
      formData.append("wallet_address", data.recipientWallet || "");

      const {
        data: { hash, embedding },
      } = await axios.post<{ hash: string; embedding: number[] }>(
        "https://ledger.palatepals.com/add_legit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const {
        data: { cid },
      } = await axios.post<{ cid: string }>("/api/register", {
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        recipientId: data.recipientId,
        recipientWallet: data.recipientWallet,
        documentType: data.documentType,
        documentDescription: data.documentDescription,
        documentHash: hash,
        embedding: embedding,
        documentId: newDocumentId,
      });

      // console.log(await connector?.getProvider())

      // Convert to EIP-1193 provider
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      console.log(signer);
      // const feeData = await provider.get();

      // console.log(feeData)

      // // Connect to contract
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DASHBOARD_CONTRACT_ADDRESS!,
        abi, // Your contract ABI
        signer
      );

      // const estimatedGas = await contract.getAddress;

      // console.log(await contract.issueDocument.staticCallResult("hash", "cid"))

      // Sign and send transaction
      const gas = await contract.issueDocument.estimateGas(hash, cid);
      const tx = await contract.issueDocument(hash, cid, {
        gasLimit: gas + gas / 40n,
      });
      await tx.wait();

      // // Handle successful transaction
      console.log("Transaction successful:", tx.hash);

      onNewDocumentAdd({
        recipient: {
          fullName: data.recipientName,
          email: data.recipientEmail,
          id: data.recipientId,
          walletAddress: data.recipientWallet ?? "",
        },
        document: {
          type: data.documentType,
          id: newDocumentId,
          hash: hash,
          description: data.documentDescription,
        },
        issuedAt: BigInt(Math.floor(Date.now() / 1000)),
        status: false,
      });

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);

    }

    // Handle form submission
  };


  return (
    <form
      id="new-document-form"
      className="space-y-10 py-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_purple]" />
          Recipient_Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Full Name" error={errors.recipientName}>
            <Input
              id="recipient-name"
              placeholder="e.g. Satoshi Nakamoto"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-purple-500/50"
              {...register("recipientName", {
                required: "Full name is required",
              })}
            />
          </FormField>

          <FormField label="Email" error={errors.recipientEmail}>
            <Input
              id="recipient-email"
              type="email"
              placeholder="satoshi@bitcoin.org"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-purple-500/50"
              {...register("recipientEmail", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
          </FormField>

          <FormField label="ID / Registration" error={errors.recipientId}>
            <Input
              id="recipient-id"
              placeholder="UID-9921-X"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-purple-500/50"
              {...register("recipientId", { required: "ID is required" })}
            />
          </FormField>

          <FormField label="Wallet Address" error={errors.recipientWallet}>
            <Input
              id="recipient-wallet"
              placeholder="0x... (Optional)"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-purple-500/50 font-mono text-xs"
              {...register("recipientWallet")}
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-white/5">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]" />
          Credential_Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Credential Type" error={errors.documentType}>
            <Input
              id="document-type"
              placeholder="Degree Certificate"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-cyan-500/50"
              {...register("documentType", {
                required: "Document type is required",
              })}
            />
          </FormField>

          <FormField label="Archive UID (Auto)">
            <Input
              id="document-id"
              defaultValue={newDocumentId}
              readOnly
              className="bg-white/10 border-white/20 h-12 rounded-xl font-mono text-xs text-slate-400 cursor-not-allowed"
            />
          </FormField>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Source File</Label>
          <div className="relative group">
            <Input
              id="document-file"
              type="file"
              accept=".pdf,.doc,.docx"
              className="bg-white/5 border-white/10 h-14 rounded-2xl file:bg-white/10 file:border-0 file:text-white file:font-bold file:px-4 file:h-full file:mr-4 hover:border-cyan-500/40 transition-all cursor-pointer"
              {...register("documentFile", {
                required: "Document file is required",
              })}
            />
          </div>
          {errors.documentFile && (
            <span className="text-xs text-red-500 font-bold tracking-tight">
              {errors.documentFile.message}
            </span>
          )}
        </div>

        <FormField label="Description / Metadata" error={errors.documentDescription}>
          <Textarea
            id="document-description"
            placeholder="Official transcript for Semester 8..."
            className="bg-white/5 border-white/10 rounded-2xl min-h-[100px] focus:ring-cyan-500/50"
            {...register("documentDescription", {
              required: "Description is required",
            })}
          />
        </FormField>
      </div>

      <DialogFooter className="mt-10 sm:justify-between gap-4">
        <Button onClick={onClose} variant="ghost" type="button" className="h-14 px-8 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5">
          Abort Forge
        </Button>
        <Button
          type="submit"
          form="new-document-form"
          disabled={loading}
          className="h-14 px-10 rounded-2xl bg-cyber-gradient text-white font-black text-lg shadow-xl shadow-purple-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="animate-pulse">ANCHORING...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Commit_To_Ledger
            </div>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FormField({ label, children, error }: { label: string, children: React.ReactNode, error?: any }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">{label}</Label>
      {children}
      {error && (
        <span className="text-xs text-red-500 font-bold tracking-tight px-1">
          {error.message}
        </span>
      )}
    </div>
  );
}
