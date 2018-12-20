let isNodejs = typeof require === "function"
if (isNodejs) {
    var QVT = require('./main.js').QVT
    var CircuitNode = require('./main.js').CircuitNode
    var PictureLine = require('./main.js').PictureLine
} else {
    var QVT = exports.QVT
    var CircuitNode = exports.CircuitNode
    var PictureLine = exports.PictureLine
}

let massertResult = [0, 0]
function massert(a, b) {
    massertResult[1]++
    if (String(a) !== String(b)) {
        console.log(`fail: ${a} != ${b}`)
    } else {
        massertResult[0]++
        console.log(b)
    }
}
/////////////////////////////////////////////////
let cn = new CircuitNode().init(2, 0)
////////////////////////
let pl = new PictureLine()

pl.sourcePosition = [[2, 1], [0, 1], [1, 0]]
massert(pl.combine([0.5, 0.2, 0.3]), [1.3, 0.7])

pl.sourcePosition = [[2, 1, 1], [0, 1, 0], [0, 0, 1]]
massert(pl.combine([0.5, 0.2, 0.3]), [1, 0.7, 0.8])

////////////////////////

let qvt = new QVT().init()
qvt.setInput(`
h
cz1,cz2
,cz3,cz4
,,cz5,cz6
,,,mx
,,mcy2,mcy1
`)

//fshow
qvt.setInput(`
,
cz1_1,cz2,cz5 ,cz6 
cz3  ,cz4,cz7 ,cz8 
h3   ,h2  ,s1  ,sd1 
h    ,h1 ,h   ,h1  
     ,cz9,cz10,    
s    ,sd ,    ,mx  
my1  ,mz ,mcy2,mcy1
`)

console.log(qvt.rawInput)
console.log(qvt.getFormatInput())

console.log(qvt.gateArray)

qvt.getNodes()
console.log(qvt.nodeNet)
console.log(qvt.nodeLink)

massert(qvt.nodeNet[qvt.util.di2s(4, 3)].innernalLink[1].targetIndex, 4)
massert(qvt.nodeNet[qvt.util.di2s(4, 3)].innernalLink[2].targetIndex, 3)

qvt.buildNodePosition()

massert(qvt.nodeNet[qvt.util.di2s(2, 3)].position[4], [3.75, 3])

qvt.getLines()
console.log(qvt.circuitLines)
console.log(qvt.pictureLines)

////
if (isNodejs) {
    console.log(qvt.getPicture())
} else {
    let node=document.createElement('div')
    node.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qvt.gateArray[0].length*100} ${[qvt.gateArray.length+2]*100}">\n${qvt.getPicture()}</svg>`
    document.body.appendChild(node)
}

/////////////////////////////////////////////////
console.log(`\n\n\n${massertResult[0]}/${massertResult[1]} pass`)