
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
    const htmlFiles = [];

    for (let i = 1; i <= 14; i++) {
        htmlFiles.push(`${i}.html`);
    };

    const tempPdfPaths = [];

    // Load each HTML file and extract its body content
    for (let i = 0; i < htmlFiles.length; i++) {

        const filePath = `file:///C:/projects/htmlToPdf/quizHtml/${htmlFiles[i]}`;
        // C:\projects\htmlToPdf
        console.log("filePath: ", filePath);

        // file:///C:/Users/rowan/Desktop/mat1503-2025-oct%20-html/1.html
        await page.goto(filePath, { waitUntil: "networkidle0" });

        // This element will take up the entire page of the pdf
        const focusElementId = "region-main";

        // Remove all elements except #region-main
        await page.evaluate((focusElementId) => {
            const focusedElement = document.getElementById(focusElementId);
            if (focusedElement) {
                document.body.innerHTML = "";
                document.body.appendChild(focusedElement);
            };
        }, focusElementId);

        await page.addStyleTag({
            content: `
                #${focusElementId} {
                    width: 100vw !important;
                    height: auto !important;
                    position: relative !important;
                    top: 0 !important;
                    left: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                    z-index: 9999 !important;
                    background: white !important;
                }
                body {
                    height: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                    background: white !important;
                }
                html {
                    height: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                }
            `
        });

        // Measure the body size in pixels
        const pageSizePixels = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;

            const width = Math.max(
                body.scrollWidth, html.scrollWidth,
                body.offsetWidth, html.offsetWidth,
                body.clientWidth, html.clientWidth
            );

            const height = Math.max(
                body.scrollHeight, html.scrollHeight,
                body.offsetHeight, html.offsetHeight,
                body.clientHeight, html.clientHeight
            );

            return { width, height };
        });

        const pageWidthPixels = pageSizePixels.width;
        const pageHeightPixels = pageSizePixels.height;

        const htmlFileName = htmlFiles[i].split(".")[0];
        const pdfFileName = htmlFileName + ".pdf";
        const pdfFilePath = path.resolve(__dirname, "quizPdfs", pdfFileName);

        console.log("pageHeightPixels: ", pageHeightPixels);

        await page.pdf({
            path: pdfFilePath,
            width: "1400px",
            height: `${pageHeightPixels}px`,
            printBackground: true,
            landscape: false,
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
