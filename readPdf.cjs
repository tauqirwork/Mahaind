const fs = require('fs');
const pdf = require('pdf-parse');
let dataBuffer = fs.readFileSync('c:/Users/tauqi/Downloads/MOPL 25 26-27.pdf');
pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(console.error);
