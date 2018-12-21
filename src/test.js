let isNodejs = typeof document === "undefined"
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
function massert(fun) {
    let a, b
    [a, b] = fun()
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
massert(() => [pl.combine([0.5, 0.2, 0.3]), [1.3, 0.7]])

pl.sourcePosition = [[2, 1, 1], [0, 1, 0], [0, 0, 1]]
massert(() => [pl.combine([0.5, 0.2, 0.3]), [1, 0.7, 0.8]])

////////////////////////

let qvt = new QVT().init()
qvt.getSVGCSS = function () {
    return Object.getPrototypeOf(qvt).getSVGCSS() + `
    .frontline.circultline3{
        stroke:red;stroke-width:${(qvt.frontlineWidth + qvt.backlineWidth) / 2};
    }
    .frontline.circultline16{
        stroke:#bd0086;
    }
    `
}


qvt.setInput(`
,
cz1_1,cz2,cz5 ,cz6 
cz3  ,cz4,cz7 ,cz8 
h    ,h1 ,s   ,s1  
h3   ,h2 ,sd  ,sd1 
     ,cz9,cz10,my 
mz   ,mx ,mcy2,mcy1
`)

// qvt.setInput(`
// ,
// cz1,cz2
// ,cz3  ,cz4
// cz5 , ,cz6
// ,
// `)

console.log(qvt.rawInput)
console.log(qvt.getFormatInput())

console.log(qvt.gateArray)

qvt.getNodes()
console.log(qvt.nodeNet)

massert(() => [qvt.nodeNet[qvt.util.di2s(4, 3)].innernalLink[1].targetIndex, 5])
massert(() => [qvt.nodeNet[qvt.util.di2s(4, 3)].innernalLink[2].targetIndex, 6])

massert(() => [qvt.nodeNet[qvt.util.di2s(2, 3)].position[4], [3.75, 3]])

qvt.getLines()
console.log(qvt.circuitLines)
console.log(qvt.pictureLines)

qvt.getSVGContentString()
qvt.getSVGFrame()


if (isNodejs) {
    console.log(qvt.SVGFrame)
} else {
    let node = document.createElement('div')
    node.innerHTML = qvt.SVGFrame
    document.body.appendChild(node)
    qvt.listen()
}

/////////////////////////////////////////////////
console.log(`\n\n\n${massertResult[0]}/${massertResult[1]} pass`)