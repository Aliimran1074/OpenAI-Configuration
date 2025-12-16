const sharp = require('sharp')

const splitIntoBlocks = async(imageBuffer)=>{
    const image= sharp(imageBuffer)
    const meta = await image.metadata()
    const height= meta.height
    const width= meta.width
    const oneThird= Math.floor(height/3)

    return { 
        top:await image.extract({left:0,top:0,width:width,height:oneThird}).toBuffer(),
        middle:await image.extract({left:0,top:oneThird,width:width,height:oneThird}).toBuffer(),
        bottom:await image.extract({left:0,top:oneThird*2,width:width,height:oneThird}).toBuffer(),
    }

}
