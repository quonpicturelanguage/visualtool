if (typeof require === "function") {
    var QVT = require('./main.js').QVT
    var CircuitNode = require('./main.js').CircuitNode
} else {
    var QVT = exports.QVT
    var CircuitNode = exports.CircuitNode
}

let qvt = new QVT().init()
let ccc = new CircuitNode().init(0,0)

qvt.setInput(`
h
cx1,cx2
,cx3,cx4
,,cx5,cx6
,,,mx
,,mcy2,mcy1
`)

console.log(qvt.rawInput)
console.log(qvt.getFormatInput())

console.log(qvt.gateArray)

console.log(qvt.getNodes())


