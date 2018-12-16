
/**
 * @constructor
 */
function QuonUtils(){

}

/**
 * the process of render regexp
 */
QuonUtils.prototype.init = function(){
    Object.keys(this.GateSourcePattern).forEach(v => {
        this.GatePattern[v] = this.regexReplace(this.GateList[v], this.GateSourcePattern[v])
    })
    return this
}

/**
 * each type contains gates
 */
QuonUtils.prototype.GateList = {
    'Measure': ['mz', 'mx', 'my'],
    'ControlGate': ['cnot', 'cx', 'cy', 'cz'],
    'MeausreControlGate': ['mcx', 'mcy', 'mcz'],
    'TwoBitGate': ['cnot', 'cx', 'cy', 'cz', 'mcx', 'mcy', 'mcz'],
    'OneArgSingleBitGate': ['i', 'x', 'y', 'z', 'h', 's', 'sd', 't', 'td'],
    'TwoArgSingleBitGate': ['rx', 'ry', 'rz'],
    'SingleBitGate': ['i', 'x', 'y', 'z', 'h', 's', 'sd', 't', 'td', 'rx', 'ry', 'rz'],
}

/**
 * TBD will be replaced by the gate list splited with '|'
 * PINT(positive integer) and NUMBER will be replaced by their regexp pattern
 */
QuonUtils.prototype.GateSourcePattern = {
    'Measure': /^(TBD)(NUMBER)?$/,
    'ControlGate': /^(TBD)(PINT)(?:_(NUMBER))?$/,
    'MeausreControlGate': /^(TBD)(PINT)(?:_(NUMBER))?$/,
    'TwoBitGate': /^(TBD)(PINT)(?:_NUMBER)?$/,
    'OneArgSingleBitGate': /^(TBD)(NUMBER)?$/,
    'TwoArgSingleBitGate': /^(TBD)(PINT)(?:_(NUMBER))?$/,
    'SingleBitGate': /^(TBD)(?:NUMBER|(?:PINT)(?:_NUMBER)?)$/,
}

/**
 * fill the template regexp with the right content 
 * @param {String[]} gatelist 
 * @param {RegExp} regex 
 */
QuonUtils.prototype.regexReplace = function (gatelist, regex) {
    return new RegExp(regex.source
        .replace(/TBD/g, gatelist.join('|').toLowerCase())
        .replace(/PINT/g, /[1-9]\d*/.source)
        .replace(/NUMBER/g, /[+-]?[\d]*(?:\.[\d]*)?(?:e[+-]?[0-9]{0,2})?/.source)

    )
}

/**
 * @property {[x:String]: RegExp}
 */
QuonUtils.prototype.GatePattern = {}

/**
 * parse a string to number or numm to 0
 * @param {String|*} str 
 */
QuonUtils.prototype.parseNUMBER = function (str) {
    return parseFloat(str || '0')
}

/**
 * check whether two gate are in a pair
 * @param {*} match 
 * @param {String} nodestr2 
 */
QuonUtils.prototype.twoBitGatePairCheck = function (match, nodestr2) {
    let match2 = this.GatePattern['TwoBitGate'].exec(nodestr2)
    if (!match2 || match[1] !== match2[1]) return false;
    let n1 = this.parseNUMBER(match[2])
    let n2 = this.parseNUMBER(match2[2])
    if (n1 !== n2 + 1 && n1 !== n2 - 1) return false;
    if ((n1 + n2) % 4 !== 3) return false;
    return true
}

let QuonUtilsObject = new QuonUtils().init()


/**
 * @constructor
 */
function QVT() {

}

QVT.prototype.init = function () {
    this.stage = ''
    this.stageInfo = {}
    return this
}

QVT.prototype.util = QuonUtilsObject

QVT.prototype.error = function (any) {
    if (this.stage === 'convertToNodes') {
        any = `${any}@ bitindex: ${this.stageInfo.ii} deep: ${this.stageInfo.dd} Character: ${this.stageInfo.gatestr}`
    }
    let ee = Error(any)
    alert(ee.stack)
    throw ee
}

/**
 * 
 * @param {String} rawInput 
 * @returns {String[][]}
 */
QVT.prototype.setInput = function (rawInput) {
    this.rawInput = rawInput
    let gateArray = this.convertToGateArray(rawInput)
    this.gateArray = gateArray
    return this.gateArray
}

/**
 * 
 * @param {String} rawInput 
 * @returns {String[][]}
 */
QVT.prototype.convertToGateArray = function (rawInput) {
    let inputstr = rawInput
        // .toLowerCase()
        .replace(/\r?\n/g, '\n')
        .replace(/\/\*[^]*?\*\//g, '') //block comment
        .replace(/\/\/.*/g, '') //line comment
        .replace(/[^\S\n]/g, '')
        .replace(/\n{2,}/g, '\n')
        .replace(/^\n/, '')
        .replace(/\n$/, '')
    if (!inputstr) this.error('empty input');
    let rawArray = inputstr.split('\n').map(v => v.split(','))
    let bitNumber = Math.max.apply(null, rawArray.map(v => v.length))
    //shape into matrix
    let gateArray = rawArray.map(v => v.concat(Array.from({ length: bitNumber - v.length }).map(v => '')))
    return gateArray
}

/**
 * @returns {String}
 */
QVT.prototype.getFormatInput = function () {
    return this.formatGateArray(this.gateArray)
}

/**
 * 
 * @param {String[][]} gateArray 
 * @returns {String}
 */
QVT.prototype.formatGateArray = function (gateArray) {
    let qiMaxStringLength = gateArray[0].map((v, i) =>
        Math.max.apply(null, gateArray.map(v => v[i].length))
    )
    let formatedString = gateArray.map(v =>
        v.map((v, i) =>
            v + Array.from({ length: qiMaxStringLength[i] - v.length + 1 }).join(' ')
        ).join(',')
    ).join('\n')
    return formatedString
}

QVT.prototype.getNodes = function () {
    let netInfo = this.convertToNodes(this.gateArray)
    this.nodeNet = netInfo[0]
    this.nodeLink = netInfo[1]
    return netInfo
}

/**
 * for each string in gatearray, build a CircuitNode at that location with the corresponding node type
 * @param {String[][]} gateArray 
 */
QVT.prototype.convertToNodes = function (gateArray) {
    // let gateArray=this.gateArray;
    let util = this.util
    this.stage = 'convertToNodes'
    let bitStatus = gateArray[0].map(v => 'q') // q for quantum, c for classic, d for die
    let bitDeep = gateArray[0].map(v => 0) // current processed deep for each bit
    let nodeNet = {}
    let nodeLink = []
    for (var dd = 0; dd < gateArray.length; dd++) {
        for (var ii = 0; ii < gateArray[0].length; ii++) {
            if (dd !== bitDeep[ii]) continue;
            this.stageInfo = { ii: ii, dd: dd, gatestr: gateArray[dd][ii] }
            let nodestr = gateArray[dd][ii] || 'i1' // '' equal to 'i1'
            if (util.GatePattern['Measure'].test(nodestr)) {
                // if it is a measure operator
                if (bitStatus[ii] !== 'q') this.error('bit has been measured');
                bitDeep[ii]++
                nodeNet[dd + ',' + ii] = new CircuitNode().init(ii, dd).measure(nodestr)
                bitStatus[ii] = 'c'
                continue
            }
            if (util.GatePattern['SingleBitGate'].test(nodestr)) {
                // if it is a Single Bit Gate
                if (bitStatus[ii] !== 'q') this.error('bit has been measured');
                bitDeep[ii]++
                nodeNet[dd + ',' + ii] = new CircuitNode().init(ii, dd).single(nodestr)
                continue
            }
            if (util.GatePattern['ControlGate'].test(nodestr)) {
                // if it is a two Bit Gate: Control Gate
                if (bitStatus[ii] !== 'q') this.error('bit has been measured');
                bitDeep[ii]++
                let match = util.GatePattern['ControlGate'].exec(nodestr)
                let bit2Index = -1;
                // find the other bit in the pair
                for (let jj = 0; jj < gateArray[0].length; jj++) {
                    if (dd !== bitDeep[jj]) continue;
                    if (util.twoBitGatePairCheck(match, gateArray[dd][jj])) {
                        bit2Index = jj; break;
                    }
                }
                if (bit2Index === -1) this.error('no match gate');
                let nodestr2 = gateArray[dd][bit2Index]
                bitDeep[bit2Index]++
                let isControlBit = util.parseNUMBER(match[3]) % 2 == 1
                nodeNet[dd + ',' + ii] = new CircuitNode().init(ii, dd).control(nodestr, nodestr2, isControlBit)
                nodeNet[dd + ',' + bit2Index] = new CircuitNode().init(bit2Index, dd).control(nodestr2, nodestr, !isControlBit)
                nodeLink.push({deep:dd,bits: isControlBit ? [ii, bit2Index] : [bit2Index, ii], type:'ControlGate'})
                continue
            }
            if (util.GatePattern['MeausreControlGate'].test(nodestr)) {
                // if it is a Meausre Control Gate
                bitDeep[ii]++
                let match = util.GatePattern['MeausreControlGate'].exec(nodestr)
                let bit2Index = -1;
                // find the other bit in the pair
                for (let jj = 0; jj < gateArray[0].length; jj++) {
                    if (dd !== bitDeep[jj]) continue;
                    if (util.twoBitGatePairCheck(match, gateArray[dd][jj])) {
                        bit2Index = jj; break;
                    }
                }
                if (bit2Index === -1) this.error('no match gate');
                let nodestr2 = gateArray[dd][bit2Index]
                bitDeep[bit2Index]++
                let isControlBit = util.parseNUMBER(match[3]) % 2 == 1
                // the control bit must be classic
                if (isControlBit && bitStatus[ii] !== 'c' || !isControlBit && bitStatus[bit2Index] !== 'c') this.error('bit has not been measured');
                // the target bit must be quantum
                if (isControlBit && bitStatus[bit2Index] !== 'q' || !isControlBit && bitStatus[ii] !== 'q') this.error('bit has been measured');
                nodeNet[dd + ',' + ii] = new CircuitNode().init(ii, dd).meausreControl(nodestr, nodestr2, isControlBit)
                nodeNet[dd + ',' + bit2Index] = new CircuitNode().init(bit2Index, dd).meausreControl(nodestr2, nodestr, !isControlBit)
                nodeLink.push({deep:dd,bits: isControlBit ? [ii, bit2Index] : [bit2Index, ii], type:'MeausreControlGate'})
                continue
            }
            this.error('can not match any gate')
        }
    }
    this.stage = ''
    return [nodeNet, nodeLink]
}






/**
 * @constructor
 */
function CircuitNode() {

}

/**
 * 
 * @param {Number} bitIndex 
 * @param {Number} deep 
 */
CircuitNode.prototype.init = function (bitIndex, deep) {
    this.bitIndex = bitIndex
    this.deep = deep

    return this
}

CircuitNode.prototype.util = QuonUtilsObject

/**
 * 
 * @param {String} nodestr 
 */
CircuitNode.prototype.measure = function (nodestr) {
    this.rawArg=[nodestr]
    return this
}

/**
 * 
 * @param {String} nodestr 
 */
CircuitNode.prototype.single = function (nodestr) {
    this.rawArg=[nodestr]
    return this
}

/**
 * 
 * @param {String} nodestr 
 * @param {String} nodestr2 
 * @param {Boolean} isControlBit 
 */
CircuitNode.prototype.control = function (nodestr, nodestr2, isControlBit) {
    this.rawArg=[nodestr, nodestr2, isControlBit]
    return this
}

/**
 * 
 * @param {String} nodestr 
 * @param {String} nodestr2 
 * @param {Boolean} isControlBit 
 */
CircuitNode.prototype.meausreControl = function (nodestr, nodestr2, isControlBit) {
    this.rawArg=[nodestr, nodestr2, isControlBit]
    return this
}

if (typeof exports === "undefined") exports = {};
exports.QVT = QVT
exports.CircuitNode = CircuitNode