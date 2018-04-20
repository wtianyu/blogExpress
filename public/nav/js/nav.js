$(function() {
   
});

function initNav(){
	 // nav收缩展开
    $('.nav-item>a').on('click', function() {
        if (!$('.nav').hasClass('nav-mini')) {
            if ($(this).next().css('display') == "none") {
                //展开未展开
                //$('.nav-item').children('ul').slideUp(300);
                $(this).next('ul').slideUp(300);
                $(this).next('ul').slideDown(300);
                //$(this).parent('li').addClass('nav-show');//.siblings('li').removeClass('nav-show');
				$(this).children("i:last-child").addClass('cssTransform');
            } else {
                //收缩已展开
                $(this).next('ul').slideUp(300);
				$(this).children("i:last-child").removeClass('cssTransform');
                //$('.nav-item.nav-show').removeClass('nav-show');
            }
        }
    });
    //nav-mini切换
    $('#mini').on('click', function() {
        if (!$('.nav').hasClass('nav-mini')) {
            //$('.nav-item.nav-show').removeClass('nav-show');
            //$('.nav-item').children('ul').removeAttr('style');
            $('.nav').addClass('nav-mini');
            $('#div_main_code').removeClass('div_main_code_max');
            $('.nav').css('position', "fixed");
        } else {
            $('.nav').removeClass('nav-mini');
            $('.nav').css('position', "absolute");
            $("#div_main_code").addClass('div_main_code_max');
            $('html').animate({ 'scrollTop': '0' }, 500);
        }
    });
}