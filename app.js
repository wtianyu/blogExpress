var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var validate = require('./routes/validate');
var node = require('./routes/node');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
//注册视图模板后缀名为html
//注册ejs模板为html页。简单的讲，就是原来以.ejs为后缀的模板页，现在的后缀名可以//是.html了
app.engine('.html', require('ejs').__express);
//设置视图模板的默认后缀名为.html,避免了每次res.Render("xx.html")的尴尬
app.set('view engine', 'html');
//设置模板文件文件夹,__dirname为全局变量,表示网站根目录
// app.set('views', __dirname + '/views');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ 'limit': '100000kb' }));
app.use(bodyParser.urlencoded({ 'limit': '100000kb', extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**拦截器 */
app.use(function(req, res, next) {
    console.log("我是一个拦截器,我可以过滤掉一些特殊字符。");
    next();
});


app.use('/', index);
app.use('/users', users);
app.use('/validate', validate);
//笔记路由
app.use('/node', node);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;