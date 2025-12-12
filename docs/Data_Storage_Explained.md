# where is the data?

You asked: *"Where are the embeddings and data stored?"*

The answer is surprising: **We do NOT store the data. We do NOT store embeddings.**

## 1. The "Privacy Rollup" Model
This system is designed for **Privacy**. We don't want a central database of students (which can be hacked).

*   **The Data (`Name: Ravi`)**: Stored **ONLY** in the file (PDF) held by the Student.
    *   *Analogy*: It's like cash. The value is in the paper note you hold, not in a bank database.
*   **The Hash (`0x123...`)**: Stored on **Polygon Blockchain**.
    *   *Analogy*: A "fingerprint" of the cash note, kept in a public ledger to check for counterfeits.

## 2. What about Embeddings?
We do **NOT** use Vector Databases (like Pinecone/Chroma) here.

*   **Embeddings** are typically used for "Search" (e.g., "Find certificates *similar* to this one").
*   **We need "Verification"** (e.g., "Is this *exact* certificate valid?").

**The AI's Role:**
1.  **AI looks at pixels.** (It creates temporary internal embeddings to understand "This is an 'A'").
2.  **AI extracts JSON.** (`{ Name: "Ravi" }`).
3.  **AI Forgets.** We discard the AI's internal state immediately.

## 3. The Flow
1.  **Student** holds the `Data` (PDF).
2.  **Verifier** asks the Student for the PDF.
3.  **Verifier** extracts `Data` -> makes `Hash`.
4.  **Verifier** checks `Hash` on **Polygon**.

**Nothing is saved on our server.** This is true Decentralization.
