# gate list

>! unfinished

test

Pauli $Z$

`qvtg.table(['a','thead'],[[1,2],[3,'test: render table'],['5<br>5-2',6]])`

```js
'run';
return qvtg.table(['a','thead'],[[1,2],[3,'test: render table'],['5<br>5-2',6]])
```
<p>1+1</p>

<hr>


```js
'run';
output = [];
[
    ['Start with $Z$-basis','sz'],
    ['Start with $X$-basis','sx'],
    ['Start with $Y$-basis','sy'],
    ['','sy1'],

    ['Measure with $Z$-basis','mz'],
    ['Measure with $X$-basis','mx'],
    ['Measure with $Y$-basis','my'],
    ['','my1'],

    ['Idle',''],
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

    ['s','s'],
    ['','s1'],
    ['sd','sd'],
    ['','sd1'],
    ['t','t'],
    ['td','td'],

    ['rz','rz15'],
    ['','rz15_1'],
    ['rx','rx-45'],
    ['','rx45_1'],

    ['cz','cz5,cz6'],
    ['','cz5_1,cz6'],

    ['mcz','mz(i),<br>mcz5,mcz6(i)'],
    ['mcx','mz(j),<br>mcx5,mcx6(j)'],
    ['mcy','mz(-k),<br>mcy5,mcy6(-k)'],
    
].forEach(v => output.push([v[0],v[1], qvtg.getQVT2dDomText(v[1]), qvtg.getQVT3dDomText(v[1])]))
return qvtg.table(['gate','code', '2d','3d'], output,{class:['gatelistTable34']})
```




