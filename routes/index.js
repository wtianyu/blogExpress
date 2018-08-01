var express = require('express');
var mysql = require('./../moudle/mysqlUtil.js');
var process = require("./../moudle/process.js");
var fs = require('fs');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var querystring = require('querystring');
var url = require('url');
var http = require('http');
var https = require('https');
var util = require('util');

var router = express.Router();
const encryp = 38; //加密编号
const userPath = "/var/www/vhosts/cy.wtianyu.com/httpdocs/function/wy/index/Package/html10/uploads/";

var log = require('./../moudle/log.js');
const basePath = "/home/node/PsExpress";

router.use(cookieParser());
router.use(session({
    resave: true, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'love'
}));

/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('login');
});

router.get('/index', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    res.render('index');
});

router.get('/getTuiCool', function(req, res, next) {

    // 执行java代码,获取tuiCool最新资讯
    process.exec_process("java -jar /home/java/JsoupTuiCool.jar ", function() {
        if (process.getShellData().err == null) {
            console.log(process.getShellData().stdout);
            res.end(process.getShellData().stdout);
        } else {
            console.log(process.getShellData().stderr);
            res.end(process.getShellData().stderr + '\n');
        }
    });
});

/**
 * 图灵机器人
 */
router.post('/askTuling', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    //POST URL
    var urlstr = 'http://www.tuling123.com/openapi/api';
    //POST 内容
    var bodyQueryStr = {
        key: 'a9ba66f5f7ed40f5a1ab7c80fe3d6bea',
        info: req.body.info,
        userid: req.session.psUser.userId
    };

    var contentStr = querystring.stringify(bodyQueryStr);
    var contentLen = Buffer.byteLength(contentStr, 'utf8');
    console.log(util.format('post data: %s, with length: %d', contentStr, contentLen));
    var httpModule = urlstr.indexOf('https') === 0 ? https : http;
    var urlData = url.parse(urlstr);
    console.log(urlData.hostname);
    console.log(urlData.path);
    //HTTP请求选项
    var opt = {
        hostname: urlData.hostname,
        path: urlData.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': contentLen
        }
    };

    //处理事件回调
    var req = httpModule.request(opt, function(httpRes) {
        var buffers = [];
        httpRes.on('data', function(chunk) {
            buffers.push(chunk);
        });

        httpRes.on('end', function(chunk) {
            var wholeData = Buffer.concat(buffers);
            var dataStr = wholeData.toString('utf8');
            console.log('content ' + wholeData);
            res.end(wholeData);
        });
    }).on('error', function(err) {
        console.log('error ' + err);
    });
    //写入数据，完成发送
    req.write(contentStr);
    req.end();
});

/**
 * 显示相册页面
 */
router.get('/index_album', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    var dirList = getDirList(userPath + req.session.psUser.user_name + "/");
    console.log(dirList);
    res.render('index_album', { dirnamelist: dirList });
});

/**
 * 显示注册页面
 */
router.get('/register', function(req, res, next) {

    res.render('register');
});

/**
 * 注册处理
 */
router.post('/doRegister', function(req, res, next) {

    var userId = new Date().getTime() + "100" + (parseInt(Math.random() * 89) + 10);
    var data = [userId, req.body.userName, "" + req.body.userPassWd]; //compile("" + req.body.userPassWd)
    mysql.execute("insert into ps_user set user_id=?,user_name=?,user_passwd=?", data, function(result) {
        if (result == -1) {
            res.end(result + "");
        } else {
            res.end(result + "");
        }
    });
});

/**
 * 检查用户名是否存在
 */
router.get('/checkUserName', function(req, res, next) {

    mysql.query("select * from ps_user where user_name=?", [req.query.userName], function(result) {
        if (result == -1) { //查询失败
            res.end(result + "");
        } else { //result==1查询成功
            if (mysql.getQueryData().length > 0) {
                res.end("1"); //用户名已存在
            } else {
                res.end("0"); //查询成功，但用户不存在
            }
        }
    });
});

/**
 * 处理登录请求
 */
router.post('/doLogin', function(req, res, next) {

    //compile(req.body.userPassWd)
    mysql.query("select * from ps_user where (user_name=? or user_tel=?) and user_passwd=?", [req.body.userName, req.body.userName, req.body.userPassWd], function(result) {
        if (result == -1) { //查询失败
            res.end(result + "");
        } else { //result==1查询成功
            if (mysql.getQueryData().length > 0) {
                //登录成功后检查用户个人文件夹
                // if (!fs.existsSync(userPath + mysql.getQueryData()[0].user_name)) {
                //     fs.mkdirSync(userPath + mysql.getQueryData()[0].user_name)
                // };
                //保存用户session
                req.session.psUser = mysql.getQueryData()[0];
                res.end("1");
            } else {
                res.end("0"); //查询成功，但用户不存在
            }
        }
    });
});

/**
 * 显示登录页面
 */
router.get('/login', function(req, res, next) {

    res.render('login');
});


/**
 * 加密密码
 * @param code
 */
function compile(code) {
    var c = String.fromCharCode(code.charCodeAt(0) * 2 + code.length * 3 - 1);
    for (var i = 1; i < code.length; i++) {
        var flag = code[i].charCodeAt() + (encryp + i); //+ code.charCodeAt(code.length - i);
        c += String.fromCharCode(flag);
    }
    return escape(c);
}

/**
 * 文件目录获取
 * @param filepath
 * @param res
 */
function getDirList(filepath, res) {
    var i = 0;
    var dirlist = new Array();
    var files = fs.readdirSync(filepath);
    files.forEach(function(file) {
        if (fs.existsSync(filepath + file)) {
            if (fs.lstatSync(filepath + file).isDirectory()) {
                //console.log("我是目录", filepath + file);
                dirlist[i++] = filepath + file;
            } else {
                // console.log("我是文件", filepath + file);
            }
        }
    });

    return dirlist;
}

function saveLog(req) {
    log.saveLog("www.cy.wtianyu.com", 3060, req, basePath + "/Log/" + getDate() + "/", "http_node_file.log");
}

function getDate() {
    var date = new Date();
    var time = date.getFullYear() + "-" + (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    return time;
}

module.exports = router;