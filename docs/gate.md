# gate list

代表门的字符后直接跟参数, 参数间用`_`分隔

涉及两个bit的门, 第一个参数用来分组, 奇数和这个奇数+1是一组



所有的门见下表, 其中Conditional-Gate的第一个bit必须已经被测量过作为经典状态, 所以示例中都先作用Measurement in $Z$-basis

不提供CNOT, 利用 $CNOT = I \otimes H\cdot CZ\cdot I \otimes H$ 来画

表格中还有两个特殊标记`e`和`die`

`e`用来让当前的位置线不画出来

`die`用来让一个bit被视为经典状态(之后的线都不画出来, 只能接Initiating)





```js
'run';
let output = [];
[
    ['Initiating $\\left|0\\right>$ in $Z$-basis','sz'],
    ['Initiating $\\left|0\\right>$ in $X$-basis','sx'],
    ['Initiating $\\left|0\\right>$ in $Y$-basis','sy'],
    ['','sy1'],

    ['Measurement in $Z$-basis','mz'],
    ['Measurement in $X$-basis','mx'],
    ['Measurement in $Y$-basis','my'],
    ['','my1'],

    ['Identity',''],
    ['','i'],
    ['Pauli $Z$','z'],
    ['','z1'],
    ['Pauli $X$','x'],
    ['','x1'],
    ['Pauli $Y$','y'],
    ['','y1'],

    ['Hadamard','h'],
    ['','h1'],
    ['','h2'],
    ['','h3'],

    ['$\\frac \\pi 4$ Phase Gate','s'],
    ['','s1'],
    ['$-\\frac \\pi 4$ Phase Gate','sd'],
    ['','sd1'],
    ['$\\frac \\pi 8$ Phase Gate','t'],
    ['$-\\frac \\pi 8$ Phase Gate','td'],

    ['Phase Gate','rz15'],
    ['','rz15_1'],
    ['Rotating Gate','rx-60'],
    ['','rx60_1'],

    ['Controlled-$Z$','cz5,cz6'],
    ['','cz5_1,cz6'],

    ['Conditional-$Z$','mz(i),<br>mcz1,mcz2(i)'],
    ['Conditional-$X$','mz(j),<br>mcx5,mcx6(j)'],
    ['Conditional-$Y$','mz(-k),<br>mcy5,mcy6(-k)'],

    ['Speical Mark `e`','x,x<br>,e<br>y,y'],
    ['Speical Mark `die`',',die<br>,<br>sx,sx'],
    
    
].forEach(v => output.push([v[0],v[1], qvtg.getQVT2dDomText(v[1]), qvtg.getQVT3dDomText(v[1])]))
return qvtg.table(['gate','code', '2d','3d'], output,{class:['gatelistTable34']});
```




