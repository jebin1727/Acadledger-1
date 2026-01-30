
# PROJECT REPORT CONTENT: AI-AUGMENTED CREDENTIAL ATTESTATION FRAMEWORK

## ABSTRACT

Academic credential fraud, including the fabrication of degree certificates and grade sheets, poses a significant trust deficit in the global hiring and educational ecosystem. Traditional verification methods are manual, slow, and prone to human error. While blockchain technology offers immutability, existing "on-chain" solutions suffer from critical flaws: they either expose sensitive Personally Identifiable Information (PII) violating GDPR, or rely on brittle "file hashing" techniques that fail when legitimate documents are compressed or scanned.

This project proposes **AcadLedger**, a Privacy-Preserving Attestation Framework that creates a "Double Shield" against fraud. The system integrates **Geneative AI (Google Gemini 1.5 Flash)** as a Layer-1 visual guard to detect pixel-level tampering (e.g., Photoshop edits) and semantic inconsistencies. For the Layer-2 factual guard, it utilizes the **Polygon Amoy Blockchain** to anchor deterministic hashes of the extracted data, not the file itself. This "Data Hashing" approach ensures that a valid credential can be verified regardless of whether it is presented as a PDF, a scanned image, or a photocopy, provided the semantic data remains unchanged. The proposed architecture achieves Zero-Knowledge privacy by ensuring no student data is stored on central servers; data remains exclusively in the user's possession, with only cryptographic proofs residing on the blockchain.

---

## CHAPTER 1: INTRODUCTION

### 1.1 Overview
The digital transformation of education has not been matched by a modernization of credential verification. "AcadLedger" is a decentralized application (dApp) designed to issue and verify academic credentials using a hybrid architecture of Artificial Intelligence and Blockchain technology. It moves the trust anchor from centralized university servers to a transparent, immutable distributed ledger, while simultaneously using AI to bridge the gap between physical paper documents and digital proofs.

### 1.2 Problem Statement
1.  **Proliferation of Fake Degrees**: High-quality forgeries created with modern editing software (e.g., Photoshop) are visually indistinguishable from originals.
2.  **Privacy Violations in Blockchain**: Storing student names and grades on a public blockchain (like Ethereum) is permanent and violates "Right to be Forgotten" (GDPR).
3.  **Brittleness of File Hashing**: Standard blockchain solutions hash the PDF file. If a user saves the PDF with new metadata, compresses it, or prints and scans it, the hash changes, and verification fails, even if the certificate is authentic.
4.  **Centralized Failure Points**: University databases can be hacked, downtime prevents verification, and defunct institutions leave students with unverifiable degrees.

### 1.3 Objectives
-   To develop a **Privacy-Preserving Architecture** where PII (Personally Identifiable Information) never leaves the user's device.
-   To implement a **"Double Shield" Verification System**:
    -   **Visual Layer**: AI detects tampering, font inconsistencies, and visual anomalies.
    -   **Factual Layer**: Blockchain verifies the existence and integrity of the data.
-   To solve the *File Hash Problem* by implementing **Semantic Data Hashing**, ensuring robustness across different file formats (PDF, JPG, PNG).
-   To minimize costs and ensure scalability using **Polygon Layer 2** scaling solutions.

### 1.4 Scope
The current scope is limited to Academic Degree Certificates and Grade Sheets. However, the underlying "Attestation Framework" is agnostic and can be extended to:
-   Medical Records (proving health status without revealing details).
-   Supply Chain Documents (invoices, bills of lading).
-   Government IDs (proving age without revealing address).

---

## CHAPTER 2: LITERATURE SURVEY

### 2.1 Traditional Database Systems vs. Key-Value Stores
Traditional verification involves contacting the issuing institution manually or via a centralized portal.
*   **Limitation**: Single point of failure, susceptible to SQL injection, and admin corruption (insider threats).

### 2.2 Public Blockchain via Raw Storage (Ethereum L1)
Early attempts stored hashes of documents or even raw text on Ethereum.
*   **Limitation**: High gas fees make it economically unviable for millions of students. Public data storage violates privacy laws (GDPR/CCPA).

### 2.3 "Soulbound Tokens" (SBTs) & Verifiable Credentials (VCs)
SBTs represent non-transferable identity tokens.
*   **Gap**: Most SBT implementations focus on "digital-native" badges. They lack a mechanism to bridge *physical* paper documents to the chain. They assume the input data is trusted, without verifying if the uploaded document image was photoshopped before minting.

### 2.4 Existing File-Hashing Solutions
Commercial solutions like DocuSign or basic notary chains hash the binary content of a file.
*   **Critical Flaw**: They fail the "Robustness" test. A legitimate user scanning a physical copy of their true degree results in a different hash, causing a false rejection.

**Proposed Solution Gap**: AcadLedger addresses the *Visual Trust* gap using Generative AI and the *Robustness* gap using Semantic Data Hashing.

---

## CHAPTER 3: SYSTEM ANALYSIS

### 3.1 Existing System
Currently, employers verify degrees by:
1.  Collecting physical/PDF copies.
2.  Emailing or calling the university registrar.
3.  Waiting days or weeks for a response.
4.  Trusting centralized third-party background check agencies.

**Disadvantages**:
-   **Time-Consuming**: Turnaround time can be 2-4 weeks.
-   **Expensive**: Third-party agencies charge significant fees.
-   **No Privacy**: The student hands over their document to strangers effectively losing control of their data.

### 3.2 Proposed System
The proposed **AI-Augmented Privacy Rollup** automates verification in seconds.
1.  **User Ownership**: The student holds the data. No central database exists.
2.  **Instant Verification**: Employers upload a document; the system verifies it against the blockchain instantly.
3.  **Fraud Detection**: The system catches both "Fake Data" (Lying) and "Fake Documents" (Tampering).

### 3.3 Feasibility Study
-   **Technical**: Google Gemini 1.5 Flash API is highly accurate for OCR and visual analysis. Polygon Amoy offers near-zero gas fees (~$0.01 per attestation), making it viable for mass adoption.
-   **Economic**: Eliminates the maintenance cost of secure server farms for data storage.
-   **Operational**: The system is a lightweight web client requiring no special hardware for users.

---

## CHAPTER 4: SYSTEM DESIGN

### 4.1 System Architecture: The "Privacy Rollup" Model
The architecture follows a strict "Off-Chain Data, On-Chain Proof" model.

1.  **Client Layer (Next.js)**: Handling UI and Wallet connections.
2.  **Intelligence Layer (Google Gemini)**:
    -   Input: Image/PDF.
    -   Process: OCR (Data Extraction) + Visual Anomaly Detection.
    -   Output: Structured JSON + Confidence Score.
3.  **Privacy Layer (Hashing Engine)**:
    -   Input: Structured JSON.
    -   Process: Dictionary Sort -> Stringify -> Keccak256 Hash.
    -   Output: `0x...` Hash (The "Fingerprint").
4.  **Trust Layer (Polygon L2)**:
    -   Smart Contract: Stores the hashes mapped to Issuer Addresses.

### 4.2 Modules
1.  **Attestation Module (Minting)**:
    -   Allows institutions/students to upload original documents.
    -   Performs AI checks.
    -   Writes the hash to the Smart Contract.
2.  **Verification Module**:
    -   Allows third parties to check a document.
    -   Re-runs AI extraction and Hashing.
    -   Queries the Smart Contract for hash existence.
3.  **AI Guard Module**:
    -   Prompt Engineering: "Analyze this image for font irregularities, shadow mismatches, and pixelation consistent with digital editing."

### 4.3 Algorithms

**Algorithm 1: Semantic Data Hashing**
```plaintext
Input: Document D (PDF/Image)
1. Extract Data E = AI_OCR(D)
   -> E = { Name: "John", Degree: "B.Tech", ... }
2. Validate Visuals V = AI_Vision_Check(D)
3. IF V == "Fraudulent": RETURN Error
4. Canonicalize J = JSON.stringify(SortKeys(E))
5. Hash H = Keccak256(J)
6. RETURN H
```

---

## CHAPTER 5: SYSTEM IMPLEMENTATION

### 5.1 Technology Stack
-   **Frontend**: Next.js 14 (React Framework), TypeScript.
-   **Styling**: Tailwind CSS (Dark/Modern UI).
-   **Artificial Intelligence**: Google Gemini 1.5 Flash (via Vercel AI SDK).
-   **Blockchain**: Polygon Amoy Testnet (EVM Compatible).
-   **Web3 Interaction**: Ethers.js / Wagmi.
-   **Package Manager**: NPM/Bun.

### 5.2 Core Implementation Details

#### 5.2.1 The AI Integration (`lib/ai-utils.ts`)
We utilize the multimodal capabilities of Gemini 1.5. The prompting strategy is key:
*"Extract the student name and degree. simultaneously, analyze the image for signs of digital manipulation such as inconsistent noise patterns or font mismatches."*

#### 5.2.2 The L2 Hook (`hooks/use-attestation.ts`)
This React hook manages the lifecycle of a blockchain transaction:
1.  Connects to Metamask.
2.  Switches network to Polygon Amoy.
3.  Calls the `attest(bytes32 hash)` function on the smart contract.

#### 5.2.3 Data Hashing Logic
The critical innovation is ensuring the hash is **deterministic**. We strip out "volatile" fields (like dates of generation or random nonces) and only hash the "factual" fields (Name, ID, Degree, University).

---

## CHAPTER 6: CONCLUSION AND FUTURE SCOPE

### 6.1 Conclusion
The **AcadLedger** framework successfully demonstrates that privacy and blockchain transparency can coexist. By decoupling the *Data* (kept off-chain) from the *Proof* (kept on-chain), and securing the bridge between them with *Generative AI*, we solve the "Garbage In, Garbage Out" problem that plagues most supply-chain and identity blockchains. We have achieved a checking mechanism that is both **Robust** (tolerant to file format changes) and **Secure** (intolerant to data tampering).

### 6.2 Future Enhancement
1.  **Mobile App with Camera Integration**: Real-time verifying of framed certificates on walls using AR.
2.  **DAO Governance**: Allowing a decentralized consortium of universities to vote on whitelisting new issuers.
3.  **Zero-Knowledge Proofs (ZK-SNARKs)**: Replacing the hash check with a ZK-proof for even granular privacy (e.g., proving "Grade > B" without revealing the exact grade).

---

## REFERENCES
1.  Nakamoto, S. (2008). Bitcoin: A Peer-to-Peer Electronic Cash System.
2.  Buterin, V. (2013). Ethereum Whitepaper.
3.  Google DeepMind. (2024). Gemini 1.5 Technical Report.
4.  Polygon Labs. (2023). Polygon PoS and zkEVM Architecture.
5.  GDPR. (2016). Regulation (EU) 2016/679 (General Data Protection Regulation).

