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
    //shape into 4*4
    return numberArray.concat([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]).slice(0, 4).map(v => v.slice(0, 4))
}

/**
 * demo: [1,1,1,1].map(QuonProjector.prototype.applyMatrix4('[[1,1,1,1],[1,-1,1,-1],[,,100,1000],[,,,1e2]]'))
 * @param {Number[][]|String} mat4 
 */
QuonProjector.prototype.applyMatrix4 = function (mat4) {
    if (typeof (mat4) === 'string') mat4 = this.buildMatrix4FromString(mat4);
    return (v, i, a) => mat4[i].map((iv, ii) => iv * (a[ii] != null ? a[ii] : ii !== 3 ? 0 : 1)).reduce((a, b) => a + b)
}

QuonProjector.prototype.array3to40 = function (number4) {
    let aa;
    return (v, i, a) => i === 0 ? ((aa = Array.from(a)), aa.push(number4), aa) : null
}

QuonProjector.prototype.array4to30 = function () {
    return (v, i, a) => i === 0 ? a.slice(0, -1) : i === 1 ? a[a.length - 1] : null
}

/**
 * demo: [1,1,1,-1].map(QuonProjector.prototype.innerProduct0([1,2,3,4]))[0]
 * @param {Number[]} a2 
 */
QuonProjector.prototype.innerProduct0 = function (a2) {
    return (v, i, a1) => i === 0 ? a1.map((v, i) => v * a2[i]).reduce((a, b) => a + b) : null
}

/**
 * demo: [1,0,0].map(QuonProjector.prototype.outerProduct([0,1,0]))
 * @param {Number[]} a2 
 */
QuonProjector.prototype.outerProduct = function (a2) {
    return (v, i, a1) => {
        let ii = { '0': [1, 2], '1': [2, 0], '2': [0, 1] }[i]
        return a1[ii[0]] * a2[ii[1]] - a1[ii[1]] * a2[ii[0]]
    }
}

/**
 * demo: [3,4,0].map(QuonProjector.prototype.scale0())[0]
 */
QuonProjector.prototype.scale0 = function () {
    return (v, i, a) => i === 0 ? Math.sqrt(a.slice(0, 3).map(v => v * v).reduce((a, b) => a + b)) : null
}

/**
 * demo: [3,4,0].map(QuonProjector.prototype.normalize0())[0]
 */
QuonProjector.prototype.normalize0 = function () {
    let self = this
    return (v, i, a) => {
        if (i !== 0) return null;
        let scale = a.map(self.scale0())[0]
        if (scale < 0.000000001) return a.map((v, i) => i === 3 ? 1 : 0);
        return a.map((v, i) => i === 3 ? 1 : v / scale);
    }
}

/**
 * demo: QuonProjector.prototype.buildRotateMatrix4([0,0,1],0,1)
 * @param {Number[]} v3 direction vector
 * @param {Number} c cos(theta)
 * @param {Number} s sin(theta)
 */
QuonProjector.prototype.buildRotateMatrix4 = function (v3, c, s) {
    let u, v, w
    [u, v, w] = v3.map(this.normalize0())[0].slice(0, 3)
    return [
        [u * u + (1 - u * u) * c, u * v * (1 - c) - w * s, u * w * (1 - c) + v * s, 0],
        [u * v * (1 - c) + w * s, v * v + (1 - v * v) * c, v * w * (1 - c) - u * s, 0],
        [u * w * (1 - c) - v * s, v * w * (1 - c) + u * s, w * w + (1 - w * w) * c, 0],
        [0, 0, 0, 1]
    ]
}

QuonProjector.prototype.buildMatrix4ConvertingPVToPV0 = function (p1, p2, v1, v2, theta) {
    let m1 = [
        [1, 0, 0, -p1[0]],
        [0, 1, 0, -p1[1]],
        [0, 0, 1, -p1[2]],
        [0, 0, 0, 1],
    ]
    v1 = v1.map(this.normalize0())[0]
    v2 = v2.map(this.normalize0())[0]
    let v = v1.map(this.outerProduct(v2))
    let s = v.map(this.scale0())[0]
    let c = v1.map(this.innerProduct0(v2))[0]
    let m2 = this.buildRotateMatrix4(v, c, s)
    let m21 = this.buildRotateMatrix4(v2, Math.cos(-(theta || 0) / 180 * Math.PI), Math.sin(-(theta || 0) / 180 * Math.PI))
    let m3 = [
        [1, 0, 0, p2[0]],
        [0, 1, 0, p2[1]],
        [0, 0, 1, p2[2]],
        [0, 0, 0, 1],
    ]
    let self = this
    return (v, i, a) => i === 0 ? a.map(self.array3to40(1))[0].map(self.applyMatrix4(m1)).map(self.applyMatrix4(m2)).map(self.applyMatrix4(m21)).map(self.applyMatrix4(m3)).map(self.array4to30())[0] : null
}

QuonProjector.prototype.buildViewMap = function (theta, phi, rho) {
    phi = 180 - phi // I build left hand axis by mistake, so I fix by this way
    var v0 = [Math.sin(theta * Math.PI / 180) * Math.sin(phi * Math.PI / 180), Math.cos(theta * Math.PI / 180), Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180)]
    var x0 = v0.map(this.outerProduct([0, 1, 0])).map(this.normalize0())[0]
    var y0 = x0.map(this.outerProduct(v0)).map(this.normalize0())[0]
    var rotate = [
        [Math.cos(rho * Math.PI / 180), Math.sin(rho * Math.PI / 180), 0, 0],
        [-Math.sin(rho * Math.PI / 180), Math.cos(rho * Math.PI / 180), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ]

    var zmap0 = (v, i, a) => i === 0 ? -a.map(this.innerProduct0(v0))[0] : null
    var xymap0 = (v, i, a) => i === 0 ? [a.map(this.innerProduct0(x0))[0], a.map(this.innerProduct0(y0))[0]].map(this.applyMatrix4(rotate)) : null

    this.zmap0 = zmap0
    this.xymap0 = xymap0
}

let QounProjectorObject = new QuonProjector().init()
QounProjectorObject.buildViewMap(54.4, 20, 0)

let QVTfromMain = QVT

function QVT3d() {
    QVTfromMain.call(this);
}

QVT3d.prototype = Object.create(QVTfromMain.prototype);
QVT3d.prototype.constructor = QVT3d;

QVT3d.prototype.projector = QounProjectorObject

QVT3d.prototype.getSVGViewBox = function (gateArray) {
    let getp = v => new this.CircuitNode().calculatePosition(v)
    let getrp = v => new this.PictureLine().calculateSVGPosition(v)
    let info = {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity,
    }
    Array.from({ length: gateArray[0].length + 2 }).forEach((_, bitIndex) => {
        [0, gateArray.length].forEach(deep => {
            [1, 2, 3, 4].forEach(positionIndex => {
                let x, y;
                [x, y] = new this.PictureLine().calculateSVGPosition(new this.CircuitNode().calculatePosition(deep, bitIndex - 1, positionIndex))
                info.minX = Math.min(info.minX, x)
                info.maxX = Math.max(info.maxX, x)
                info.minY = Math.min(info.minY, y)
                info.maxY = Math.max(info.maxY, y)
            })
        })
    });
    return `${info.minX} ${info.minY} ${info.maxX - info.minX} ${info.maxY - info.minY}`
    return `-1000 -1000 2000 2000`
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

CircuitNode3d.prototype.LineArgument = {
    parallelPositive: 0.35,
    parallelNegativeNormal: 0.15,
    parallelNegativeSmall: 0.1,
    parallelNegativeBig: 0.1,
}

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
    // return position.map(v => 100 * v).map(this.projector.applyMatrix4('1,,-0.3;,1,0.8')).filter((v, i) => i <= 1)
    return position.map(v => 100 * v).map(this.projector.xymap0)[0]
}

PictureLine3d.prototype.renderOrder = function () {
    // return 100 + this.zIndex * 0.001 + this.combine(this.Charge[this.type](this.args)).map(this.projector.applyMatrix4('0,-0.7,0.71'))[0]
    return 100 + this.zIndex * 0.001 + this.combine(this.Charge[this.type](this.args)).map(this.projector.zmap0)[0]
}




















QVT3d.prototype.CircuitNode = CircuitNode3d
QVT3d.prototype.PictureLine = PictureLine3d

exports.QVT = QVT
exports.QVT3d = QVT3d