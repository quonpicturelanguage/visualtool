# gate list

>! unfinished

```js
'run';
//define something here
g=typeof g==='undefined'? {}:g
g.getQVT2dDom=v=>' 9876487615684'
g.getQVT3dDom=v=>' 9876487615684'
g.table=function(ths,tdss){
    return `<table><thead><tr>${ths.map(v=>`<th style="text-align:left">${v}</th>`).join('')}</tr></thead><tbody>${tdss.map(tds=>`<tr>${tds.map(v=>`<td style="text-align:left">${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`
}
return ''
```

test

`g.table(['a','thead'],[[1,2],[3,'test: render table'],['5<br>5-2',6]])`

```js
'run';
return g.table(['a','thead'],[[1,2],[3,'test: render table'],['5<br>5-2',6]])
```

---

```js
'run';
output = [];
[
    ['sz','sz'],
    ['sx','sx'],
    ['sy','sy'],
    ['','sy1'],

    ['mz','mz'],
    ['mx','mx'],
    ['my','my'],
    ['','my1'],

    ['i',''],
    ['','i'],
    ['z','z'],
    ['','z1'],
    ['x','x'],
    ['','x1'],
    ['y','y'],
    ['','y1'],

    ['h','h'],
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
    ['rx','rx45'],
    ['','rx45_1'],

    ['cz','cz5,cz6'],
    ['','cz5_1,cz6'],

    ['mcz','mz,<br>mcz5,mcz6'],
    ['mcx','mz,<br>mcx5,mcx6'],
    ['mcy','mz,<br>mcy5,mcy6'],
    
].forEach(v => output.push([v[0],v[1], g.getQVT2dDom(v[1]), g.getQVT3dDom(v[1])]))
return g.table(['gate','code', '2d','3d'], output)
```




