
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

// PDF merging function
async function mergePDFs(pdfPaths, outputFilename) {
    const mergedPdf = await PDFDocument.create();
    
    for (const pdfPath of pdfPaths) {
        try {
            const pdfBytes = fs.readFileSync(pdfPath);
            const pdf = await PDFDocument.load(pdfBytes);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
            console.log(`📄 Added: ${path.basename(pdfPath)}`);
        } catch (error) {
            console.error(`❌ Error merging ${pdfPath}:`, error.message);
        };
    };
    
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputFilename, mergedPdfBytes);
    console.log(`✅ Merged PDF saved as: ${outputFilename}`);

};

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Array of HTML files to combine
    const htmlFiles = [
        "1.html",
        "2.html",
        "3.html",
        "4.html",
        "5.html",
        "6.html",
        "7.html",
        "8.html",
        "9.html",
        "10.html",
        "11.html",
        "12.html",
        "13.html",
        "14.html",
        "15.html",
        "16.html",
        "17.html",
        "18.html",
        "19.html",
    ];

    const tempPdfPaths = [];

    // Load each HTML file and extract its body content
    for (let i = 0; i < htmlFiles.length; i++) {

        const filePath = `file:///C:/projects/htmlToPdf/quizHtml/${htmlFiles[i]}`;
        // C:\projects\htmlToPdf
        console.log("filePath: ", filePath);

        // file:///C:/Users/rowan/Desktop/mat1503-2025-oct%20-html/1.html
        await page.goto(filePath, { waitUntil: "networkidle0" });

        await page.addStyleTag({
            content: `
                #responseform {
                    width: 100vw !important;
                    height: 100vh !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                    z-index: 9999 !important;
                    background: white !important;
                }
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    background: white !important;
                }
                html {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                }
            `
        });

        const htmlFileName = htmlFiles[i].split(".")[0];
        const pdfFileName = htmlFileName + ".pdf";
        const pdfFilePath = path.resolve(__dirname, "quizPdfs", pdfFileName);

        await page.pdf({
            path: pdfFilePath,
            format: "A4",
            printBackground: true,
            landscape: true,
            margin: {
                top: "0px",
                right: "0px",
                bottom: "0px",
                left: "0px",
            },
            // Add these to help with fitting
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            pageRanges: "1",
        });

        tempPdfPaths.push(pdfFilePath);
        console.log(`✅ Created: ${pdfFileName}`);

    };

    await browser.close();

    // Merge all PDFs into one
    console.log("🔄 Merging PDFs...");
    await mergePDFs(tempPdfPaths, "combined_final.pdf");

    console.log("✅ Combined PDF created successfully!");
    

})();
