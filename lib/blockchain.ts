import { ethers } from "ethers";
import { AttestationRegistryABI } from "./abi";

// The address of the deployed AttestationRegistry contract on Polygon zkEVM Cardona Testnet
// You should update this with your actual deployed contract address
const ATTESTATION_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

export interface BlockchainStatus {
    isConnected: boolean;
    account?: string;
    chainId?: number;
    error?: string;
}

/**
 * Connects to the user's Metamask wallet.
 */
export async function connectWallet(): Promise<BlockchainStatus> {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        return { isConnected: false, error: "Metamask is not installed" };
    }

    try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();

        return {
            isConnected: true,
            account: accounts[0],
            chainId: Number(network.chainId)
        };
    } catch (error: any) {
        console.error("Wallet connection error:", error);
        return { isConnected: false, error: error.message || "Failed to connect wallet" };
    }
}

/**
 * Attests a document hash on the blockchain (Issuer only).
 * @param hash The Keccak256 hash of the document data
 */
export async function attestOnChain(hash: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        return { success: false, error: "Metamask not found" };
    }

    try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(ATTESTATION_REGISTRY_ADDRESS, AttestationRegistryABI, signer);

        const tx = await contract.attest(hash);
        await tx.wait(); // Wait for confirmation

        return { success: true, txHash: tx.hash };
    } catch (error: any) {
        console.error("Attestation error:", error);
        return { success: false, error: error.reason || error.message || "Transaction failed" };
    }
}

/**
 * Verifies if a document hash exists on the blockchain (Public view).
 * @param hash The Keccak256 hash of the document data
 */
export async function verifyOnChain(hash: string): Promise<boolean> {
    // For reading, we can use a public RPC or the user's wallet if connected.
    // Ideally use a dedicated RPC for reliability if user has no wallet, 
    // but for now we'll rely on window.ethereum or a default provider.

    let provider;
    if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
    } else {
        // Fallback to a public RPC if needed, or fail if no provider
        // provider = new ethers.JsonRpcProvider("RPC_URL");
        console.warn("No wallet found for verification, returning false (demo mode)");
        return false;
    }

    try {
        const contract = new ethers.Contract(ATTESTATION_REGISTRY_ADDRESS, AttestationRegistryABI, provider);
        const isValid = await contract.verify(hash);
        return isValid;
    } catch (error) {
        console.error("Verification error:", error);
        return false;
    }
}
