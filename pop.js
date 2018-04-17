const sharp = require('sharp');
const toConvert = './toConvert';
const getColors = require('get-image-colors')

const temp = './temp';
const pops = './popsockets';
const fs = require('fs');
const window   = require('svgdom')
const SVG      = require('svg.js')(window);
const async = require('async');
const document = window.document;
const argv = require('yargs').argv

let colour = argv.bg ? argv.bg : '000';

const ShapeUtil = {
    drawCircle: function (width, height) {
        return new Promise(function (resolve, reject) {
            var draw = SVG(document.documentElement);
            draw.circle(485,485).fill(`#${colour}`);
            resolve(draw.svg());
        });
    }
};

const files = fs.readdirSync(toConvert);
async.each(files, function(file, callback) {
    console.log('Processing file ' + file);
    if(file != '.DS_Store' || file != '.gitignore'){
          sharp(`${toConvert}/${file}`)
            .trim()
            .resize(350, 350)
            .background({r: 0, g: 0, b: 0, alpha: 0})
            .embed()
            .toFile(`./temp/${file}-pop.png`)
            .then(() => {
              console.log(`Finished processing ${file}`);
              callback()
            })
            .catch(err => callback())
    } else {
      callback()
    }
}, function(err) {
  const tempFiles = fs.readdirSync(temp);
  async.each(tempFiles, function(file, callback) {
    console.log(`Generating Popsocket for ${file}`);
    if(file != '.DS_Store' || file != '.gitignore'){
      ShapeUtil.drawCircle( 485,  485)
      .then(function (resultSVG) {
        sharp(new Buffer(resultSVG))
          .overlayWith(`${temp}/${file}`)
          .embed()
          .toFile(`./popsockets/${file}-pop-final.png`)
          .catch(err => {
            console.log(err)
          })
      })
    }
  }, function(e){
    if(err) console.log(err)
    else console.log('Finished')
  })
});


// fs.readdirSync(toConvert)
// .forEach(file => {
//   if(file != '.DS_Store'){
//     sharp(`${toConvert}/${file}`)
//       .trim()
//       .resize(350, 350)
//       .background({r: 0, g: 0, b: 0, alpha: 0})
//       .embed()
//       .toFile(`./temp/${file}-pop.png`)
//       .then(() => {
//         console.log(`Converted ${file}`)
//       })
//       .catch(err => {
//         console.log(err)
//       })
//     }
// })
