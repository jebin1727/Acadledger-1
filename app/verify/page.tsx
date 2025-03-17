"use client";

import { useState } from "react";
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
import { Shield, FileCheck, Building2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from "axios";
import { ethers } from "ethers";
import { abi } from "@/lib/contract";

export default function VerifyPage() {
  const [documentId, setDocumentId] = useState<FileList | null>(null);
  const [verificationState, setVerificationState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message?: string;
    data?: {
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
      name: string;
    };
  }>({ status: "idle" });

  const handleVerify = async () => {
    if (!documentId) return;

    setVerificationState({ status: "loading" });
    const formData = new FormData();
    formData.append("pdf", documentId[0]);

    try {
      const { data } = await axios.post(
        "https://ledger.palatepals.com/verify",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // const provider = new ethers.BrowserProvider(walletClient.transport);
      // const signer = await provider.getSigner();
      // console.log(signer);
      // const feeData = await provider.get();

      // console.log(feeData)
      const provider = new ethers.JsonRpcProvider(
        "https://rpc-amoy.polygon.technology/"
      );
      // // Connect to contract
      const contract = new ethers.Contract(
        "0x9EBf5CA8b533E62d0cA2AFC75FF99f616238A4A5",
        abi, // Your contract ABI
        provider
      );

      // const estimatedGas = await contract.getAddress;

      // console.log(await contract.issueDocument.staticCallResult("hash", "cid"))

      // Sign and send transaction
      const result: [
        valid: boolean,
        issuer: string,
        issuedAt: bigint,
        revoked: boolean,
        ipfsURI: string
      ] = await contract.verifyDocument(data.hash);

      if (result[0] === false) {
        setVerificationState({
          status: "error",
          message: "The document has either been revoked or does not exist in the system",
        });

        return;
      }

      // const result: [
      //   docHash: string,
      //   issuer: string,
      //   issuedAt: bigint,
      //   revoked: boolean,
      //   ipfsURI: string
      // ] = await contract.verifyDocument(data.hash);

      const institutionResult: [
        [institutionAddress: string, metadata: string],
        [
          docHash: string,
          issuer: string,
          issuedAt: bigint,
          revoked: boolean,
          ipfsURI: string
        ][]
      ] = await contract.getInstitutionWithDocuments(result[1]);

      const metadataResponse = await axios.get("/api/register", {
        params: {
          cid: institutionResult[0][1].replace("ipfs://", ""), // institution metadata CID
        },
      });

      console.log(result);

      const { data: docData } = await axios.get<{
        data: {
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
        };
      }>("/api/register", {
        params: {
          cid: result[4], // institution metadata CID
        },
      });

      // Fix verification state updates (should be objects)
      if (data.similarity === "100%") {
        setVerificationState({
          status: "success",
          data: {
            ...docData["data"],
            issuedAt: result[2],
            status: result[3],
            name: metadataResponse.data["data"]["name"],
          },
        });
      } else {
        setVerificationState({
          status: "error",
          message: `Document verification failed. Generated hash: ${
            data.hash
          }, Similarity score: ${data.similarity ? data.similarity : "0%"}`,
        });
      }
    } catch (error) {
      console.log(error);
      setVerificationState({
        status: "error",
        message: "An error occurred during verification",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CertifyChain</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/dashboard">
              <Button>Institution Login</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">
            Verify Document Authenticity
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Document Verification</CardTitle>
              <CardDescription>
                Enter the document ID to verify its authenticity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-id">Document ID</Label>
                <Input
                  id="document-id"
                  placeholder="e.g. CERT-2023-001"
                  onChange={(e) => setDocumentId(e.target.files)}
                  type="file"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                The document ID can be found on the document itself or in the QR
                code.
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleVerify}
                disabled={verificationState.status === "loading" || !documentId}
              >
                {verificationState.status === "loading"
                  ? "Verifying..."
                  : "Verify Document"}
              </Button>
            </CardFooter>
          </Card>

          {verificationState.status === "success" && (
            <div className="mt-8">
              <Alert className="bg-green-50 border-green-200">
                <FileCheck className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">
                  Document Verified
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  This document is authentic and was issued by a verified
                  institution.
                </AlertDescription>
              </Alert>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Document Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold">
                        {verificationState.data?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Issuing Institution
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Document Type:
                      </span>
                      <span className="font-medium">
                        {verificationState.data?.document.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Recipient:
                      </span>
                      <span className="font-medium">
                        {verificationState.data?.recipient.fullName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Issue Date:
                      </span>
                      <span className="font-medium">
                        {" "}
                        {new Date(
                          Number(verificationState?.data?.issuedAt) * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status:
                      </span>
                      <span className="font-medium">
                        {verificationState.data?.status ? "Revoked" : "Issued"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {verificationState.status === "error" && (
            <div className="mt-8">
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription className="break-words">
                  {verificationState.message}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold">CertifyChain</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2023 CertifyChain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
