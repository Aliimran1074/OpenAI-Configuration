const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const { pdfToImageBuffer } = require('../../PDFToImageToBlocks/pdfToImage');
const {createCanvas}= require('canvas')
// const { text } = require('pdfkit');

pdfjsLib.GlobalWorkerOptions.workerSrc= require.resolve("pdfjs-dist/legacy/build/pdf.worker.js")

const detectPdfFileType= async(pdfBuffer)=>{

    if (!pdfBuffer) {
    throw new Error("No file uploaded or buffer is empty");
  }
const loadingTask=  pdfjsLib.getDocument({data:pdfBuffer})

const pdfDoc= await loadingTask.promise

let textPages = []
let pageWithText=0

for(let i=1;i<=pdfDoc.numPages;i++){
    const page = await pdfDoc.getPage(i)
    const textContent = await page.getTextContent()
    const viewport= page.getViewport({scale:2})

    const headerY=viewport.height*0.9
    const footerY= viewport.height*0.1
    const bodyText=textContent.items.filter(item=>{
      const y = item.transform[5]
      return y < headerY &&  y >footerY
    })
    .map(item=>item.str)
    .join(" ")
    .trim()
    // const pageText = textContent.items.map(item=>item.str).join(" ").trim()
    textPages.push(bodyText)
    const wordCount =bodyText.split(/\s+/).length
    if(wordCount>10) pageWithText++
    // if(pageText.length>20) pageWithText++
}

let pdfType = "SCANNED"
if(pageWithText==pdfDoc.numPages) pdfType="TEXT"
else if(pageWithText>0) pdfType="MIXED"

if(pdfType=='TEXT'){
  return {type:pdfType,textPages}
}
else if(pdfType=='SCANNED'){
  const pdfImages = pdfToImageBuffer(pdfBuffer)
  return {type:pdfType,pdfImages}
}
else{
  const pdfPages = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 2 }); // high-quality image

    // Extract all text for this page
    const bodyText = textContent.items
      .map(item => item.str)
      .join(" ")
      .trim();

    // Render page to image
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");
    await page.render({ canvasContext: context, viewport }).promise;
    const imageBuffer = canvas.toBuffer("image/jpeg");
    const base64Image = imageBuffer.toString("base64");

    // Create page object
    const pageObject = { page: i, type: "mixed", image: base64Image };
    if (bodyText.length > 0) pageObject.text = bodyText;

    pdfPages.push(pageObject);
  }

  return { type: pdfType, pdfPages };
}
// return {type:pdfType,textPages}
}


module.exports={detectPdfFileType}