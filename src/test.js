if (typeof require === "undefined") {
    let QVT = exports.QVT
} else {
    let QVT = require('./main.js').QVT
}

let qvt = new QVT()

qvt.setInput(`
h
cx1,cx2
,cx3,cx4
,,cx5,cx6
,,,mx
,,mcy2,mcy1
`)

console.log(qvt.rawInput)
console.log(qvt.formatInput())

console.log(qvt.bitNumber)
console.log(qvt.gateArray)



