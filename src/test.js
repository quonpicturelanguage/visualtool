var isNodejs = typeof document === "undefined"
if (isNodejs) {
    // var qvtMain = require('./main.js')
    var qvtMain = require('./qvt3d.js')
} else {
    var qvtMain = exports
}
var QVT = qvtMain.QVT

let massertResult = [0, 0, []]
function massert(fun) {
    let a, b, text
    massertResult[1]++
    try {
        [a, b] = fun()
        if (String(a) !== String(b)) {
            text = `fail: ${a} != ${b} in\n${fun.toString()}\n`
            console.log(text)
            massertResult[2].push(text)
        } else {
            massertResult[0]++
            text = `${b}`
            console.log(text)
            massertResult[2].push(text)
        }
    } catch (error) {
        text = `fail: error happen in\n${fun.toString()}\n`
        console.log(text)
        massertResult[2].push(text)
    }

}
function massertPrint() {
    console.log(`\n\n==========\n`)
    massertResult[2].forEach(v => console.log(v + '\n'))
    console.log(`==========\n${massertResult[0]}/${massertResult[1]} pass`)
}
/////////////////////////////////////////////////
let cn = new new QVT().CircuitNode().init(2, 0)
////////////////////////
let pl = new new QVT().PictureLine()

pl.sourcePosition = [[2, 1], [0, 1], [1, 0]]
massert(() => [pl.combine([0.5, 0.2, 0.3]), [1.3, 0.7]])

pl.sourcePosition = [[2, 1, 1], [0, 1, 0], [0, 0, 1]]
massert(() => [pl.combine([0.5, 0.2, 0.3]), [1, 0.7, 0.8]])

////////////////////////

let qvt = new QVT().init()
qvt.getSVGCSS = function () {
    this.buildDymanicCSSObject()

    this.clickCSS.setCircultLine(3, { color: 'red', width: (this.frontlineWidth + this.backlineWidth) / 2, opacity: 0.3 })
    this.clickCSS.setCircultLine(1, { color: '#bd0086' })
    this.clickCSS.setCircultLine(2, { color: '#8d00cb' })

    return Object.getPrototypeOf(this).getSVGCSS.call(this) + this.renderDymanicCSS(false);
}


qvt.setInput(`
sx   ,sz ,sy  ,i    
,
cz1_1,cz2,cz5 ,cz6  
cz3  ,cz4,cz7 ,cz8  
h    ,h1 ,s   ,s1   
h3   ,h2 ,sd  ,sd1  
,cz9,cz10,my(i)
mz   ,mx ,mcy2,mcy1 
`)

// qvt.setInput(`
// sx,sx
// cz1,cz2
// h,
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
massertPrint()