# export
<div style="display:none">
<input type="file" id="fileElem" multiple accept="svg/svg" onchange="handleFiles(this.files)">
<div id="hidden-div"></div>
</div>


```js
'run';
if(typeof endmarkvar!=='undefined')return '<input type="button" id="loading" value="Convert SVG Files" onclick="submitFileAndConvert()">';
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
    loading.value='Convert SVG Files'
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



var convertOneSVGStr=function(SVGstr,file){
    var filename=file.name
    console.log(file)
    console.log(SVGstr.slice(0,30))
    var pagesize = getSVGSize(SVGstr)
    var compress = true,
        pagewidth = pagesize[0],
        pageheight = pagesize[1],
        showViewport = false,
        x = 0,
        y = 0;
    var options = {
        useCSS: true,
        assumePt: false,
        preserveAspectRatio: '',
        width: NaN,
        height: NaN
    };
    var doc = new PDFDocument({compress: compress, size: [pagewidth, pageheight]})
    if (options.useCSS) {
        var hiddenDiv = document.getElementById('hidden-div');
        hiddenDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' + SVGstr.trim() + '</svg>';
        SVGtoPDF(doc, hiddenDiv.firstChild.firstChild, x, y, options);
    } else {
        SVGtoPDF(doc, SVGstr, x, y, options);
    }
    let stream = doc.pipe(blobStream());
    stream.on('finish', function() {
        let blob = stream.toBlob('application/pdf');
        // document.getElementById('pdf-file').contentWindow.location.replace(URL.createObjectURL(blob));
        var clickEvent = new MouseEvent("click", {
            "view": window,
            "bubbles": true,
            "cancelable": false
        });
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = filename.replace(/[sS][vV][gG]$/,'pdf');
        a.textContent = 'Download file!';
        a.dispatchEvent(clickEvent);
    });
    doc.end();
    // new QVT().util.createAndDownloadFile(str, filename.replace(/[sS][vV][gG]$/,'pdf'), 'pdf')
}

var getSVGSize=function(SVGstr){
    let match=/svg.*viewBox=['"]([^'"]*)['"]/.exec(SVGstr||'')
    if(!match)return [595,842];
    return match[1].replace(/^[^ ,]+.[^ ,]+./,'').split(/[ ,]/).map(v=>parseFloat(v));
}
return '<input type="button" id="loading" value="loading ..." onclick="submitFileAndConvert()" disabled>'
```

The export format of the tool is SVG, you can convert them to PDF by the button.

Click the button and select the SVG files and click `Open(O)`.

Converting by [SVG-to-PDFKit](https://github.com/alafr/SVG-to-PDFKit). Its License is [MIT](http://choosealicense.com/licenses/mit/).
