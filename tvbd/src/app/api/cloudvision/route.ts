import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { exec } from "child_process";
import fetch from "node-fetch"; // Import node-fetch for API calls

// 🔹 Replace with your actual Google API Key
const GOOGLE_FACT_CHECK_API_KEY = process.env.GOOGLE_FACT_CHECK_API_KEY || "";

// Define the expected response structure
interface ClaimReview {
    publisher: { name: string; site: string };
    title: string;
    url: string;
    reviewDate: string;
    textualRating: string;
}

interface FactCheckClaim {
    text: string;
    claimReview?: ClaimReview[];
}

interface FactCheckResponse {
    claims?: FactCheckClaim[];
}

// Function to check fact against Google Fact Check API
async function checkFact(text: string): Promise<FactCheckClaim[]> {
    try {
        // 🔹 Extract only the first 150 characters to improve search accuracy
        const shortenedText = text.split(".")[0].slice(0, 50);

        console.log("Fact Checking Query:", shortenedText); // Debugging log

        const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(shortenedText)}&key=${GOOGLE_FACT_CHECK_API_KEY}`;

        const response = await fetch(url);
        const data = (await response.json()) as FactCheckResponse;

        return data.claims || [];
    } catch (error) {
        console.error("Fact Check API Error:", error);
        return [];
    }
}


export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        console.log("Processing image upload...");

        // Save the uploaded image to /tmp/
        const uploadDir = "/tmp";
        await mkdir(uploadDir, { recursive: true });

        const fileName = `${randomUUID()}.png`;
        const filePath = path.join(uploadDir, fileName);
        const buffer = Buffer.from(await file.arrayBuffer());

        await writeFile(filePath, buffer);
        console.log("Image saved at:", filePath);

        // Run google-ocr.js as a child process
        const scriptPath = path.resolve(process.cwd(), "scripts", "google-ocr.js");
        const command = `node "${scriptPath}" "${filePath}"`;

        console.log("Running command:", command);

        return new Promise((resolve) => {
            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    console.error("OCR Error:", stderr);
                    return resolve(NextResponse.json({ error: "OCR process failed", details: stderr }, { status: 500 }));
                }

                console.log("Raw OCR Output:", stdout);

                try {
                    const result = JSON.parse(stdout.trim());
                    const extractedText = result.text || "";

                    // 🔹 Call Fact Check API
                    const factCheckResults = await checkFact(extractedText);
                    console.log("Fact Check API Response:", JSON.stringify(factCheckResults, null, 2));


                    return resolve(
                        NextResponse.json({
                            extractedText,
                            factCheckResults,
                        })
                    );
                } catch (parseError) {
                    console.error("Failed to parse OCR output:", stdout);
                    return resolve(NextResponse.json({ error: "Invalid OCR output", details: stdout }, { status: 500 }));
                }
            });
        });

    } catch (error) {
        console.error("API Error:", error);

        return NextResponse.json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
