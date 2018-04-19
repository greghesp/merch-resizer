const sharp = require('sharp');
const toConvert = './toConvert';
const getColors = require('get-image-colors')
const compC = require('complementary-colors');
const rgbHex = require('rgb-hex');

const temp = './temp';
const pops = './popsockets';
const fs = require('fs');
const window   = require('svgdom')
const SVG      = require('svg.js')(window);
const async = require('async');
const document = window.document;
const argv = require('yargs').argv


const files = fs.readdirSync(toConvert);
async.each(files, function(file, callback) {
  if(file != '.DS_Store' || file != '.gitignore'){
    getColors(`${toConvert}/${file}`, 'image/png')
    .then(colors => {
      const main = new compC(colors[1].hex());
      const split = main.complementary();
      const color = rgbHex(`${split[1].r},${split[1].g},${split[1].b}`)

      const ShapeUtil = {
          drawCircle: function (width, height) {
              return new Promise(function (resolve, reject) {
                  var draw = SVG(document.documentElement);
                  draw.circle(485,485).fill(`#${color}`);
                  resolve(draw.svg());
              });
          }
      };

      sharp(`${toConvert}/${file}`)
        .trim()
        .resize(350, 350)
        .background({r: 0, g: 0, b: 0, alpha: 0})
        .embed()
        .toFile(`./temp/${file}-pop.png`)
        .then(() => {

          ShapeUtil.drawCircle( 485,  485)
          .then(function (resultSVG) {
            sharp(new Buffer(resultSVG))
              .overlayWith(`${temp}/${file}-pop.png`)
              .embed()
              .toFile(`./popsockets/${file}-pop-final.png`)
              .then(r => callback())
              .catch(err => {
                console.log(err)
              })
          })
        })
        .catch(err => callback())
    })
    .catch(e => )
  }
}, function(err) {
  if(err) {console.log(err)}
});
