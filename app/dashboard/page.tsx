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

  const { isConnected } = useAccount();

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
        if (!client?.transport) return;

        const provider = new ethers.BrowserProvider(client.transport);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
          "0x9EBf5CA8b533E62d0cA2AFC75FF99f616238A4A5",
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
          "0xB4DbaEAf41A339cefB524d959643A386284aF71a"
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
        "0x9EBf5CA8b533E62d0cA2AFC75FF99f616238A4A5",
        abi, // Your contract ABI
        signer
      );

      // const estimatedGas = await contract.getAddress;

      // console.log(await contract.issueDocument.staticCallResult("hash", "cid"))

      // Sign and send transaction
      const gas = await contract.revokeDocument.estimateGas(hash);
      const tx = await contract.revokeDocument(hash, {
        gasLimit: gas + gas/10n,
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
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            <span>CertifyChain</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="px-4 mb-4">
            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">
              Dashboard
            </h2>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </Button>
            </div>
          </div>
        </nav>
        <div className="mt-auto border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => setIsLoggedIn(false)}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <div className="flex flex-col flex-1">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:px-6">
          <div className="md:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Shield className="h-5 w-5 text-primary" />
              <span>CertifyChain</span>
            </Link>
          </div>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search documents..."
                  className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <span className="sr-only md:not-sr-only md:inline">
                {institutionDetails ? institutionDetails.name : "Loading..."}
              </span>
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">
              Document Management
            </h1>
            <Dialog open={newDocumentOpened}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setNewDocumentOpened(true)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Issue New Document</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create and issue a new official
                    document.
                  </DialogDescription>
                </DialogHeader>
                <NewDocumentForm
                  onNewDocumentAdd={(newData: {
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
                  }) =>
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
          <Tabs defaultValue="all" className="w-full">
            <TabsContent value="all" className="border rounded-md mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutionDetails ? (
                    institutionDetails.documents.map((doc) => (
                      <TableRow key={doc.document.id}>
                        <TableCell className="font-medium">
                          {doc.document.hash}
                        </TableCell>
                        <TableCell>{doc.document.type}</TableCell>
                        <TableCell>{doc.recipient.fullName}</TableCell>
                        <TableCell>
                          {new Date(
                            Number(doc.issuedAt) * 1000
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                doc.status ? "bg-red-500" : "bg-green-500"
                              }`}
                            ></div>
                            <span>{doc.status ? "Revoked" : "Issued"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => void onRevoke(doc.document.hash)}
                                className="text-destructive"
                              >
                                Revoke
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function LoginForm() {
  const { open } = useWeb3Modal();

  const { address } = useAccount();
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl">
            Institution Login
          </CardTitle>
          <CardDescription className="text-center">
            Connect yo god damn wallet
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <Button className="w-full" onClick={() => open()} variant="outline">
            {address ? (
              <div className="flex gap-2 items-center">
                <UserCircle2 className="h-8 w-8 mr-2" />
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            ) : (
              "Connect Wallet"
            )}
          </Button>
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
  const newDocumentId = useMemo(() => crypto.randomUUID(),[])

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
        "http://localhost:5000/add_legit",
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
        "0x9EBf5CA8b533E62d0cA2AFC75FF99f616238A4A5",
        abi, // Your contract ABI
        signer
      );

      // const estimatedGas = await contract.getAddress;

      // console.log(await contract.issueDocument.staticCallResult("hash", "cid"))

      // Sign and send transaction
      const gas = await contract.issueDocument.estimateGas(hash, cid);
      const tx = await contract.issueDocument(hash, cid, {
        gasLimit: gas + gas / 10n,
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
      className="space-y-6 py-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Recipient's Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-name">Full Name</Label>
            <Input
              id="recipient-name"
              placeholder="Recipient's full name"
              {...register("recipientName", {
                required: "Full name is required",
              })}
            />
            {errors.recipientName && (
              <span className="text-sm text-red-500">
                {errors.recipientName.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Email</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="recipient@example.com"
              {...register("recipientEmail", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.recipientEmail && (
              <span className="text-sm text-red-500">
                {errors.recipientEmail.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient-id">ID/Registration Number</Label>
            <Input
              id="recipient-id"
              placeholder="Student ID or registration number"
              {...register("recipientId", { required: "ID is required" })}
            />
            {errors.recipientId && (
              <span className="text-sm text-red-500">
                {errors.recipientId.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient-wallet">Wallet Address</Label>
            <Input
              id="recipient-wallet"
              placeholder="Blockchain wallet address (optional)"
              {...register("recipientWallet")}
            />
            <p className="text-xs text-muted-foreground">
              For blockchain verification and storage
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Document Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Type of Document</Label>
            <Input
              id="document-type"
              placeholder="Degree Certificate"
              {...register("documentType", {
                required: "Document type is required",
              })}
            />
            {errors.documentType && (
              <span className="text-sm text-red-500">
                {errors.documentType.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="document-id">Document ID</Label>
            <Input
              id="document-id"
              defaultValue={newDocumentId}
              value={newDocumentId}
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Auto-generated unique identifier
            </p>
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Label htmlFor="document-file">Document File</Label>
          <Input
            id="document-file"
            type="file"
            accept=".pdf,.doc,.docx"
            {...register("documentFile", {
              required: "Document file is required",
            })}
          />
          {errors.documentFile && (
            <span className="text-sm text-red-500">
              {errors.documentFile.message}
            </span>
          )}
          <p className="text-sm text-muted-foreground">
            Upload the document file (PDF, DOC, DOCX)
          </p>
        </div>
        <div className="space-y-2 mt-4">
          <Label htmlFor="document-description">Description</Label>
          <Textarea
            id="document-description"
            placeholder="Brief description of the document"
            className="min-h-[80px]"
            {...register("documentDescription", {
              required: "Description is required",
            })}
          />
          {errors.documentDescription && (
            <span className="text-sm text-red-500">
              {errors.documentDescription.message}
            </span>
          )}
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button onClick={onClose} variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit" form="new-document-form">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </div>
          ) : (
            "Create Document"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
