#!/usr/bin/env node --harmony

var gutil = require('gulp-util');
var koa = require('koa');
var koaBody = require('koa-body');
var path = require('path');
var jscoverHandler = require('node-jscover-handler/lib/koa');
var jscoverCoveralls = require('node-jscover-coveralls/lib/koa');
var serve = require('koa-static');
var fs = require('fs');
var app = koa();
var mount = require('koa-mount');
var cwd = process.cwd();
var serveIndex = require('koa-serve-index');

function *modularize(next) {
    var req = this.request;
    var res = this.response;
    if (path.extname(this.path) !== '.js') {
        yield *next;
        return;
    }
    var filePath = path.resolve(cwd, req.originalUrl.substring(1)).replace(/-coverage\.js/, '.js');
    var stats = fs.statSync(filePath);
    if (!stats.isFile()) {
        yield *next;
        return;
    }
    var code = fs.readFileSync(filePath, 'utf-8');
    code = 'define(function(require,exports,module){' + code + '\n});';
    if (req.path.indexOf('-coverage.js') !== -1) {
        req.nodeJsCoverCode = code;
        yield *next;
        return;
    }
    res.set('content-type', 'application/javascript;charset=utf-8');
    this.body = code;
}

// parse application/x-www-form-urlencoded
app.use(koaBody({formidable: {uploadDir: __dirname}, multipart: true}));
app.use(function *(next) {
    if (path.extname(this.path) === '.jss') {
        var func = require(path.resolve(__dirname, this.path.substring(1))).call(this);
        yield *func;
    } else {
        yield *next;
    }
});
app.use(mount('/lib/', modularize));
app.use(mount('/tests/browser/specs/', modularize));

app.use(jscoverCoveralls());
app.use(jscoverHandler());
app.use(serveIndex(cwd, {
    hidden: true,
    view: 'details'
}));
app.use(serve(cwd, {
    hidden: true
}));
var port = process.env.PORT || parseInt('8037', 10);
app.listen(port);
gutil.log('server start at ' + port);