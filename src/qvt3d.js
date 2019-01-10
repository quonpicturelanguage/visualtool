var isNodejs = typeof document === "undefined"
if (isNodejs) {
    var qvtMain = require('./main.js')
} else {
    var qvtMain = exports
}
var QVT = qvtMain.QVT

function QuonProjector() {

}

QuonProjector.prototype.init = function () {
    return this
}

/**
 * demo: a=QuonProjector.prototype.buildMatrix4FromString('[[1,1,1,1],[1,-1,1,-1],[,,100,1000],[,,,1e2]]')
 * @param {String} mat4Str 
 */
QuonProjector.prototype.buildMatrix4FromString = function (mat4Str) {
    let inputstr = mat4Str
        .replace(/\]\s*,\s*\[/g, '\n')
        .replace(/;/g, '\n')
        .replace(/\r?\n/g, '\n')
        .replace(/[^\d\n,\.\-eE]/g, '')
        .replace(/\n{2,}/g, '\n')
        .replace(/^\n/, '')
        .replace(/\n$/, '')
    let rawArray = inputstr.split('\n').map(v => v.split(',').map(v => parseFloat(v || '0')))
    let maxNumber = Math.max(4, Math.max.apply(null, rawArray.map(v => v.length)))
    //shape into matrix
    let numberArray = rawArray.map(v => v.concat(Array.from({ length: maxNumber - v.length }).map(v => 0)))
    return numberArray.concat([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]).slice(0, 4).map(v => v.slice(0, 4))
}

/**
 * demo: [1,1,1,1].map(QuonProjector.prototype.applyMatrix4('[[1,1,1,1],[1,-1,1,-1],[,,100,1000],[,,,1e2]]'))
 * @param {Number[][]|String} mat4 
 */
QuonProjector.prototype.applyMatrix4 = function (mat4) {
    if (typeof (mat4) === 'string') mat4 = this.buildMatrix4FromString(mat4);
    return (v, i, a) => mat4[i].map((iv, ii) => iv * (a[ii] || 0)).reduce((a, b) => a + b)
}

QuonProjector.prototype.array3to40 = function (number4) {
    let aa;
    return (v, i, a) => i === 0 ? ((aa = Array.from(a)), aa.push(number4), aa) : null
}

QuonProjector.prototype.array4to30 = function () {
    return (v, i, a) => i === 0 ? a.slice(0, -1) : i === 1 ? a[a.length - 1] : null
}

QuonProjector.prototype.outerProduct=function(){
    
}


let QounProjectorObject = new QuonProjector().init()

let QVTfromMain = QVT

function QVT3d() {
	QVTfromMain.call(this);
}

QVT3d.prototype = Object.create(QVTfromMain.prototype);
QVT3d.prototype.constructor = QVT3d;

QVT3d.prototype.getSVGViewBox = function (gateArray) {
    let boxSize = new this.PictureLine().calculateSVGPosition([gateArray[0].length + 0.2, gateArray.length + 2])
    return `0 0 ${boxSize[0]} ${boxSize[1]}`
}

QVT3d.prototype.backlineWidth = QVT3d.prototype.frontlineWidth + 2



let CircuitNodefromMain = QVT.prototype.CircuitNode

function CircuitNode3d() {
	CircuitNodefromMain.call(this);
	return this;
}

CircuitNode3d.prototype = Object.create(CircuitNodefromMain.prototype);
CircuitNode3d.prototype.constructor = CircuitNode3d;

CircuitNode3d.prototype.projector = QounProjectorObject

/**
 * calculation a n-d position
 * @param {Number} deep 
 * @param {Number} bitIndex 
 * @param {Number} positionIndex in 1~4
 */
CircuitNode3d.prototype.calculatePosition = function (deep, bitIndex, positionIndex) {
    let position = [bitIndex + 0.4, deep + 1, 0]
    switch (positionIndex) {
        case 1:
            break;
        case 2:
            position[2] += 0.2
            break;
        case 3:
            position[0] += 0.2
            position[2] += 0.2
            break;
        case 4:
            position[0] += 0.2
            break;
    }
    return position;
}


let PictureLinefromMain = QVT.prototype.PictureLine

function PictureLine3d() {
	CircuitNodefromMain.call(this);
	return this;
}

PictureLine3d.prototype = Object.create(PictureLinefromMain.prototype);
PictureLine3d.prototype.constructor = PictureLine3d;

PictureLine3d.prototype.projector = QounProjectorObject

/**
 * convert a position to 2-d position
 * @param {Number[]} position 
 */
PictureLine3d.prototype.calculateSVGPosition = function (position) {
    return position.map(v => 100 * v).map(this.projector.applyMatrix4('1,,0.3;,1,0.8')).filter((v, i) => i <= 1)
}

PictureLine3d.prototype.renderOrder = function () {
    return 100 + this.zIndex * 0.001 + this.combine(this.Charge[this.type](this.args)).map(this.projector.applyMatrix4('0,-0.7,0.71'))[0]
}




















QVT3d.prototype.CircuitNode=CircuitNode3d
QVT3d.prototype.PictureLine=PictureLine3d

exports.QVT = QVT3d