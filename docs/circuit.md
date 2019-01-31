# circuit

<!-- 线路由n*l的矩阵构成, 其中元素是门的code, n是bit数, l是线路深度.

用逗号分隔bit, 换行分隔深度.

涉及多个比特的用奇偶配对的门必须在同一行, 数字每一行独立计算. -->

Circuits are consisted by a matrix of n $\times$ l, where the element is the code of gates, with n = the number of bits, l = the depth of the circuit.

Bits in the same depth are separated by `,` and depth are separated by the wrap.

Multi-bit-gates pair must be in the same depth. Numbers in each depth are independently calculated.

<hr>

```js
'run';
let output = [];
[
    ['Bell state','sx,sx<br>cz1,cz2<br>h'],
    ['Swap','h<br>cz1,cz2<br>h,h<br>cz1,cz2<br>h,h<br>cz1,cz2<br>,h'],
    
].forEach(v => {
    output.push([v[0], qvtg.getQVT3dDomText(v[1])])
    output.push([v[1], qvtg.getQVT2dDomText(v[1])])
})
return qvtg.table(['circuit','picture'], output,{class:['circultTable2']});
```