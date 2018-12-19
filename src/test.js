if (typeof require === "function") {
    var QVT = require('./main.js').QVT
    var CircuitNode = require('./main.js').CircuitNode
} else {
    var QVT = exports.QVT
    var CircuitNode = exports.CircuitNode
}

function massert(a, b) {
    if (String(a) !== String(b)) {
        console.log(`fail: ${a} = ${b}`)
    } else {
        console.log(b)
    }
}

let qvt = new QVT().init()
let ccc = new CircuitNode().init(0, 0)

qvt.setInput(`
h
cz1,cz2
,cz3,cz4
,,cz5,cz6
,,,mx
,,mcy2,mcy1
`)

console.log(qvt.rawInput)
console.log(qvt.getFormatInput())

console.log(qvt.gateArray)

qvt.getNodes()
console.log(qvt.nodeNet)
console.log(qvt.nodeLink)

massert(qvt.nodeNet[qvt.util.di2s(4,3)].innernalLink[1].targetIndex, 4)
massert(qvt.nodeNet[qvt.util.di2s(4,3)].innernalLink[2].targetIndex, 3)

qvt.buildNodePosition()

massert(qvt.nodeNet[qvt.util.di2s(2,3)].position[4], [3.75, 3])

qvt.getLines()
console.log(qvt.circuitLines)
console.log(qvt.pictureLines)