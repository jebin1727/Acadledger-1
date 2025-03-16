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
    pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2ODYwZTIwYS00ZmE0LTQ0OTgtYmUzYS04NDM3ZTZmYTQ2Y2QiLCJlbWFpbCI6ImxsY2FkYXhvbkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNzcxMWRhZGE4Yjg2NzVmYmEzNDkiLCJzY29wZWRLZXlTZWNyZXQiOiIwM2E1MjI4MDQyZDNjY2U4MzQ3ZDRjNjBhYTBlMDk4ZDQwM2QzNmM3YzZlZjE4Njg5ODc5Yzg4ZTQwYjYyMmJlIiwiZXhwIjoxNzczNTY1OTgxfQ.AF0UPkFSyBHGsubfyz_P6zQOC7bHBcvavTHlsvveSr8"!,
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

