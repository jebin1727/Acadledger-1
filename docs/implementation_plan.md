# Implementation Plan: AI-Augmented L2 Attestation Framework

## Goal
Transform the generic template into a **Research-Grade Prototype** titled **"Verifiable Ledger: AI-Augmented Credential Attestation"**.

## Phase 1: The "Minimalist" UI
The UI will focus purely on the framework itself, with no specific product branding.

### 1. Global Rebrand (`app/layout.tsx`, `app/page.tsx`)
*   **App Name**: " " (Empty/Minimal) or "Credential Framework".
*   **Hero Title**: "A Framework for AI-Augmented Credential Attestation via Layer 2 Rollups".
*   **Subtitle**: "Decentralized Trust Anchors using Polygon Amoy & Generative AI."
*   **Footer**: "Research Prototype".

### 2. The "Action Zone" (Main Interactive Component)
Replace current "Features" section with a functional Dashboard Card.
*   **Step 1**: Upload (Drag & Drop).
*   **Step 2**: Analysis (Gemini Processing).
*   **Step 3**: Attestation Button (Polygon Interact).

## Phase 2: The Logic (Core Engine)

### 3. AI Oracle (`lib/ai-utils.ts`)
*   **Task**: Integrate Google Gemini API.
*   **Output**: Structured JSON `{ recipientName, degree, gpa, issuedAt }`.

### 4. Blockchain Anchor (`hooks/use-attestation.ts`)
*   **Task**: Create the hook to call `writeContract`.
*   **Contract**: Use a simple "AttestationRegistry" ABI (we will mock the ABI if needed or provide a standard one).

## Phase 3: Execution Checklist
1.  [ ] **Install**: `npm install @google/generative-ai`
2.  [ ] **Configure**: Add `NEXT_PUBLIC_GEMINI_API_KEY`.
3.  [ ] **Create**: `hooks/use-attestation.ts`.
4.  [ ] **Update**: `app/page.tsx` with new Text & Action Zone.
