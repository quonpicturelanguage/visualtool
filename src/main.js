
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
    this.GateMatch.SpeicalMark = str => f0(str, 'SpeicalMark')
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
    'SpeicalMark': ['e', 'die'],
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
    'SpeicalMark': /^(TBD)(ARG)?$/,
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

/**
 * find the other point index in the pair
 * @param {Number} index 1~8
 */
QuonUtils.prototype.i = function (index) {
    return index <= 4 ? index + 4 : index - 4;
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
            this.nodeNet[node] || this.nodeNet[node].clear()
        }
    }
    if (this.pictureLines) {
        for (let line in this.pictureLines) {
            this.pictureLines[line] || this.pictureLines[line].clear()
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
    let nodeNet = this.convertToNodes(this.gateArray)
    this.nodeNet = nodeNet
    this.buildNodePosition(nodeNet)
    return nodeNet
}

/**
 * for each string in gatearray, build a CircuitNode at that location with the corresponding node type
 * @param {String[][]} gateArray 
 */
QVT.prototype.convertToNodes = function (gateArray) {
    // let gateArray=this.gateArray;
    let util = this.util
    this.stage = 'convertToNodes'
    let bitStatus = gateArray[0].map(v => 'q') // q for quantum, c for classic
    let bitDeep = gateArray[0].map(v => 0) // current processed deep for each bit
    let nodeNet = {}
    let s = (deep, bitIndex) => {
        return util.di2s(deep, bitIndex)
    }
    for (let dd = 0; dd < gateArray.length; dd++) {
        for (let ii = 0; ii < gateArray[0].length; ii++) {
            if (dd !== bitDeep[ii]) continue;
            this.stageInfo = { ii: ii, dd: dd, gatestr: gateArray[dd][ii] }
            let nodestr = gateArray[dd][ii] || (bitStatus[ii] === 'q' ? 'i1' : 'e') // '' equal to 'i1'
            if (util.GateMatch.SpeicalMark(nodestr)) {
                bitDeep[ii]++
                let match = util.GateMatch.SpeicalMark(nodestr)
                nodeNet[s(dd, ii)] = new CircuitNode().init(ii, dd, nodeNet)
                if (match[0] === 'die') bitStatus[ii] = 'c';
                continue
            }
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
                let isControlBit = match[1] % 2 == 1
                nodeNet[s(dd, ii)] = new CircuitNode().init(ii, dd, nodeNet).control(nodestr, nodestr2, bit2Index, isControlBit)
                nodeNet[s(dd, bit2Index)] = new CircuitNode().init(bit2Index, dd, nodeNet).control(nodestr2, nodestr, ii, !isControlBit)
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
                let isControlBit = match[1] % 2 == 1
                // the control bit must be classic
                if (isControlBit && bitStatus[ii] !== 'c' || !isControlBit && bitStatus[bit2Index] !== 'c') this.error('bit has not been measured');
                // the target bit must be quantum
                if (isControlBit && bitStatus[bit2Index] !== 'q' || !isControlBit && bitStatus[ii] !== 'q') this.error('bit has been measured');
                nodeNet[s(dd, ii)] = new CircuitNode().init(ii, dd, nodeNet).meausreControl(nodestr, nodestr2, bit2Index, isControlBit)
                nodeNet[s(dd, bit2Index)] = new CircuitNode().init(bit2Index, dd, nodeNet).meausreControl(nodestr2, nodestr, ii, !isControlBit)
                continue
            }
            this.error('can not match any gate')
        }
    }
    this.stage = ''
    return nodeNet
}

QVT.prototype.buildNodePosition = function (nodeNet) {
    for (let node in nodeNet) {
        nodeNet[node].buildPosition()
    }
}

QVT.prototype.getLines = function () {
    let linesInfo = this.generateLines(this.gateArray, this.nodeNet)
    this.circuitLines = linesInfo[0]
    this.pictureLines = linesInfo[1]
    return linesInfo
}

QVT.prototype.generateLines = function (gateArray, nodeNet) {
    this.stage = 'generateLines'
    let circuitLines = {}
    let pictureLines = []
    let indexArray = [1, 2, 3, 4, 5, 6, 7, 8]
    let mapTypeArray = ['in', 'out']
    let n = (deep, bitIndex) => {
        return nodeNet[this.util.di2s(deep, bitIndex)]
    }
    let l = (node, realIndex, mapType) => {
        return node.getMap(mapType, realIndex)
    }
    let mapPoint2Line = {}
    let mapLine2Points = {}
    let drawIndex = [-1]
    let circuitLineNumber = [0]
    let line = (dd, ii, realIndex, mapType) => {
        let node = n(dd, ii)
        /**
         * @type {{ targetNode: CircuitNode, targetIndex: Number, draw: Array|null, line:number ,charge: number, mark:String|null, points: Array[][] }}
         */
        let link = l(node, realIndex, mapType)
        if (!link.draw) return;
        drawIndex[0]++
        if (!link.line) return;
        let points = [[dd, ii, realIndex], [link.targetNode.deep, link.targetNode.bitIndex, link.targetIndex]]
        points = points.map(v => v[2] <= 4 ? v : [v[0] + 1, v[1], v[2] - 4])
        // 
        let v = points[0]
        v.push(v.reduce((a, b) => a + ',' + b));
        if (!mapPoint2Line[v[3]]) {
            let cn = ++circuitLineNumber[0];
            mapPoint2Line[v[3]] = cn
            mapLine2Points[cn] = [v[3]]
            circuitLines[cn] = [drawIndex[0]]
        } else {
            let cn = mapPoint2Line[v[3]]
            mapLine2Points[cn].push(v[3])
            circuitLines[cn].push(drawIndex[0])
        }
        //
        v = points[1]
        v.push(v.reduce((a, b) => a + ',' + b));
        if (!mapPoint2Line[v[3]]) {
            let cn = circuitLineNumber[0];
            mapPoint2Line[v[3]] = cn
            mapLine2Points[cn].push(v[3])
        } else {
            let cn2 = mapPoint2Line[v[3]]
            let cn = circuitLineNumber[0];
            if (cn !== cn2) {
                mapLine2Points[cn2].forEach(v => { mapPoint2Line[v] = cn })
                mapLine2Points[cn] = mapLine2Points[cn].concat(mapLine2Points[cn2].reverse())
                mapLine2Points[cn2] = null
                circuitLines[cn] = circuitLines[cn].concat(circuitLines[cn2].reverse())
                circuitLines[cn2] = null
            }
        }

    }
    let draw = (dd, ii, realIndex, mapType) => {
        let node = n(dd, ii)
        let link = l(node, realIndex, mapType)
        if (!link.draw) return;
        let circuitLineId = [-1]
        let lineId = pictureLines.length
        Object.keys(circuitLines).forEach(v => {
            if (circuitLineId[0] >= 0 || !circuitLines[v] || circuitLines[v].indexOf(lineId) === -1) return;
            circuitLineId[0] = v
        })
        // todo this.error if -1
        let pl = new PictureLine().init(node, realIndex, link, lineId, circuitLineId[0])
        pictureLines.push(pl)
    }
    let for4 = (fun) => {
        for (let dd = 0; dd < gateArray.length; dd++) {
            for (let ii = 0; ii < gateArray[0].length; ii++) {
                indexArray.forEach(realIndex => {
                    mapTypeArray.forEach(mapType => {
                        fun(dd, ii, realIndex, mapType)
                    })
                })
            }
        }
    }
    for4(line)
    for4(draw)
    this.stage = ''
    return [circuitLines, pictureLines]
}

QVT.prototype.getSVGContentString = function () {
    let SVGContentString = this.generateSVGContentString(this.pictureLines, this.nodeNet)
    this.SVGContentString = SVGContentString
    return SVGContentString
}

/**
 * 
 * @param {PictureLine[]} pictureLines 
 * @param {{String:CircuitNode}} nodeNet 
 */
QVT.prototype.generateSVGContentString = function (pictureLines, nodeNet) {
    this.stage = 'generateSVGContentString'
    let pictureLayerMap = {}
    for (let lineIndex in pictureLines) {
        let layers = pictureLines[lineIndex].render()
        layers.forEach(v => {
            if (pictureLayerMap[v[0]])
                pictureLayerMap[v[0]].push(v[1]);
            else
                pictureLayerMap[v[0]] = [v[1]];
        })
    }
    let SVGContentString = Object.keys(pictureLayerMap).sort().map(layer => {
        let v = pictureLayerMap[layer].reduce((a, b) => a + b)
        return `<g class='layer${layer}'>\n${v}</g>\n`
    }).reduce((a, b) => a + b)
    this.stage = ''
    return SVGContentString
}

QVT.prototype.getSVGFrame = function () {
    let SVGFrame = this.generateSVGFrame(this.SVGContentString, this.gateArray)
    this.SVGFrame = SVGFrame
    return SVGFrame
}

QVT.prototype.generateSVGFrame = function (SVGContentString, gateArray) {
    let SVGFrame = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${this.getSVGViewBox(gateArray)}">\n${SVGContentString}</svg>`
    return SVGFrame
}

QVT.prototype.getSVGViewBox = function (gateArray) {
    let boxSize = new PictureLine().calculateSVGPosition([gateArray[0].length, gateArray.length + 2])
    return `0 0 ${boxSize[0]} ${boxSize[1]}`
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

    this.innernalLink = {}
    this.externalLink = {}
    this.indexMap = {}
    let linkArray = [1, 2, 3, 4, 5, 6, 7, 8]
    linkArray.forEach(v => {
        this.innernalLink[v] = { targetNode: this.NO, targetIndex: 0, draw: null }
        this.externalLink[v] = { targetNode: this.NO, targetIndex: 0, draw: null }
        this.indexMap[v] = v
    })

    let mapArray = [[1, 5], [2, 6], [3, 7], [4, 8]]
    mapArray.forEach((v, i) => {
        // rebuild map
        if (this.deep) this.indexMap[v[0]] = this.nodeNet[this.util.di2s(this.deep - 1, this.bitIndex)].indexMap[v[1]] - 4;
        this.indexMap[v[1]] = this.indexMap[v[0]] + 4
    })

    return this
}

/**
 * delete cycle reference
 */
CircuitNode.prototype.clear = function () {
    delete (this.nodeNet)
    delete (this.innernalLink)
    delete (this.externalLink)
    delete (this.SELF)
    delete (this.rawArg)
}

CircuitNode.prototype.error = function (any) {
    let ee = Error(any)
    alert(ee.stack)
    throw ee
}

CircuitNode.prototype.util = QuonUtilsObject


CircuitNode.prototype.buildPosition = function () {
    // should be executed after nodeNet before circuitLines
    this.position = {}

    let positionIndexArray = [1, 2, 3, 4, 5, 6, 7, 8]
    positionIndexArray.forEach(v => {
        this.position[this.indexMap[v]] = this.calculatePosition(this.deep, this.bitIndex, v)
    })
}

CircuitNode.prototype.calculatePosition = function (deep, bitIndex, positionIndex) {
    if (positionIndex <= 4)
        return [bitIndex + 0.25 + (positionIndex - 1) * 0.5 / 3, deep + 1];
    else
        return this.calculatePosition(deep + 1, bitIndex, positionIndex - 4);
    // .map((v,i)=>i==1?v+0.01:v);
}


/**
 * get innernalLink or innernalLink, query from nodeNet instead of return the deep and the bitIndex
 * draw: [functionname:String,args:Array,zIndex:Number]
 * @param {String} type in ['in','out']
 * @param {Number} realIndex in 1~8
 * @returns {{ targetNode: CircuitNode, targetIndex: Number, draw: Array|null, line:number ,charge: number, mark:String|null, points: Array[] }}
 */
CircuitNode.prototype.getMap = function (type, realIndex) {
    let thismap = { in: this.innernalLink, out: this.externalLink }[type]
    if (!thismap) this.error(`type ${type} error`);
    let info = Object.assign({}, thismap[realIndex])
    if (info.targetNode instanceof Array) {
        if (this.nodeNet == null) this.error('nodeNet equal to null');
        info.targetNode = this.nodeNet[this.util.di2s(info.targetNode[0], info.targetNode[1])]
    }
    return info
}

/**
 * 
 * @param {String} nodestr 
 */
CircuitNode.prototype.measure = function (nodestr) {
    this.rawArg = [nodestr]
    let match = this.util.GateMatch.Measure(nodestr)
    this.type = match[0]
    let rotationType = (v => ~~(v !== 0))(match[1])
    let zIndex = {
        '0': [2, 1],
        '1': [1, 2]
    }[rotationType]
    let a = 0.1
    let b = 0.2
    let s = 's'
    let t = 't'
    let linkArray = {
        mz: [[1, 2, a, zIndex[0]], [3, 4, a, zIndex[1]]],
        mx: [[1, 4, b, zIndex[0]], [2, 3, a, zIndex[1]]],
        my: [[1, 3, a, zIndex[0]], [2, 4, a, zIndex[1]]],
    }[this.type]
    let args = [0.3, 0.2]

    linkArray.forEach(v => {
        this.innernalLink[v[0]] = Object.assign(this.innernalLink[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['parallelNegative', [v[2]], v[3]], line: 1, points: [[s, v[0]], [s, v[1]], [s, v[1] + 4], [s, v[0] + 4]] })
    })
    // draw: [functionname:String,args:Array,zIndex:Number]
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
            this.innernalLink[v[0]] = Object.assign(this.innernalLink[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['direct', [], zIndex[i]], line: 1, charge: chargeArray[i] ^ reverseCharge })
        })
        // draw: [functionname:String,args:Array,zIndex:Number]
    }

    if (['h'].indexOf(this.type) !== -1) {
        let rotationType = (v => ~~(v % 2 !== 0))(match[1])
        let coverType = (v => ~~(v > 1))(match[1])
        let linkArray = {
            '0': [[1, 8], [2, 5], [3, 6], [4, 7]],
            '1': [[1, 6], [2, 7], [3, 8], [4, 5]],
        }[rotationType]
        let zIndex = {
            '0': [4, 3, 2, 1],
            '1': [1, 2, 3, 4],
        }[coverType]
        let a = 0.35
        let s = 's'
        linkArray.forEach((v, i) => {
            // link lines
            this.innernalLink[v[0]] = Object.assign(this.innernalLink[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['parallelPositive', [a], zIndex[i]], line: 1, points: [[s, v[0]], [s, v[1] - 4], [s, v[1]], [s, v[0] + 4]] })
        })
        // draw: [functionname:String,args:Array,zIndex:Number]
    }

    if (['s', 'sd', 't', 'td'].indexOf(this.type) !== -1) {
        let rotationType = (v => ~~(v !== 0))(match[1])
        let markContent = (v => [{ 's': null, 'sd': null, 't': '45', 'td': '-45' }[v]][0])(this.type)
        let coverType = (v => ~~(v === 'sd'))(this.type)
        let a = 0.35
        let s = 's'
        let linkArray = {
            '0': [[1, 6], [2, 5], [3, 7], [4, 8]],
            '1': [[1, 5], [2, 6], [3, 8], [4, 7]],
        }[rotationType]
        let zIndex = {
            '0': [4, 3, 1, 2],
            '1': [3, 4, 2, 1],
        }[coverType]
        let mark = {
            '0': [1, 0, 0, 0],
            '1': [0, 0, 1, 0],
        }[rotationType]
        linkArray.forEach((v, i) => {
            // link lines
            this.innernalLink[v[0]] = Object.assign(this.innernalLink[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['parallelPositive', [a], zIndex[i]], line: 1, mark: mark ? markContent : null, points: [[s, v[0]], [s, v[1] - 4], [s, v[1]], [s, v[0] + 4]] })
        })
        // draw: [functionname:String,args:Array,zIndex:Number]
    }

    if (['rx', 'rz'].indexOf(this.type) !== -1) {
        let rotationType = (v => ~~(v !== 0))(match[2])
        let markContent = (v => String(v))(match[1])
        let linkArray = {
            '0': [[1, 6], [2, 5], [3, 7], [4, 8]],
            '1': [[1, 5], [2, 6], [3, 8], [4, 7]],
        }[rotationType]
        let a = 0.35
        let s = 's'
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
            this.innernalLink[v[0]] = Object.assign(this.innernalLink[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['parallelPositive', [a], zIndex[i]], line: 1, mark: mark ? markContent : null, points: [[s, v[0]], [s, v[1] - 4], [s, v[1]], [s, v[0] + 4]] })
        })
        // draw: [functionname:String,args:Array,zIndex:Number]
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
    let match = this.util.GateMatch.ControlGate(nodestr)
    this.type = match[0]
    if (isControlBit) {
        let linkArray = [[1, 5], [2, 6]]
        let zIndex = [4, 3]
        linkArray.forEach((v, i) => {
            // link lines
            this.innernalLink[v[0]] = Object.assign(this.innernalLink[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['direct', [], zIndex[i]], line: 1 })
        })

        let rotationType = (v => ~~(v !== 0))(match[2])

        let s = 's'
        let t = 't'
        let a = 0.15
        let b = 0.35
        // 3,4 7,8 -> 1',5' 2',6'
        linkArray = [
            [3, 1, 'parallelNegative', [a], [[s, 3], [t, 1], [t, 5], [s, 7]]],
            [4, 5, 'parallelPositive', [b], [[s, 4], [t, 1], [t, 5], [s, 8]]],
            [7, 2, 'parallelPositive', [b], [[s, 7], [t, 6], [t, 2], [s, 3]]],
            [8, 6, 'parallelNegative', [a], [[s, 8], [t, 6], [t, 2], [s, 4]]]
        ]
        zIndex = [6, 7, 8, 5]
        if (rotationType) {
            // 3,4 7,8 -> 6',2' 5',1'
            linkArray = [
                [3, 6, 'parallelPositive', [b], [[s, 3], [t, 2], [t, 6], [s, 7]]],
                [4, 2, 'parallelNegative', [a], [[s, 4], [t, 2], [t, 6], [s, 8]]],
                [7, 5, 'parallelNegative', [a], [[s, 7], [t, 5], [t, 1], [s, 3]]],
                [8, 1, 'parallelPositive', [b], [[s, 8], [t, 5], [t, 1], [s, 4]]]
            ]
            zIndex = [8, 6, 5, 7]
        }

        linkArray.forEach((v, i) => {
            // link lines
            this.innernalLink[v[0]] = Object.assign(this.innernalLink[v[0]], { targetNode: [this.deep, bit2Index], targetIndex: v[1], draw: [v[2], v[3], zIndex[i]], line: 1, points: v[4] })
        })

    } else {
        let linkArray = [[3, 7], [4, 8]]
        let zIndex = [2, 1]
        linkArray.forEach((v, i) => {
            // link lines
            this.innernalLink[v[0]] = Object.assign(this.innernalLink[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['direct', [], zIndex[i]], line: 1 })
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
CircuitNode.prototype.meausreControl = function (nodestr, nodestr2, bit2Index, isControlBit) {
    this.rawArg = [nodestr, nodestr2, bit2Index, isControlBit]
    let match = this.util.GateMatch.MeausreControlGate(nodestr)
    this.type = match[0]

    let markContent = match[4] ? match[4].slice(1, -1) : 'i'

    if (isControlBit) {
        markContent = markContent + ' -' + markContent
        // draw mark only
        this.innernalLink[1] = Object.assign(this.innernalLink[1], { targetNode: this.SELF, targetIndex: 3, draw: ['direct', [], 1], mark: markContent })
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
            this.innernalLink[v[0]] = Object.assign(this.innernalLink[v[0]], { targetNode: this.SELF, targetIndex: v[1], draw: ['direct', [], zIndex[i]], line: 1, mark: (markArray[i] ^ reverseCharge) ? minusArray[i] + markContent : null })
        })
        // draw: [functionname:String,args:Array,zIndex:Number]
    }
    return this
}



/**
 * @constructor
 */
function PictureLine() {

}

/**
 * 
 * @param {CircuitNode} node1
 * @param {Number} realIndex
 * @param {{ targetNode: CircuitNode, targetIndex: Number, draw: Array|null, line:number ,charge: number, mark:String|null, points: Array[][] }} link 
 * @param {Number} lineId
 * @param {Number} circuitLineId
 */
PictureLine.prototype.init = function (node1, realIndex, link,lineId, circuitLineId) {
    this.rawArg = [node1, realIndex, link]
    let node2 = link.targetNode

    this.lineId=lineId
    this.circuitLineId=circuitLineId

    this.type = link.draw[0]
    this.args = link.draw[1]
    this.zIndex = link.draw[2]

    this.line = link.line
    this.charge = link.charge
    this.mark = link.mark

    this.frontlineWidth = 4
    this.backlineWidth = 9


    this.node1 = node1
    this.node2 = node2

    this.points = link.points
    if (!this.points) this.points = [['s', realIndex], ['t', link.targetIndex]];

    this.sourcePosition = []
    this.points.forEach(v => {
        let node = { s: node1, t: node2 }[v[0]]
        this.sourcePosition.push(node.position[v[1]])
    })


    return this
}

PictureLine.prototype.clear = function () {
    delete (this.rawArg)
}

PictureLine.prototype.render = function () {

    let output = []
    if (this.line) output = output.concat(this.renderLine());
    if (this.charge) output = output.concat(this.renderCharge());
    if (this.mark) output = output.concat(this.renderMark());
    return output
}

PictureLine.prototype.renderLine = function () {
    let lineData = this.Line[this.type](this.args)
    let SVGLineData = lineData.map(v => [v[0], v.slice(1).map(v => this.calculateSVGPosition(this.combine(v)))])
    let SVGLineString = JSON.stringify(SVGLineData).replace(/[^-.MLQ0-9]+/g, ' ').trim()
    let SVGString = `<path d="${SVGLineString}" stroke="white" stroke-width="${this.backlineWidth}" fill="none" class="backline line${this.lineId} circultline${this.circuitLineId}"/>\n<path d="${SVGLineString}" stroke="black" stroke-width="${this.frontlineWidth}" fill="none" class="frontline line${this.lineId} circultline${this.circuitLineId}"/>\n`
    return [[this.zIndex, SVGString]]
}

PictureLine.prototype.renderCharge = function () {
    // todo
    // return [[this.zIndex, 'renderCharge']]
    return []
}
PictureLine.prototype.renderMark = function () {
    // todo
    // return [[this.zIndex, 'renderMark']]
    return []
}

PictureLine.prototype.combine = function (distribution) {
    return this.sourcePosition[0].map((v, i) => distribution.map((v, j) => v * this.sourcePosition[j][i]).reduce((a, b) => a + b))
}

PictureLine.prototype.calculateSVGPosition = function (position) {
    return position.map(v => 100 * v)
}

PictureLine.prototype.Line = {}
PictureLine.prototype.Charge = {}
PictureLine.prototype.Mark = {}

/**
 * 1 > 2
 * directly line to
 * 
 * 1 - 2
 */
PictureLine.prototype.Line.direct = () => [['M', [1, 0]], ['L', [0, 1]]]
PictureLine.prototype.Charge.direct = () => [0.5, 0.5]
PictureLine.prototype.Mark.direct = () => [0.5, 0.5]

/**
 * 1 > 2
 * two Bézier curve, equal to direct when a=[0]. 
 * demo: M 000 1000 q 0 -100 500 -100 q 500 0 500 100
 * at http://www.runoob.com/try/try.php?filename=trysvg_path2
 * 
 * 1 - 2
 * |   |
 * 4 - 3
 */
PictureLine.prototype.Line.parallelNegative = (a) => [
    ['M',
        [1, 0, 0, 0]
    ],
    ['Q',
        [1 * (1 - a[0]), 0 * (1 - a[0]), 0 * a[0], 1 * a[0]],
        [0.5 * (1 - a[0]), 0.5 * (1 - a[0]), 0.5 * a[0], 0.5 * a[0]]
    ],
    ['Q',
        [0 * (1 - a[0]), 1 * (1 - a[0]), 1 * a[0], 0 * a[0]],
        [0, 1, 0, 0]
    ]
]
PictureLine.prototype.Charge.parallelNegative = (a) => [0.5 * (1 - a[0]), 0.5 * (1 - a[0]), 0.5 * a[0], 0.5 * a[0]]
PictureLine.prototype.Mark.parallelNegative = (a) => [0.5 * (1 - a[0]), 0.5 * (1 - a[0]), 0.5 * a[0], 0.5 * a[0]]


/**
 * 1 > 3
 * two Bézier curve, equal to direct when a=[0]. 
 * 
 * 1 - 2
 * |   |
 * 4 - 3
 */
PictureLine.prototype.Line.parallelPositive = (a) => [
    ['M',
        [1, 0, 0, 0]
    ],
    ['Q',
        [1 * (1 - a[0]), 0 * (1 - a[0]), 0 * a[0], 1 * a[0]],
        [0.25, 0.25, 0.25, 0.25]
    ],
    ['Q',
        [0 * a[0], 1 * a[0], 1 * (1 - a[0]), 0 * (1 - a[0])],
        [0, 0, 1, 0]
    ]
]
PictureLine.prototype.Charge.parallelPositive = (a) => [0.25, 0.25, 0.25, 0.25]
PictureLine.prototype.Mark.parallelPositive = (a) => [0.25, 0.25, 0.25, 0.25]









if (typeof exports === "undefined") exports = {};
exports.QVT = QVT
exports.CircuitNode = CircuitNode
exports.PictureLine = PictureLine