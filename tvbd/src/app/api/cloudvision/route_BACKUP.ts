import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { exec } from "child_process";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        console.log("Processing image upload...");

        // Save image in /tmp/
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

        // Execute the script and return OCR result
        return new Promise((resolve) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("OCR Error:", stderr);
                    return resolve(NextResponse.json({ error: "OCR process failed", details: stderr }, { status: 500 }));
                }

                console.log("Raw OCR Output:", stdout); // Debugging log

                try {
                    const result = JSON.parse(stdout.trim()); // Now safe to parse
                    return resolve(NextResponse.json(result));
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
