import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PinataSDK } from "pinata";

const registerSchema = z.object({
    recipientName: z.string(),
    recipientEmail: z.string().email(),
    recipientId: z.string(),
    recipientWallet: z.string().optional(),
    documentType: z.string(),
    documentDescription: z.string(),
    documentHash: z.string(),
    embedding: z.array(z.number()),
    documentId: z.string()
})


const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: "maroon-deep-capybara-912.mypinata.cloud",
});

// 03a5228042d3cce8347d4c60aa0e098d403d36c7c6ef18689879c88e40b622be

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validate request body
        const validation = registerSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request data', details: validation.error.errors },
                { status: 400 }
            )
        }

        const { documentDescription, documentHash, documentId, documentType, embedding, recipientEmail, recipientId, recipientName, recipientWallet } = validation.data

        const metadata = {
            "recipient": {
                "fullName": recipientName,
                "email": recipientEmail,
                "id": recipientId,
                "walletAddress": recipientWallet
            },
            "document": {
                "type": documentType,
                "id": documentId,
                "hash": documentHash,
                "description": documentDescription
            }
        }


        const file = new File([JSON.stringify(metadata)], `${documentHash}.json`, { type: "application/json" });
        const upload = await pinata.upload.public.file(file);

        const cid = upload.cid;

        return NextResponse.json(
            {
                cid: cid
            },
            { status: 201 }
        )

    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cid = searchParams.get('cid');

        if (!cid) {
            return NextResponse.json(
                { error: 'CID parameter is required' },
                { status: 400 }
            );
        }

        const { data, contentType } = await pinata.gateways.public.get(cid);

        return NextResponse.json(
            {
                data: data,
                contentType: contentType
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Get CID data error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

