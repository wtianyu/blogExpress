/**
 * 设置div的class为wy_div_showbox
 * 初始化自定义弹窗
 * divId:div的id
 * width:div的宽度
 * height:div的height
 * title:div标题
 * scroll:x or y or xy or auto or other
 * drag:true为可拖拽，false为不可拖拽
 * time：div出现的动画时间
 */
var mouseListener = false; //是否监听鼠标移动事件
var wyShowDivDialog = function(divId, width, height, title, scroll, dragAble, time) {
    var box = 300;
    var th = $(window).scrollTop() + $(window).height() / 1.6 - box;
    var h = document.body.clientHeight;
    var rw = $(window).width() / 2 - box;

    //初始化
    if ($(".wy_div_mask").length == 0) {
        //div的遮罩层
        var divMask = document.createElement("div");
        divMask.id = "wy_div_mask";
        divMask.className = "wy_div_mask";
        document.body.appendChild(divMask);
	
        //重新排布div内容
        var divHtml = $("#" + divId).html();
        //设置div标题
        var titleHead = ' <div class="canDrag"><h2>' + title + '<a class="wy_div_close" id="wy_div_close_' + divId + '" href="javascript:void(0)">关闭</a></h2></div>';
        $("#" + divId).html("");
	$("#" + divId).append(titleHead);
        //设置div内容
        var divContent = '<div class="wy_div_main">' + divHtml + '</div>';
        $("#" + divId).append(divContent);
	//console.log($("#" + divId).html());
        //设置div的下拉框
        if (scroll == 'y') {
            $(".wy_div_main").css("overflow-y", "scroll");
        } else if (scroll == 'x') {
            $(".wy_div_main").css("overflow-x", "scroll");
        } else if (scroll == 'xy') {
            $(".wy_div_main").css("overflow", "scroll");
        } else if (scroll == 'auto') {
            $(".wy_div_main").css("overflow", "auto");
        }
        $(".wy_div_main").css("width", width - 20);

        $("#wy_div_close_" + divId).click(function() {
            $("#" + divId).animate({
                top: 0,
                opacity: 'hide',
                width: 0,
                height: 0,
                right: 0
            }, time);
            mouseListener = false;
            $(".wy_div_mask").css("display", "none");
        });

    }
    //设置div的拖拽
    if (dragAble) {
        mouseListener = true;
        initDrag();
    }

    //动画效果
    $("#" + divId).animate({
        top: th,
        opacity: 'show',
        width: width,
        height: height,
        right: rw
    }, time);

    $(".wy_div_mask").css({
        display: "block",
        height: $(document).height()
    });


};


function initDrag() {
    $(document).mousemove(function(e) {
        if (!!this.move && mouseListener) {
            var posix = !document.move_target ? { 'x': 0, 'y': 0 } : document.move_target.posix,
                callback = document.call_down || function() {
                    $(this.move_target).css({
                        'top': e.pageY - posix.y,
                        'left': e.pageX - posix.x
                    });
                };
            callback.call(this, e, posix);
        }
    }).mouseup(function(e) {
        if (!!this.move && mouseListener) {
            var callback = document.call_up || function() {};
            callback.call(this, e);
            $.extend(this, {
                'move': false,
                'move_target': null,
                'call_down': false,
                'call_up': false
            });
        }
    });

    var $box = $('.wy_div_showbox .canDrag').mousedown(function(e) {
        if (mouseListener) {
            var $p = $(this).parent();
            var $pp = $p[0];
            var offset = $p.offset();
            $pp.posix = { 'x': e.pageX - offset.left, 'y': e.pageY - offset.top };
            $.extend(document, { 'move': true, 'move_target': $pp });
        }
    });
    $('.wy_div_showbox').bind({
        'mousemove': function(e) {
            if (mouseListener) {
                $(this).css({ cursor: "default" });
                var offset = $(this).offset(),
                    resize = true;
                var x = e.clientX,
                    y = e.clientY,
                    t = offset.top,
                    l = offset.left,
                    w = $(this).width(),
                    h = $(this).height(),
                    ww = $('.canDrag').height(),
                    b = 10;

                if (y < (t + ww) && x > l && x < (l + w)) {
                    $(this).css({ cursor: "move" });
                    $(this).unbind("mousedown");
                }
            } else {
                $(this).css({ cursor: "default" });
            }
        },
        "mouseup": function() {
            if (mouseListener) {
                $(this).unbind("mousedown");
            }
        }
    });
}