var express = require('express');
var mysql = require('./../moudle/mysqlUtil.js');
var log = require('./../moudle/log.js');
var router = express.Router();
const basePath = "/home/node/PsExpress";

/* GET users listing. */

router.get('/search', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    res.render('search');
});
router.get('/index', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    var node_id = '';
    mysql.query("select id,title,catagory_id from ps_node where user_id = ? and valid=1 order by update_date desc,create_date desc;select * from ps_node_catagory where valid= 1 and catagory_user_id = ? order by length(catagory_name)", [req.session.psUser.user_id, req.session.psUser.user_id], function(result) {
        if (result == -1) { //查询失败
            res.render('node_show', { node_id: node_id, nodeList: [], catagoryList: [] });
        } else { //result==1查询成功
            if (mysql.getQueryData().length > 0) {
                var nodeList = mysql.getQueryData()[0];
                var catagoryList = mysql.getQueryData()[1];
                if (nodeList.length > 0) {
                    node_id = nodeList[0].id;
                }
                console.log(catagoryList);
                res.render('node_show', { node_id: node_id, nodeList: nodeList, catagoryList: catagoryList });
            } else { //查询成功，但该用户还没有笔记
                res.render('node_show', { node_id: node_id, nodeList: [], catagoryList: [] });
            }
        }
    });

});

router.get('/add', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    var nodeId = req.query.nodeId;
    mysql.query("select * from ps_node_catagory where valid= 1 and catagory_user_id = ? order by length(catagory_name)", [req.session.psUser.user_id], function(result) {
        if (result == -1) { //查询失败
            res.render('node_add', { node_catagory: [], nodeId: nodeId });
        } else { //result==1查询成功
            if (mysql.getQueryData().length > 0) {
                var node_catagory = mysql.getQueryData();
                res.render('node_add', { node_catagory: node_catagory, nodeId: nodeId });
            } else {
                res.render('node_add', { node_catagory: [], nodeId: nodeId });
            }
        }
    });
});

router.get('/catagoryManage', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    res.render('catagory_manage');
});


router.get('/addCatagory', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login'); //用户未登录
    }
    var catagory_id = req.query.catagory_id;
    var catagory_id_parent = req.query.catagory_id_parent;
    var catagory_name = req.query.catagory_name;

    if (catagory_id == null || catagory_id == "" || catagory_id == "undefined" || catagory_id == undefined) {
        catagory_id = new Date().getTime() + "230" + (parseInt(Math.random() * 89) + 10);
        data = [catagory_id, "9999", catagory_name, req.session.psUser.user_id, catagory_id_parent, new Date(), 1];
        sql = "insert into ps_node_catagory set catagory_id=?,catagory_type=?,catagory_name=?,catagory_user_id=?,catagory_id_parent=?,catagory_create_date=?,valid=?";
    } else {
        sql = "update ps_node_catagory set catagory_name=?,catagory_update_date=? where catagory_id=? and catagory_user_id=?";
        data = [catagory_name, new Date(), catagory_id, req.session.psUser.user_id];
    }
    console.log(data);
    console.log(sql);
    mysql.execute(sql, data, function(result) {
        if (result == -1) {
            res.end(result + "");
        } else {
            res.end(catagory_id + "");
        }
    });
});



router.get('/moveCatagory', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login'); //用户未登录
    }
    try {
        var catagory_id_src = req.query.catagory_id_src;
        var catagory_id_des = req.query.catagory_id_des;
        sql = "update ps_node_catagory set catagory_id_parent=?,catagory_update_date=? where catagory_id=? and catagory_user_id = ?";
        data = [catagory_id_des, new Date(), catagory_id_src, req.session.psUser.user_id];
        console.log(data);
        console.log(sql);
        mysql.execute(sql, data, function(result) {
            if (result == -1) {
                res.end(result + "");
            } else {
                res.end("1");
            }
        });
    } catch (err) {
        console.log(err);
        res.end(-1 + "");
    }
});


router.get('/deleteCatagory', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login'); //用户未登录
    }
    var catagory_id = req.query.catagory_id;

    if (catagory_id == null || catagory_id == "" || catagory_id == "undefined" || catagory_id == undefined) {
        res.end("0");
    } else {
        sql = "delete  from ps_node_catagory where (catagory_id=? or catagory_id_parent = ?) and catagory_user_id = ?";
        data = [catagory_id, catagory_id, req.session.psUser.user_id];
    }
    console.log(catagory_id);
    console.log(sql);
    mysql.execute(sql, data, function(result) {
        if (result == -1) {
            res.end(result + "");
        } else {
            res.end(result + "");
        }
    });
});





router.post('/getCatagoryNodes', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    var nodeId = req.query.nodeId;
    var catagoryRoot = "[{id:'000000000000000000',name:'笔记类别',isParent:false,childOuter:false,drag:false}]";
    mysql.query("select * from ps_node_catagory where valid= 1 and catagory_user_id = ? order by length(catagory_name)", [req.session.psUser.user_id], function(result) {
        if (result == -1) { //查询失败
            res.end(catagoryRoot);
        } else { //result==1查询成功
            if (mysql.getQueryData().length > 0) {
                var node_catagory = mysql.getQueryData();
                console.log(node_catagory)
                catagoryRoot = "[{id:'000000000000000000',name:'笔记类别',open:true,isParent:true,childOuter:false,drag:false}";
                for (var i = 0; i < node_catagory.length; i++) {
                    catagoryRoot += ",{id:'" + node_catagory[i].catagory_id + "',name:'" + node_catagory[i].catagory_name + "',pId:'" + node_catagory[i].catagory_id_parent + "'}";
                }
                catagoryRoot += "]";
                console.log(catagoryRoot);
                res.end(catagoryRoot);
            } else {
                res.end(catagoryRoot);
            }
        }
    });
});

router.get('/nextNode', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    var jsonRes = {};
    var number = req.query.number;
    mysql.query("select * from ps_node where user_id = ? and number <? and valid=1  order by update_date desc,create_date desc limit 0,1", [req.session.psUser.user_id, number], function(result) {
        if (result == -1) { //查询失败
            jsonRes.code = result;
            jsonRes.content = '';
            res.end(JSON.stringify(jsonRes));
        } else { //result==1查询成功
            if (mysql.getQueryData().length > 0) {
                jsonRes.code = 1;
                jsonRes.content = mysql.getQueryData()[0];
                res.end(JSON.stringify(jsonRes));
            } else { //查询成功，但该用户还没有笔记
                jsonRes.code = 0;
                jsonRes.content = '';
                res.end(JSON.stringify(jsonRes));
            }
        }
    });
});

router.get('/showNode', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    var jsonRes = {};
    var id = req.query.id;
    mysql.query("select * from ps_node where id = ? and valid=1 and user_id = ?", [id, req.session.psUser.user_id], function(result) {
        if (result == -1) { //查询失败
            jsonRes.code = result;
            jsonRes.content = '';
            res.end(JSON.stringify(jsonRes));
        } else { //result==1查询成功
            if (mysql.getQueryData().length > 0) {
                jsonRes.code = 1;
                jsonRes.content = mysql.getQueryData()[0];
                res.end(JSON.stringify(jsonRes));
            } else { //查询成功，但没有记录
                jsonRes.code = 0;
                jsonRes.content = '';
                res.end(JSON.stringify(jsonRes));
            }
        }
    });
});


router.get('/getNodeList', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login');
    }
    var jsonRes = {};
    var sql = "";
    var data = [];
    var catagoryId = req.query.catagoryId;
    var title = req.query.title;
    if (title == null) {
        sql = "select id,title,left(content,2000) content,update_date,create_date,order_import from ps_node where catagory_Id = ? and user_id = ? and valid=1 order by order_import desc,update_date desc,create_date desc";
        data = [catagoryId, req.session.psUser.user_id];
    } else {
        sql = "select id,title,left(content,2000) content,update_date,create_date,order_import from ps_node where title like ? and user_id = ? and valid=1 order by order_import desc,update_date desc,create_date desc";
        data = ["%" + title + "%", req.session.psUser.user_id];
    }
    console.log("catagoryId=" + catagoryId);
    console.log("title=" + title);
    mysql.query(sql, data, function(result) {
        if (result == -1) { //查询失败
            jsonRes.code = result;
            jsonRes.content = '';
            res.end(JSON.stringify(jsonRes));
        } else { //result==1查询成功
            if (mysql.getQueryData().length > 0) {
                jsonRes.code = 1;
                jsonRes.content = mysql.getQueryData();
                res.end(JSON.stringify(jsonRes));
            } else { //查询成功，但没有记录
                jsonRes.code = 0;
                jsonRes.content = '';
                res.end(JSON.stringify(jsonRes));
            }
        }
    });
});

router.post('/doAdd', function(req, res, next) {

    if (!req.session.psUser) {
        res.render('login'); //用户未登录
    }
    var nodeId = req.body.node_id;
    var date = new Date();
    var data = [];
    var sql = "";
    console.log("nodeId=" + req.body.node_id);
    if (nodeId == "") {
        nodeId = new Date().getTime() + "200" + (parseInt(Math.random() * 89) + 10);
        data = [nodeId, req.body.title, req.body.content, date, req.session.psUser.user_id, req.body.node_catagoty, 1, date];
        sql = "insert into ps_node set id=?,title=?,content=?,create_date=?,user_id=?,catagory_id=?,valid=?,update_date=?";
    } else {
        sql = "update ps_node set title=?,content=?,catagory_id=?,update_date=? where id=? and user_id=?";
        data = [req.body.title, req.body.content, req.body.node_catagoty, new Date(), nodeId, req.session.psUser.user_id];
    }

    mysql.execute(sql, data, function(result) {
        if (result == -1) {
            res.end(result + "");
        } else {
            res.end(result + "");
        }
    });
});

function saveLog(req) {
    log.saveLog("www.cy.wtianyu.com", 3060, req, basePath + "/Log/" + getDate() + "/", "http_node_file.log");
}

function getDate() {
    var date = new Date();
    var time = date.getFullYear() + "-" + (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    return time;
}

module.exports = router;