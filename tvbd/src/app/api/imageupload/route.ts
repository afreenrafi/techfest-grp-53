import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Convert the file to a Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define file path
        const filePath = path.join(process.cwd(), "public/textVerificationUploads", file.name);
        await writeFile(filePath, buffer);

        return NextResponse.json({ message: "File uploaded successfully!", url: `/textVerificationUploads/${file.name}` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
