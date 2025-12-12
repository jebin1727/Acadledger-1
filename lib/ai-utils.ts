import { GoogleGenerativeAI } from "@google/generative-ai";

// Interface for the extracted data from the AI model
export interface ExtractedDocumentData {
    recipientName?: string;
    recipientId?: string;
    documentType?: string;
    confidenceScore: number;
    isFraudulent: boolean;
    fraudReason?: string;
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

/**
 * Parses a PDF/Image document using Google Gemini to extract details and detect fraud.
 * 
 * @param file The uploaded file
 * @returns Extracted data and fraud analysis
 */
export async function parseDocumentWithAI(file: File): Promise<ExtractedDocumentData> {
    try {
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            console.warn("Gemini API Key is missing. Returning mock data.");
            // Fallback for demo if key is missing
            return {
                recipientName: "Jane Doe (Mock)",
                recipientId: "STU-12345-X",
                documentType: "Bachelor of Science",
                confidenceScore: 0.98,
                isFraudulent: false,
            };
        }

        // Convert file to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });

        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Content = base64Data.split(',')[1];

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        Analyze this document image for a credential attestation system.
        Extract the following fields in JSON format:
        - recipientName: The name of the student/recipient.
        - recipientId: The ID number (e.g., student ID).
        - documentType: The type of degree or certificate.

        Also perform a fraud analysis:
        - Check for font inconsistencies, pixelation, or artifacts that suggest editing.
        - confidenceScore: A number between 0.0 and 1.0 indicating how real the document looks.
        - isFraudulent: true if you suspect tampering, false otherwise.
        - fraudReason: If fraudulent, explain why briefly.

        Return ONLY the JSON object.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Content,
                    mimeType: file.type,
                },
            },
        ]);

        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(text);

        return {
            recipientName: data.recipientName,
            recipientId: data.recipientId,
            documentType: data.documentType,
            confidenceScore: data.confidenceScore,
            isFraudulent: data.isFraudulent,
            fraudReason: data.fraudReason
        };
    } catch (error) {
        console.error("AI Error:", error);
        throw new Error("Failed to process document with AI");
    }
}
