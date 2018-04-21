const sharp = require('sharp');
const toConvert = './toConvert';
const getColors = require('get-image-colors')
const recursive = require("recursive-readdir");
const Excel = require('exceljs');
const dir = require('node-dir')

const temp = './temp';
const pops = './popsockets';
const fs = require('fs');
const window   = require('svgdom')
const SVG      = require('svg.js')(window);
const async = require('async');
const document = window.document;
const argv = require('yargs').argv



const colour = argv.bg ? argv.bg : '000';
const folder = argv.dir ? argv.dir : null;
const brand = argv.brand ? argv.brand : null;
const isWin = process.platform === "win32";

if(!folder) return console.log("Specify a folder.  Add --dir=\"C:\\Merch Designs\"");

 getFiles(folder)
 .then(files => {
   ignoreFiles(files, function(files){
     resizeImages(files)
   })
 })
 .catch(e => console.log(e))

function getFiles(folder){
  return new Promise((resolve, reject) => {
      dir.files(folder, function(e,f){
      resolve(f)
    })
  })
}

function ignoreFiles(files, cb){
  let finalFiles = [];
    for(i=0; i < files.length; i++){
      const slash = isWin ? files[i].substr(files[i].lastIndexOf("\\")+1) : files[i].substr(files[i].lastIndexOf(`/`)+1),
            name = slash.toLowerCase(),
            fExt = name.substr(name.length - 4),
            hoodie = name.includes('hoodie');
      if(fExt === '.png' && hoodie === false) finalFiles.push(files[i])
    }
    cb(finalFiles)
}

function drawCircle(){
  return new Promise((resolve, reject) => {
    const draw = SVG(document.documentElement);
    draw.circle(485,485).fill(`#${colour}`);
    resolve(draw.svg())
  })
}

function resizeImages(files){
    async.eachLimit(files, 10, (file, callback) => {
      const slash = isWin ? file.substr(file.lastIndexOf("\\")+1) : file.substr(file.lastIndexOf(`/`)+1);
      const final = slash.substr(0, slash.length-4);
      console.log(`Processing file ${final}`);
      sharp(file)
        .trim()
        .resize(350,350)
        .background({r: 0, g: 0, b: 0, alpha: 0})
        .embed()
        .toFile(`./temp/${final}.png`)
        .then(() => {
          console.log(`Finished processing ${final}`);
          callback()
        })
        .catch(err => {
          console.log(err)
          callback();
        })
    }, e => {
      getTempFiles('popsocket');
    })
}

function getTempFiles(type) {
  getFiles(type ===`popsocket` ? `./temp` : `./popsockets`)
  .then(files => {
    if(type==='popsocket') return createPopsocket(files);
    return createExcelDoc(files);
  })
}

function createPopsocket(files) {
  async.eachLimit(files, 10, (file, callback) => {
    const slash = isWin ? file.substr(file.lastIndexOf("\\")+1) : file.substr(file.lastIndexOf(`/`)+1);
    const final = slash.substr(0, slash.length-4);
    if(slash === ".gitignore") return callback();
    console.log(`Generating Popsocket for ${file}`);
    drawCircle()
      .then(function (resultSVG) {
        sharp(new Buffer(resultSVG))
          .overlayWith(`${file}`)
          .embed()
          .toFile(`./popsockets/${final}-popsocket.png`)
        })
        .then(() => {
          callback()
        })
        .catch(err => {
          callback()
        })
  }, e => {
    getTempFiles('excel');
  })
}

function createExcelDoc(files) {
  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet('Popsockets');
  sheet.columns = [
    { header: 'ASIN', key: 'asin', width: 0 },
    { header: 'Style Number', key: 'filename', width: 60 },
    { header: 'UPC', key: 'ups', width: 5},
    { header: 'MSRP', key: 'msrp', width: 5},
    { header: 'Brand', key: 'brand', width: 30},
    { header: 'Color or Style Name', key: 'title', width: 60},
    { header: 'Accordion / Platform', key: 'platform', width: 0},
    { header: 'Web Display Name', key: 'web', width: 0},
    { header: 'notes', key: 'notes', width: 0},
    { header: 'ASIN Number', key: 'asin_no', width: 0}
  ];

  async.eachLimit(files, 1, (file, callback) => {
    const final = isWin ? file.substr(file.lastIndexOf("\\")+1) : file.substr(file.lastIndexOf(`/`)+1);
    if(final === ".gitignore") return callback();
    sheet.addRow({
      asin: null,
      filename: final,
      upc: null,
      msrp: null,
      brand: brand,
      title: null,
      platform: null,
      web: null,
      notes: null,
      asin_no: null
    })
    callback()
  }, e => {
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'1b345b'}
    }
    sheet.getRow(1).font = {
      color: { argb: 'FFFFFF' },
    }
    workbook.xlsx.writeFile('popsockets.xlsx')
    .then(() => console.log('Popsocket File written'));
  })
}
