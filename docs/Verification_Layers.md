# The Double Shield: Why this system is secure

You raised a brilliant point: *If we only hash the data, can't someone just make a fake-looking PDF with the correct data?*

The answer lies in our **Two-Layer Defense**.

## Layer 1: The AI Guard (Visual Truth)
**Role**: Detect "Photoshop" Fakes.

Before we even extract data, the AI analyzes the *pixels*.
*   **Scenario A (Valid Scan)**: You take a photo of your degree.
    *   AI sees: "Warped paper", "Lighting shadows".
    *   AI Logic: "This looks like a physical photo of a real document. PASS."
*   **Scenario B (Photoshop Fake)**: You take a PDF and paste a new name "John" over "Ravi".
    *   AI sees: "Font for 'John' is Arial, but rest is Times New Roman", "Pixelation around the name area".
    *   AI Logic: "This is a forged image. **FAIL**."

**The AI stops visual fakes BEFORE they get to the blockchain.**

## Layer 2: The Blockchain Guard (Factual Truth)
**Role**: Detect "Lies".

If the image looks real (Layer 1 Passed), we extract the data and check the Blockchain.
*   **Scenario A (Real Data)**: Data = `{Name: Ravi, Degree: B.Tech}`.
    *   Blockchain: "Yes, University signed this hash. VERIFIED."
*   **Scenario B (Tampered Data)**: You photoshopped "B.A." to "B.Tech" perfectly (fooled the AI).
    *   Extracted Data = `{Name: Ravi, Degree: B.Tech}`.
    *   Blockchain: "No. I only have a record for Ravi with 'B.A.'. **FAIL**."

## Summary Table

| What the User Does | AI Check (Visual) | Blockchain Check (Data) | Result |
| :--- | :--- | :--- | :--- |
| **Upload Original PDF** | ✅ Clean | ✅ Match | **VERIFIED** |
| **Upload Photo/Scan** | ✅ Looks like a scan | ✅ Match | **VERIFIED** (We want this!) |
| **Bad Photoshop** | ❌ "Font Mismatch" | (Skipped) | **REJECTED** |
| **Perfect Photoshop** | ✅ (Fooled AI) | ❌ Hash Mismatch | **REJECTED** |

**Conclusion**: By combining both, we allow *Format Flexibility* (PDF/JPG/Scan) but strictly enforce *Content Integrity*.
