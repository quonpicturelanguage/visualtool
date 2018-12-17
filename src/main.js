
/**
 * @constructor
 */
function QuonUtils() {

}

/**
 * the process of render regexp
 */
QuonUtils.prototype.init = function () {
    Object.keys(this.GateSourcePattern).forEach(v => {
        this.GatePattern[v] = this.regexReplace(this.GateList[v], this.GateSourcePattern[v])
    })
    let util=this
    let f0=(str,patternName)=>{
        let a=util.GatePattern[patternName].exec(str)
        return a?[a[1],a[2]]:null
    }
    let f1=(str,patternName)=>{
        let a=util.GatePattern[patternName].exec(str)
        return a?[a[1],util.parseNUMBER(a[2]),a[3]]:null
    }
    let f2=(str,patternName)=>{
        let a=util.GatePattern[patternName].exec(str)
        return a?[a[1],util.parseNUMBER(a[2]),util.parseNUMBER(a[3]),a[4]]:null
    }
    this.GateMatch.Measure=str=>f1(str,'Measure')
    this.GateMatch.ControlGate=str=>f2(str,'ControlGate')
    this.GateMatch.MeausreControlGate=str=>f2(str,'MeausreControlGate')
    this.GateMatch.TwoBitGate=str=>f1(str,'TwoBitGate')
    this.GateMatch.OneArgSingleBitGate=str=>f1(str,'OneArgSingleBitGate')
    this.GateMatch.TwoArgSingleBitGate=str=>f2(str,'TwoArgSingleBitGate')
    this.GateMatch.SingleBitGate=str=>f0(str,'SingleBitGate')

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
    'Measure': /^(TBD)(NUMBER)?(ARG)?$/,
    'ControlGate': /^(TBD)(PINT)(?:_(NUMBER))?(ARG)?$/,
    'MeausreControlGate': /^(TBD)(PINT)(?:_(NUMBER))?(ARG)?$/,
    'TwoBitGate': /^(TBD)(PINT)(?:_NUMBER)?(ARG)?$/,
    'OneArgSingleBitGate': /^(TBD)(NUMBER)?(ARG)?$/,
    'TwoArgSingleBitGate': /^(TBD)(PINT)(?:_(NUMBER))?(ARG)?$/,
    'SingleBitGate': /^(TBD)(?:NUMBER|(?:PINT)(?:_NUMBER)?)(ARG)?$/,
}

/**
 * @type {{String:RegExp}}
 */
QuonUtils.prototype.GatePattern = {}

/**
 * @type {{String:<String>Array}}
 */
QuonUtils.prototype.GateMatch={}

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
        .replace(/ARG/g, /\([^(|)]*(?:\|[^(|)]*)*\)/.source)

    )
}

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
    let match2 = this.GateMatch.TwoBitGate(nodestr2)
    if (!match2 || match[0] !== match2[0]) return false;
    let n1 = match[1]
    let n2 = match2[1]
    if (n1 !== n2 + 1 && n1 !== n2 - 1) return false;
    if ((n1 + n2) % 4 !== 3) return false;
    return true
}

/**
 * get deep and bitIndex from string 'deep,bitIndex'
 * @param {String} str 
 */
QuonUtils.prototype.di = function (str) {
    return str.split(',').map(v => parseInt(v))
}

/**
 * combine deep and bitindex to string
 * @param {Number} deep 
 * @param {Number} bitIndex 
 */
QuonUtils.prototype.di2s = function (deep, bitIndex) {
    return deep + ',' + bitIndex
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
        .toLowerCase()
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
    let s = function (deep, bitIndex) {
        return util.di2s(deep, bitIndex)
    }
    for (var dd = 0; dd < gateArray.length; dd++) {
        for (var ii = 0; ii < gateArray[0].length; ii++) {
            if (dd !== bitDeep[ii]) continue;
            this.stageInfo = { ii: ii, dd: dd, gatestr: gateArray[dd][ii] }
            let nodestr = gateArray[dd][ii] || 'i1' // '' equal to 'i1'
            if (util.GateMatch.Measure(nodestr)) {
                // if it is a measure operator
                if (bitStatus[ii] !== 'q') this.error('bit has been measured');
                bitDeep[ii]++
                nodeNet[s(dd ,ii)] = new CircuitNode().init(ii, dd, nodeNet).measure(nodestr)
                bitStatus[ii] = 'c'
                continue
            }
            if (util.GateMatch.SingleBitGate(nodestr)) {
                // if it is a Single Bit Gate
                if (bitStatus[ii] !== 'q') this.error('bit has been measured');
                bitDeep[ii]++
                nodeNet[s(dd ,ii)] = new CircuitNode().init(ii, dd, nodeNet).single(nodestr)
                continue
            }
            if (util.GateMatch.ControlGate(nodestr)) {
                // if it is a two Bit Gate: Control Gate
                if (bitStatus[ii] !== 'q') this.error('bit has been measured');
                bitDeep[ii]++
                let match = util.GateMatch.ControlGate(nodestr)
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
                let isControlBit = match[3] % 2 == 1
                nodeNet[s(dd ,ii)] = new CircuitNode().init(ii, dd, nodeNet).control(nodestr, nodestr2, isControlBit)
                nodeNet[s(dd,bit2Index)] = new CircuitNode().init(bit2Index, dd, nodeNet).control(nodestr2, nodestr, !isControlBit)
                nodeLink.push({ deep: dd, bits: isControlBit ? [ii, bit2Index] : [bit2Index, ii], type: 'ControlGate' })
                continue
            }
            if (util.GateMatch.MeausreControlGate(nodestr)) {
                // if it is a Meausre Control Gate
                bitDeep[ii]++
                let match = util.GateMatch.MeausreControlGate(nodestr)
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
                let isControlBit = match[3] % 2 == 1
                // the control bit must be classic
                if (isControlBit && bitStatus[ii] !== 'c' || !isControlBit && bitStatus[bit2Index] !== 'c') this.error('bit has not been measured');
                // the target bit must be quantum
                if (isControlBit && bitStatus[bit2Index] !== 'q' || !isControlBit && bitStatus[ii] !== 'q') this.error('bit has been measured');
                nodeNet[s(dd ,ii)] = new CircuitNode().init(ii, dd, nodeNet).meausreControl(nodestr, nodestr2, isControlBit)
                nodeNet[s(dd,bit2Index)] = new CircuitNode().init(bit2Index, dd, nodeNet).meausreControl(nodestr2, nodestr, !isControlBit)
                nodeLink.push({ deep: dd, bits: isControlBit ? [ii, bit2Index] : [bit2Index, ii], type: 'MeausreControlGate' })
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
 * @param {{String:CircuitNode}} nodeNet
 */
CircuitNode.prototype.init = function (bitIndex, deep, nodeNet) {
    this.bitIndex = bitIndex
    this.deep = deep
    this.nodeNet = nodeNet

    this.SELF = this
    this.NO = null

    this.innernalMap = {}
    this.externalMap = {}
    let temparray = [[1, 5], [2, 6], [3, 7], [4, 8]]
    temparray.forEach(v => {
        this.innernalMap[v[0]] = { targetNode: this.SELF, targetIndex: v[1], draw: true }
        this.innernalMap[v[1]] = { targetNode: this.NO, targetIndex: 0, draw: false }
        this.externalMap[v[0]] = { targetNode: this.NO, targetIndex: 0, draw: false }
        this.externalMap[v[1]] = { targetNode: this.NO, targetIndex: 0, draw: false }
    })

    return this
}

/**
 * delete cycle reference
 */
CircuitNode.prototype.clear = function () {
    delete (this.innernalMap)
    delete (this.externalMap)
    delete (this.SELF)
}

CircuitNode.prototype.error = function (any) {
    let ee = Error(any)
    alert(ee.stack)
    throw ee
}

CircuitNode.prototype.util = QuonUtilsObject

/**
 * get innernalMap or innernalMap, query from nodeNet instead of return the deep and the bitIndex
 * @param {String} type in ['in','out']
 * @param {Number} arg in 1~8
 */
CircuitNode.prototype.getMap = function (type, arg) {
    let thismap = { in: this.innernalMap, out: this.externalMap }[type]
    if (!thismap) this.error(`type ${type} error`);
    let info = Object.assign({}, thismap[arg])
    if (info.targetNode instanceof Array) {
        if (this.nodeNet == null) this.error('nodeNet equal to null');
        info.targetNode = this.nodeNet[this.util.di2s(info.targetNode[0],info.targetNode[1])]
    }
}

/**
 * 
 * @param {String} nodestr 
 */
CircuitNode.prototype.measure = function (nodestr) {
    this.rawArg = [nodestr]
    let match=this.util.GateMatch.Measure(nodestr)
    this.type=match[0]
    let temparray = {
        mz:[[1, 2], [3, 4]],
        mx:[[1, 4], [2, 3]],
        my:[[1, 3], [2, 4]],
    }[match[0]]
    temparray.forEach(v => {
        this.innernalMap[v[0]] = { targetNode: this.SELF, targetIndex: v[1], draw: true }
        this.innernalMap[v[1]] = { targetNode: this.SELF, targetIndex: v[0], draw: false }
    })
    return this
}

/**
 * 
 * @param {String} nodestr 
 */
CircuitNode.prototype.single = function (nodestr) {
    this.rawArg = [nodestr]
    
    return this
}

/**
 * 
 * @param {String} nodestr 
 * @param {String} nodestr2 
 * @param {Boolean} isControlBit 
 */
CircuitNode.prototype.control = function (nodestr, nodestr2, isControlBit) {
    this.rawArg = [nodestr, nodestr2, isControlBit]
    return this
}

/**
 * 
 * @param {String} nodestr 
 * @param {String} nodestr2 
 * @param {Boolean} isControlBit 
 */
CircuitNode.prototype.meausreControl = function (nodestr, nodestr2, isControlBit) {
    this.rawArg = [nodestr, nodestr2, isControlBit]
    return this
}

/**
 * @constructor
 */
function CircuitLine() {
    
}

CircuitLine.prototype.init = function (linemode, points) {
    this.linemode = linemode
    this.points = points

    return this
}

CircuitLine.prototype.Line={}

/**
 * 1 > 2
 * directly line to
 * 
 * 1 - 2
 */
CircuitLine.prototype.Line.direct=()=>[['M',[1,0]],['L',[0,1]]]

/**
 * 1 > 2
 * Bézier curve, equal to direct when a0=0. 
 * 
 * 1 - 2
 * |   |
 * 4 - 3
 */
CircuitLine.prototype.Line.simpleCurve=(a0)=>[['M',[1,0,0,0]],['C',[0.5*(1-a),0.5*(1-a),0.5*a,0.5*a],[0,1,0,0]]]

if (typeof exports === "undefined") exports = {};
exports.QVT = QVT
exports.CircuitNode = CircuitNode