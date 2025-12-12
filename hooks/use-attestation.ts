import { useWriteContract, useReadContract } from 'wagmi'
import { AttestationRegistryABI } from '@/lib/abi'

// This is a placeholder address for the contract on Polygon Amoy
// Ideally this would be in .env
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

export function useAttestation() {
    const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract()

    const attestCredential = (credentialHash: `0x${string}`) => {
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: AttestationRegistryABI,
            functionName: 'attest',
            args: [credentialHash],
        })
    }

    return {
        attestCredential,
        isAttesting: isPending,
        isSuccess,
        error,
        txHash: hash
    }
}

export function useVerify(credentialHash: `0x${string}`) {
    const { data: isVerified, isLoading } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: AttestationRegistryABI,
        functionName: 'verify',
        args: [credentialHash],
    })

    return { isVerified, isLoading }
}
