
/**
 * @constructor
 */
function QVT() {

}

/**
 * 
 * @param {String} rawInput 
 * @returns {String[][]}
 */
QVT.prototype.setInput = function (rawInput) {
    this.rawInput = rawInput
    let inputstr = rawInput
        .toLowerCase()
        .replace(/-/g, '_')
        .replace(/\r?\n/g, '\n')
        .replace(/[^\S\n]/g, '')
        .replace(/\n{2,}/g, '\n')
        .replace(/^\n/, '')
        .replace(/\n$/, '')
    if (!inputstr) this.error('empty input');
    let rawArray = inputstr.split('\n').map(v => v.split(','))
    let bitNumber = Math.max.apply(null, rawArray.map(v => v.length))
    this.bitNumber = bitNumber
    //shape into matrix
    let gateArray = rawArray.map(v => v.concat(Array.from({ length: bitNumber - v.length }).map(v => '')))
    this.gateArray = gateArray
    return gateArray
}

QVT.prototype.formatInput = function () {
    let qiMaxStringLength = this.gateArray[0].map((v, i) =>
        Math.max.apply(null, this.gateArray.map(v => v[i].length))
    )
    let formatedString = this.gateArray.map(v =>
        v.map((v, i) =>
            v + Array.from({ length: qiMaxStringLength[i] - v.length + 1 }).join(' ')
        ).join(',')
    ).join('\n')
    return formatedString
}

QVT.prototype.error = function (any) {
    throw Error(any)
}


if (typeof exports === "undefined") exports = {};
exports.QVT = QVT