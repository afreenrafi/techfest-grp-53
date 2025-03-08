const vision = require("@google-cloud/vision");
const path = require("path");

// Get absolute path to credentials JSON file
const credentialsPath = path.resolve(__dirname, "../google-credentials.json");

// Create a Vision API client
const client = new vision.ImageAnnotatorClient({ keyFilename: credentialsPath });

async function runOCR(imagePath) {
    try {
        const absoluteImagePath = path.resolve(imagePath);

        // Perform OCR
        const [result] = await client.textDetection(absoluteImagePath);
        const text = result.fullTextAnnotation?.text || "No text found";

        // ✅ Only output JSON (important)
        console.log(JSON.stringify({ text }));

    } catch (error) {
        // ✅ Only output JSON for errors
        console.error(JSON.stringify({ error: error.message }));
    }
}

// Get the image path from command-line arguments
const imagePath = process.argv[2];

if (!imagePath) {
    console.error(JSON.stringify({ error: "No image path provided." }));
    process.exit(1);
}

// Run OCR with the provided image path
runOCR(imagePath);
