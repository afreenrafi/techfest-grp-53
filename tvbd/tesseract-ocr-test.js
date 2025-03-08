const Tesseract = require("tesseract.js");

Tesseract.recognize("./straitsTimes_Extract.png", "eng")
    .then(({ data: { text } }) => {
        console.log("Extracted text:", text);
    })
    .catch(err => console.error("Tesseract Error:", err));
