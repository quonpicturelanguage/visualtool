# export

<input type="file" id="fileElem" multiple accept="svg/svg" style="display:none" onchange="handleFiles(this.files)">
<div id="hidden-div" style="display:none"></div>

```js
'run';
if(typeof endmarkvar!=='undefined')return '<input type="button" id="loading" value="test" onclick="submitFileAndConvert()">';
if(typeof startmarkvar!=='undefined')return '<input type="button" id="loading" value="loading ..." onclick="submitFileAndConvert()" disabled>';
startmarkvar=1

var loadScripts=function(callback){
    var loadOneScript=function(src,callback){
        var script = document.createElement('script')
        script.src = src
        document.body.appendChild(script)
        script.onload = function () {
            callback()
        }
    }
    var lnum=0
    var tnum=3
    var cb=function(){
        lnum++
        if(lnum==tnum)callback();
    }
    loadOneScript('../svg2pdf/pdfkit.js',cb)
    loadOneScript('../svg2pdf/blobstream.js',cb)
    loadOneScript('../svg2pdf/source.js',cb)
}

loadScripts(function(){
    submitFileAndConvert=function(){fileElem.click()}
    loading.value='test'
    loading.disabled=false
    endmarkvar=1
})

handleFiles = function (files) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    
    if (file.type!=='image/svg+xml') {
      continue;
    }
    
    var reader = new FileReader();
    reader.onload = (function(file) { return function(e) { convertOneSVGStr(e.target.result,file); }; })(file);
    reader.readAsText(file);
  }
}

convertOneSVGStr=function(SVGstr,file){
    var filename=file.name
    console.log(file)
    console.log(SVGstr.slice(0,30))
    // new QVT().util.createAndDownloadFile(str, filename.replace(/[sS][vV][gG]$/,'pdf'), 'pdf')
}

return '<input type="button" id="loading" value="loading ..." onclick="submitFileAndConvert()" disabled>'
```



<input type="button" value="test" onclick="submitFileAndConvert()">

qvt生成的图片文件是svg, 需要转成pdf格式用来插入到latex中

svg to pdf by [SVG-to-PDFKit](https://github.com/alafr/SVG-to-PDFKit), its License is [MIT](http://choosealicense.com/licenses/mit/)
