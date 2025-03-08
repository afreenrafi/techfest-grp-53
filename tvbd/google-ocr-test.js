// Import Google Cloud Vision API
const vision = require("@google-cloud/vision");
const path = require("path");

// Get absolute path to credentials JSON file
const credentialsPath = path.resolve(__dirname, "google-credentials.json");

console.log("Using Credentials File:", credentialsPath);

// Create a Vision API client with explicit credentials
const client = new vision.ImageAnnotatorClient({
    keyFilename: credentialsPath, // Pass absolute path here
});

async function runOCR(imagePath) {
    try {
        // Get absolute path of the image
        const absoluteImagePath = path.resolve(imagePath);

        console.log("Processing Image:", absoluteImagePath);

        // Perform text detection on the image
        const [result] = await client.textDetection(absoluteImagePath);

        // Extract the text from the response
        const text = result.fullTextAnnotation?.text || "No text found";

        console.log("Extracted Text:\n", text);
    } catch (error) {
        console.error("Error during OCR:", error);
    }
}

// Run OCR on a test image
runOCR("./straitsTimes_Extract.png"); // Change this to your image file path
