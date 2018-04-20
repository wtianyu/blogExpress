/**
 * Created by wy on 2017/6/19.
 */
/**
 * Created by wy on 2016/9/1.
 */

const mysql_config = require('./config');
const mysql = require('mysql');
var data = [];

// var userId = new Date().getTime() +"100"+(parseInt(Math.random()*89)+10);
// var userName="姓名"+new Date().getTime();
// var user_pass = compile("wangyu1993");
// console.log(user_pass);
// var user_tel = "15800388603";

/**
 * 操作数据
 * @param sql
 * @param data
 */
exports.execute = function execute(sql,data,callback){
    clearQueryData();
    var mysql_connect = mysql.createConnection(mysql_config);
    mysql_connect.connect(function (err) {
        if(!err){
            console.log('连接数据库成功');
            //var data = [user.userId,user.userName,user.userPasswd,user.userTel];
            //var sql = "insert into ps_user set user_id=?,user_name=?,user_passwd=?,user_tel=?";
            mysql_connect.query(sql,data,function(err,result){
                if(err){
                    console.log("操作失败"+err);
                    callback(-1);
                }else{
                    console.log("操作成功");
                    callback(1);
                }
                mysql_connect.end();
            });
        }else{
            console.log('连接数据库失败');
        }
    });
}

/**
 * 查询数据
 * @param callBack
 */
exports.query = function query(sql,data,callBack){
    clearQueryData();
    var mysql_connect = mysql.createConnection(mysql_config);
    mysql_connect.connect(function (err) {
        if(!err){
            console.log('连接数据库成功');
            mysql_connect.query(sql,data,function (err,result) {
                if(err){
                    console.log("查询失败"+err);
                    callBack(-1);
                }else{
                    setQueryData(result);
                    callBack(1);
                }
                mysql_connect.end();
            });
        }else{
            console.log('连接数据库失败');
        }
    });
}

function setQueryData(result){
    for(var i=0;i<result.length;i++){
        data[i] = result[i];
    }
}

function clearQueryData(){
    data = [];
}

exports.getQueryData = function getQueryData(){
    return data;
}


