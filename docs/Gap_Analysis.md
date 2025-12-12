# Gap Analysis: What is Missing?

You asked: *"What parts do we need to implement? What UI changes?"*

## 1. The Missing Logic
We have the skeleton, but no muscles.

| Component | Status | Missing Action |
| :--- | :--- | :--- |
| **AI Engine** (`lib/ai-utils.ts`) | ⚠️ **Mocked** | Needs to actually call **Google Gemini API**. Currently, it just sleeps for 2 seconds and returns "Jane Doe". |
| **Blockchain Hook** (`hooks/use-attestation.ts`) | ❌ **Missing** | File does not exist. We need to create it to handle the `writeContract` call to Polygon. |
| **Smart Contract ABI** (`Attestation.json`) | ❌ **Missing** | We need the JSON file that tells the app *how* to talk to the contract. |

---

## 2. The Missing UI (The Transformation)
We need to change the generic "Web3 Template" into **"CertifyChain"**.

### A. Branding & Text (`app/page.tsx`)
*   **Current**: "Web3Modal Example", "Polygon Amoy".
*   **Target**:
    *   **Title**: `CertifyChain: AI-Backed Trust`
    *   **Subtitle**: `Secure. Instant. Verified by Polygon.`
    *   **Button**: `Connect Wallet` matching the theme.

### B. The "Action Zone" (New Section)
We need to add a "Main Card" in the center with 3 states:

#### State 1: Upload (The Dropzone)
*   [ICON] "Drag & Drop Certificate (PDF/IMG)"
*   Button: "Analyze with AI"

#### State 2: Review (The AI Results)
*   **"AI Analysis Complete"** (Green Checkmark)
*   **Detected Data**:
    *   Name: `[ Editable Input ]`
    *   Degree: `[ Editable Input ]`
    *   **Fraud Score**: `0.02` (Safe) 🟢
*   Button: "Mint to Blockchain"

#### State 3: Success (The Proof)
*   🎉 **Attested!**
*   **Transaction Hash**: `0x123...abc` (Link to PolygonScan)

---

## 3. Summary of Work to Do
1.  **Code**: Paste the `AttestationVerifier.json` ABI file.
2.  **Code**: Write `hooks/use-attestation.ts`.
3.  **Code**: Update `lib/ai-utils.ts` with Gemini Key.
4.  **UI**: Delete the current "Info Cards" in `page.tsx` and replace them with the **"Action Zone"** described above.
