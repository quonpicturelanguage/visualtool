
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
    let util = this
    let f0 = (str, patternName) => {
        let a = util.GatePattern[patternName].exec(str)
        return a ? [a[1], a[2]] : null
    }
    let f1 = (str, patternName) => {
        let a = util.GatePattern[patternName].exec(str)
        return a ? [a[1], util.parseNUMBER(a[2]), a[3]] : null
    }
    let f2 = (str, patternName) => {
        let a = util.GatePattern[patternName].exec(str)
        return a ? [a[1], util.parseNUMBER(a[2]), util.parseNUMBER(a[3]), a[4]] : null
    }
    this.GateMatch.Measure = str => f1(str, 'Measure')
    this.GateMatch.ControlGate = str => f2(str, 'ControlGate')
    this.GateMatch.MeausreControlGate = str => f2(str, 'MeausreControlGate')
    this.GateMatch.TwoBitGate = str => f1(str, 'TwoBitGate')
    this.GateMatch.OneArgSingleBitGate = str => f1(str, 'OneArgSingleBitGate')
    this.GateMatch.TwoArgSingleBitGate = str => f2(str, 'TwoArgSingleBitGate')
    this.GateMatch.SingleBitGate = str => f0(str, 'SingleBitGate')

    return this
}

/**
 * each type contains gates
 */
QuonUtils.prototype.GateList = {
    'Measure': ['mz', 'mx', 'my'],
    'ControlGate': ['cz'],
    'MeausreControlGate': ['mcx', 'mcy', 'mcz'],
    'TwoBitGate': ['cz', 'mcx', 'mcy', 'mcz'],
    'OneArgSingleBitGate': ['i', 'x', 'y', 'z', 'h', 's', 'sd', 't', 'td'],
    'TwoArgSingleBitGate': ['rx', 'rz'],
    'SingleBitGate': ['i', 'x', 'y', 'z', 'h', 's', 'sd', 't', 'td', 'rx', 'rz'],
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
    'TwoArgSingleBitGate': /^(TBD)(NUMBER)(?:_(NUMBER))?(ARG)?$/,
    'SingleBitGate': /^(TBD)(?:NUMBER|(?:NUMBER)(?:_NUMBER)?)(ARG)?$/,
}

/**
 * @type {{String:RegExp}}
 */
QuonUtils.prototype.GatePattern = {}

/**
 * @type {{String:<String>Array}}
 */
QuonUtils.prototype.GateMatch = {}

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

QVT.prototype.clear = function () {
    if (this.nodeNet) {
        for (let node in this.nodeNet) {
            this.nodeNet[node].clear()
        }
    }
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
                nodeNet[s(dd, ii)] = new CircuitNode().init(ii, dd, nodeNet).measure(nodestr)
                bitStatus[ii] = 'c'
                continue
            }
            if (util.GateMatch.SingleBitGate(nodestr)) {
                // if it is a Single Bit Gate
                if (bitStatus[ii] !== 'q') this.error('bit has been measured');
                bitDeep[ii]++
                nodeNet[s(dd, ii)] = new CircuitNode().init(ii, dd, nodeNet).single(nodestr)
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
                nodeNet[s(dd, ii)] = new CircuitNode().init(ii, dd, nodeNet).control(nodestr, nodestr2, bit2Index, isControlBit)
                nodeNet[s(dd, bit2Index)] = new CircuitNode().init(bit2Index, dd, nodeNet).control(nodestr2, nodestr, ii, !isControlBit)
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
                nodeNet[s(dd, ii)] = new CircuitNode().init(ii, dd, nodeNet).meausreControl(nodestr, nodestr2, bit2Index, isControlBit)
                nodeNet[s(dd, bit2Index)] = new CircuitNode().init(bit2Index, dd, nodeNet).meausreControl(nodestr2, nodestr, ii, !isControlBit)
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
    this.indexMap = {}
    let linkArray = [1, 2, 3, 4, 5, 6, 7, 8]
    linkArray.forEach(v => {
        this.innernalMap[v] = { targetNode: this.NO, targetIndex: 0, draw: null }
        this.externalMap[v] = { targetNode: this.NO, targetIndex: 0, draw: null }
        this.indexMap[v] = v
    })

    return this
}

/**
 * delete cycle reference
 */
CircuitNode.prototype.clear = function () {
    delete (this.nodeNet)
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
 * draw: [functionname:String,args:Array,zIndex:Number]
 * @param {String} type in ['in','out']
 * @param {Number} arg in 1~8
 */
CircuitNode.prototype.getMap = function (type, arg) {
    let thismap = { in: this.innernalMap, out: this.externalMap }[type]
    if (!thismap) this.error(`type ${type} error`);
    let info = Object.assign({}, thismap[arg])
    if (info.targetNode instanceof Array) {
        if (this.nodeNet == null) this.error('nodeNet equal to null');
        info.targetNode = this.nodeNet[this.util.di2s(info.targetNode[0], info.targetNode[1])]
    }
}

/**
 * 
 * @param {String} nodestr 
 */
CircuitNode.prototype.measure = function (nodestr) {
    this.rawArg = [nodestr]
    let match = this.util.GateMatch.Measure(nodestr)
    this.type = match[0]
    let a = 0.25
    let b = 0.2
    let c = 2
    let d = 1
    let linkArray = {
        mz: [[1, 2, b, c], [3, 4, b, d]],
        mx: [[1, 4, b, c], [2, 3, b, d]],
        my: [[1, 3, b, c], [2, 4, a, d]],
    }[this.type]
    let args = [0.3, 0.2]
    let zIndex = [2, 1]
    linkArray.forEach(v => {
        this.innernalMap[v[0]] = Object.assign(this.innernalMap[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['simpleCurve', [v[2]], v[3]], line: 1 })
    })
    // draw: [functionname:String,args:Array,zIndex:Number]
    let mapArray = [[1, 5], [2, 6], [3, 7], [4, 8]]
    mapArray.forEach((v, i) => {
        // rebuild 5~8's map
        this.indexMap[v[1]] = this.indexMap[v[0]] + 4
    })
    return this
}

/**
 * 
 * @param {String} nodestr 
 */
CircuitNode.prototype.single = function (nodestr) {
    this.rawArg = [nodestr]
    let match = this.util.GateMatch.OneArgSingleBitGate(nodestr)
    if (!match) match = this.util.GateMatch.TwoArgSingleBitGate(nodestr);

    this.type = match[0]

    if (['i', 'x', 'y', 'z'].indexOf(this.type) !== -1) {
        let reverseCharge = (v => ~~(v === 0))(match[1])
        let linkArray = [[1, 5], [2, 6], [3, 7], [4, 8]]
        let zIndex = [4, 3, 2, 1]
        let chargeArray = {
            i: [1, 1, 1, 1],
            x: [0, 1, 1, 0],
            y: [1, 0, 1, 0],
            z: [1, 1, 0, 0]
        }[this.type]
        linkArray.forEach((v, i) => {
            // link lines
            this.innernalMap[v[0]] = Object.assign(this.innernalMap[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['direct', [], zIndex[i]], line: 1, charge: chargeArray[i] ^ reverseCharge })
        })
        // draw: [functionname:String,args:Array,zIndex:Number]
        let mapArray = [[1, 5], [2, 6], [3, 7], [4, 8]]
        mapArray.forEach((v, i) => {
            // rebuild 5~8's map
            this.indexMap[v[1]] = this.indexMap[v[0]] + 4
        })
    }

    if (['h'].indexOf(this.type) !== -1) {
        let rotationType = (v => ~~(v !== 0))(match[1])
        let linkArray = {
            '0': [[1, 8], [2, 5], [3, 6], [4, 7]],
            '1': [[1, 6], [2, 7], [3, 8], [4, 5]],
        }[rotationType]
        let zIndex = {
            '0': [4, 3, 2, 1],
            '1': [3, 2, 1, 4],
        }[rotationType]
        linkArray.forEach((v, i) => {
            // link lines
            this.innernalMap[v[0]] = Object.assign(this.innernalMap[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['direct', [], zIndex[i]], line: 1 })
        })
        // draw: [functionname:String,args:Array,zIndex:Number]
        let mapArray = [[1, 5], [2, 6], [3, 7], [4, 8]]
        mapArray.forEach((v, i) => {
            // rebuild 5~8's map
            this.indexMap[v[1]] = this.indexMap[v[0]] + 4
        })
    }

    if (['s', 'sd', 't', 'td'].indexOf(this.type) !== -1) {
        let rotationType = (v => ~~(v !== 0))(match[1])
        let markContent = (v => [{ 's': null, 'sd': null, 't': '90', 'td': '-90' }[v]][0])(this.type)
        let linkArray = {
            '0': [[1, 6], [2, 5], [3, 7], [4, 8]],
            '1': [[1, 5], [2, 6], [3, 8], [4, 7]],
        }[rotationType]
        let zIndex = {
            '0': [4, 3, 2, 1],
            '1': [4, 3, 1, 2],
        }[rotationType]
        let mark = {
            '0': [1, 0, 0, 0],
            '1': [0, 0, 1, 0],
        }[rotationType]
        linkArray.forEach((v, i) => {
            // link lines
            this.innernalMap[v[0]] = Object.assign(this.innernalMap[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['direct', [], zIndex[i]], line: 1, mark: mark ? markContent : null })
        })
        // draw: [functionname:String,args:Array,zIndex:Number]
        let mapArray = [[1, 5], [2, 6], [3, 7], [4, 8]]
        mapArray.forEach((v, i) => {
            // rebuild 5~8's map
            this.indexMap[v[1]] = this.indexMap[v[0]] + 4
        })
    }

    if (['rx', 'rz'].indexOf(this.type) !== -1) {
        let rotationType = (v => ~~(v !== 0))(match[2])
        let markContent = (v => String(v))(match[1])
        let linkArray = {
            '0': [[1, 6], [2, 5], [3, 7], [4, 8]],
            '1': [[1, 5], [2, 6], [3, 8], [4, 7]],
        }[rotationType]
        let zIndex = {
            '0': [4, 3, 2, 1],
            '1': [4, 3, 1, 2],
        }[rotationType]
        let mark = {
            '0': [1, 0, 0, 0],
            '1': [0, 0, 1, 0],
        }[rotationType]
        if (this.type === 'rx') {
            linkArray = {
                '0': [[1, 5], [2, 7], [3, 6], [4, 8]],
                '1': [[1, 8], [2, 6], [3, 7], [4, 5]],
            }[rotationType]
            zIndex = {
                '0': [4, 3, 2, 1],
                '1': [4, 2, 1, 3],
            }[rotationType]
            mark = {
                '0': [0, 1, 0, 0],
                '1': [1, 0, 0, 0],
            }[rotationType]
        }
        linkArray.forEach((v, i) => {
            // link lines
            this.innernalMap[v[0]] = Object.assign(this.innernalMap[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['direct', [], zIndex[i]], line: 1, mark: mark ? markContent : null })
        })
        // draw: [functionname:String,args:Array,zIndex:Number]
        let mapArray = [[1, 5], [2, 6], [3, 7], [4, 8]]
        mapArray.forEach((v, i) => {
            // rebuild 5~8's map
            this.indexMap[v[1]] = this.indexMap[v[0]] + 4
        })
    }

    return this
}

/**
 * 
 * @param {String} nodestr 
 * @param {String} nodestr2 
 * @param {Boolean} isControlBit 
 */
CircuitNode.prototype.control = function (nodestr, nodestr2, bit2Index, isControlBit) {
    this.rawArg = [nodestr, nodestr2, bit2Index, isControlBit]
    return this
}

/**
 * 
 * @param {String} nodestr 
 * @param {String} nodestr2 
 * @param {Boolean} isControlBit 
 */
CircuitNode.prototype.meausreControl = function (nodestr, nodestr2, bit2Index, isControlBit) {
    this.rawArg = [nodestr, nodestr2, bit2Index, isControlBit]
    let match = this.util.GateMatch.MeausreControlGate(nodestr)
    this.type = match[0]

    let markContent = match[4] ? match[4].slice(1, -1) : 'i'

    if (isControlBit) {
        markContent = markContent + ' -' + markContent
        // draw mark only
        this.innernalMap[1] = Object.assign(this.innernalMap[1], { targetNode: [this.SELF], targetIndex: 3, draw: ['direct', [], 1], mark: markContent })
        // draw: [functionname:String,args:Array,zIndex:Number]
    } else {
        let linkArray = [[1, 5], [2, 6], [3, 7], [4, 8]]
        let reverseCharge = (v => ~~(v === 0))(match[2])
        let zIndex = [4, 3, 2, 1]
        let markArray = {
            mcx: [0, 1, 1, 0],
            mcy: [1, 0, 1, 0],
            mcz: [1, 1, 0, 0]
        }[this.type]
        let minusArray = ['', '', '-', '-']
        linkArray.forEach((v, i) => {
            // link lines
            this.innernalMap[v[0]] = Object.assign(this.innernalMap[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['direct', [], zIndex[i]], line: 1, mark: (markArray[i] ^ reverseCharge) ? minusArray[i] + markContent : null })
        })
        // draw: [functionname:String,args:Array,zIndex:Number]
    }

    let mapArray = [[1, 5], [2, 6], [3, 7], [4, 8]]
    mapArray.forEach((v, i) => {
        // rebuild 5~8's map
        this.indexMap[v[1]] = this.indexMap[v[0]] + 4
    })
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

CircuitLine.prototype.Line = {}
CircuitLine.prototype.Charge = {}
CircuitLine.prototype.Mark = {}

/**
 * 1 > 2
 * directly line to
 * 
 * 1 - 2
 */
CircuitLine.prototype.Line.direct = () => [['M', [1, 0]], ['L', [0, 1]]]
CircuitLine.prototype.Charge.direct = () => [0.5, 0.5]
CircuitLine.prototype.Mark.direct = () => [0.5, 0.5]

/**
 * 1 > 2
 * two Bézier curve, equal to direct when a0=0. 
 * demo: M 000 1000 q 20 -300 500 -300 q 480 0 500 300
 * at http://www.runoob.com/try/try.php?filename=trysvg_path2
 * 
 * 1 - 2
 * |   |
 * 4 - 3
 */
CircuitLine.prototype.Line.simpleCurve = (a) => [
    ['M',
        [1, 0, 0, 0]
    ],
    ['Q',
        [0.98 * (1 - a[0]), 0.02 * (1 - a[0]), 0.02 * a[0], 0.98 * a[0]],
        [0.5 * (1 - a[0]), 0.5 * (1 - a[0]), 0.5 * a[0], 0.5 * a[0]]
    ],
    ['Q',
        [0.02 * (1 - a[0]), 0.98 * (1 - a[0]), 0.98 * a[0], 0.02 * a[0]],
        [0, 1, 0, 0]
    ]
]
CircuitLine.prototype.Charge.simpleCurve = (a) => [0.5 * (1 - a[0]), 0.5 * (1 - a[0]), 0.5 * a[0], 0.5 * a[0]]
CircuitLine.prototype.Mark.simpleCurve = (a) => [0.5 * (1 - a[0]), 0.5 * (1 - a[0]), 0.5 * a[0], 0.5 * a[0]]
// ^ unknow now








if (typeof exports === "undefined") exports = {};
exports.QVT = QVT
exports.CircuitNode = CircuitNode