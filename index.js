const sharp = require('sharp');
const toConvert = './toConvert';
const converted = './converted'
const fs = require('fs');

fs.readdirSync(toConvert)
.forEach(file => {
  sharp(`${toConvert}/${file}`)
    .trim()
    .toFile(`./converted/${file}-hoodie.png`)
    .catch(err => {
      console.log(err)
    })
})

//
// fs.readdirSync(toConvert)
// .forEach(file => {
//   sharp(`${toConvert}/${file}`)
//     .trim()
//     .overlayWith('distress.png', { cutout: true } )
//     .resize(4500, 4050)
//     .background({r: 0, g: 0, b: 0, alpha: 0})
//     .embed()
//     .toFile(`./converted/${file}-hoodie.png`)
//     .catch(err => {
//       console.log(err)
//     })
// })
