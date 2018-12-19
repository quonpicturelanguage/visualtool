if (typeof require === "function") {
    var QVT = require('./main.js').QVT
    var CircuitNode = require('./main.js').CircuitNode
} else {
    var QVT = exports.QVT
    var CircuitNode = exports.CircuitNode
}

function massert(a,b){
    if(String(a)!==String(b)){
        console.log(`fail: ${a} = ${b}`)
    } else {
        console.log(b)
    }
}

let qvt = new QVT().init()
let ccc = new CircuitNode().init(0,0)

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

let nodeInfo=qvt.getNodes()
console.log(nodeInfo)

massert(nodeInfo[0]['4,3'].innernalMap[1].targetIndex,4)
massert(nodeInfo[0]['4,3'].innernalMap[2].targetIndex,3)

