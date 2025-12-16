// const {getDocument} = require('pdfjs-dist/legacy/build/pdf.js')
// const {createCanvas}= require('canvas')

// const pdfToImageBuffer = async(pdfBuffer)=>{
//     const loadingTask= getDocument({data:pdfBuffer})
//     const pdfDoc=await loadingTask.promise
//     const numPages= pdfDoc.numPages 
//     const images = []

//     for(let i=1;i<=numPages;i++){
//         const page = await pdfDoc.getPage(i)
//         const viewport= page.getViewport({scale:2})
//         const canvas= createCanvas(viewport.width,viewport.height)
//         const context = canvas.getContext("2d")

//         await page.render({canvasContext:context,viewport}).promise
//         const pageBuffer= canvas.toBuffer('image/jpeg')
//         images.push(pageBuffer)
//     }

//     return images
// }

// module.exports= {pdfToImageBuffer}

const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const path = require("path");
const { createCanvas } = require("canvas");

/**
 * 🚨 VERY IMPORTANT FOR VERCEL
 * Manually point pdfjs to worker file
 */
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  "pdfjs-dist/legacy/build/pdf.worker.js"
);

const pdfToImageBuffer = async (pdfBuffer) => {
  const loadingTask = pdfjsLib.getDocument({
    data: pdfBuffer,
    disableWorker: false // 🔥 worker allowed but manually provided
  });

  const pdfDoc = await loadingTask.promise;
  const images = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context,
      viewport
    }).promise;

    images.push(canvas.toBuffer("image/jpeg"));
  }

  return images;
};

module.exports = { pdfToImageBuffer };
