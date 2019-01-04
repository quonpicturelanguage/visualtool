var isNodejs = typeof document === "undefined"
if (isNodejs) {
    var qvtMain = require('./main.js')
} else {
    var qvtMain = exports
}
var QVT = qvtMain.QVT
var CircuitNode = qvtMain.CircuitNode
var PictureLine = qvtMain.PictureLine



QVT.prototype.getSVGViewBox = function (gateArray) {
    let boxSize = new PictureLine().calculateSVGPosition([gateArray[0].length, gateArray.length + 2])
    return `0 0 ${boxSize[0]} ${boxSize[1]}`
}

/**
 * calculation a n-d position
 * @param {Number} deep 
 * @param {Number} bitIndex 
 * @param {Number} positionIndex in 1~4
 */
CircuitNode.prototype.calculatePosition = function (deep, bitIndex, positionIndex) {
    return [bitIndex + 0.25 + (positionIndex - 1) * 0.5 / 3, deep + 1];
}

/**
 * convert a position to 2-d position
 * @param {Number[]} position 
 */
PictureLine.prototype.calculateSVGPosition = function (position) {
    return position.map(v => 100 * v)
}
























exports.QVT = QVT
exports.CircuitNode = CircuitNode
exports.PictureLine = PictureLine