const sharp = require('sharp');
const toConvert = './toConvert';
const getColors = require('get-image-colors')
const recursive = require("recursive-readdir");


const temp = './temp';
const pops = './popsockets';
const fs = require('fs');
const window   = require('svgdom')
const SVG      = require('svg.js')(window);
const async = require('async');
const document = window.document;
const argv = require('yargs').argv

let colour = argv.bg ? argv.bg : '000';
let folder = argv.dir ? argv.dir : null;

if(!folder) return console.log("Specify a folder.  Add --dir=\"C:\\Merch Designs\"");
console.log(folder)

recursive(folder, function(err, files) {
    if (err) throw err;

    const ShapeUtil = {
        drawCircle: function (width, height) {
            return new Promise(function (resolve, reject) {
                var draw = SVG(document.documentElement);
                draw.circle(485,485).fill(`#${colour}`);
                resolve(draw.svg());
            });
        }
    };

    //const files = fs.readdirSync(toConvert);
    async.eachLimit(files, 5, function(file, callback) {
        if(file.endsWith(".png") && !file.includes("hoodie") && !file.includes("Hoodie")){

          const slash = file.substr(file.lastIndexOf("\\")+1);
          const final = slash.substr(0, slash.length-4);
          console.log('Processing file ' + final);
              sharp(`${file}`)
                .trim()
                .resize(350, 350)
                .background({r: 0, g: 0, b: 0, alpha: 0})
                .embed()
                .toFile(`./temp/${final}-temp.png`)
                .then(() => {
                  console.log(`Finished processing ${final}`);
                  callback()
                })
                .catch(err => {
                  console.log(err)
                  callback()
                })
        } else {
          callback()
        }
    }, function(err) {
      const tempFiles = fs.readdirSync(temp);
      async.each(tempFiles, function(file, callback) {
        if(file.endsWith(".png")){
          console.log(`Generating Popsocket for ${file}`);
          const final = file.substr(0, file.length-4);
          ShapeUtil.drawCircle( 485,  485)
          .then(function (resultSVG) {
            sharp(new Buffer(resultSVG))
              .overlayWith(`${temp}/${file}`)
              .embed()
              .toFile(`./popsockets/${final}-popsocket.png`)
              .then(() => {
                callback()
              })
              .catch(err => {
                callback()
              })
          })
        }
      }, function(e){

      })
    });

});


//
// const ShapeUtil = {
//     drawCircle: function (width, height) {
//         return new Promise(function (resolve, reject) {
//             var draw = SVG(document.documentElement);
//             draw.circle(485,485).fill(`#${colour}`);
//             resolve(draw.svg());
//         });
//     }
// };
//
// const files = fs.readdirSync(toConvert);
// async.each(files, function(file, callback) {
//     console.log('Processing file ' + file);
//     if(file != '.DS_Store' || file != '.gitignore'){
//           sharp(`${toConvert}/${file}`)
//             .trim()
//             .resize(350, 350)
//             .background({r: 0, g: 0, b: 0, alpha: 0})
//             .embed()
//             .toFile(`./temp/${file}-pop.png`)
//             .then(() => {
//               console.log(`Finished processing ${file}`);
//               callback()
//             })
//             .catch(err => callback())
//     } else {
//       callback()
//     }
// }, function(err) {
//   const tempFiles = fs.readdirSync(temp);
//   async.each(tempFiles, function(file, callback) {
//     console.log(`Generating Popsocket for ${file}`);
//     if(file != '.DS_Store' || file != '.gitignore'){
//       ShapeUtil.drawCircle( 485,  485)
//       .then(function (resultSVG) {
//         sharp(new Buffer(resultSVG))
//           .overlayWith(`${temp}/${file}`)
//           .embed()
//           .toFile(`./popsockets/${file}-pop-final.png`)
//           .catch(err => {
//             console.log(err)
//           })
//       })
//     }
//   }, function(e){
//     if(err) console.log(err)
//     else console.log('Finished')
//   })
// });
