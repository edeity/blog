$(document).ready(function () {

    var $window = $(window);
    var ACTIVE_CLASS = 'is-active';
    var FIX_CLASS = 'fix';
    var NAV_HEIGHT = 78;
    var $h1 = $('header h1');
    var FIX_HEIGHT = $h1.is(":hidden") ? 0 : $h1.height(); // 180
    var STATIC_HEIGHT = 142;

    // 其他常用工具
    var util = {
        prefix: 'edeity-theme_',
        throttle: function(func, wait) {
            wait = Number(wait) || 0;
            var prevTimeStamp = Date.now(), context;
            var lastTimeoutKey;
            var firCallResult = null; // lodash执行时需要返回第一次执行结果
        
            return function (args) {
                var nowTimeStamp = Date.now();
                context = this;
                var passTime = nowTimeStamp - prevTimeStamp;
                //  第一次执行
                if (typeof lastTimeoutKey === 'undefined') {
                    prevTimeStamp = nowTimeStamp;
                    lastTimeoutKey = -1;
                    firCallResult = func.apply(this, args);
                    return firCallResult;
                } else {
                    // 第N次执行
                    if (passTime < wait) {
                        clearTimeout(lastTimeoutKey);
                        lastTimeoutKey = setTimeout(function() {
                            func.apply(context, args);
                            return firCallResult;
                        }, wait - passTime);
                        return firCallResult;
                    }
                    prevTimeStamp = nowTimeStamp;
                    func.apply(this, args);
                    return firCallResult;
                }
            }
        },
        // 平滑滚动
        scrollTo: function($Node, offset) {
            if (!offset) {
                offset = 0;
            }
            var $html = $("html, body");
            if ($html.animate) {
                isFromClick = true;
                $html.animate({
                    scrollTop: $Node.offset().top - offset + "px"
                }, {
                    duration: 300,
                    easing: "swing",
                    complete: function () {
                        isFromClick = false;
                    }
                });
                return false;
            }
        },
        getItem(key) {
            return window.localStorage.getItem(util.prefix + key);
        },
        setItem(key, value) {
            window.localStorage.setItem(util.prefix + key, value);
        }
    };

    // 暂停播放gif
    var gif = {
        init: function () {
            $('.gif').each(function () {
                var $parent = $("<div class='gif-container'>");
                var $gif = $(this);
                var url = $gif.attr('data-src');
                var $canvas = $('<canvas>');

                var gifWidth = parseInt($gif.attr('width'));
                var gifHeight = parseInt($gif.attr('height'));
                var width = gifWidth;
                var height = gifHeight;

                // 在图片加载过程中保证DOM不会被重排
                var $stop = $('<span class="stop"><span class="iconfont icon-stop"></span></span>').hide();
                var $play = $('<span class="play"><span class="iconfont icon-play"></span></span>').hide();
                var $loading = $('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');
                $gif.before($parent);
                calcGifSize();
                $parent.append($gif).append($play).append($stop).append($loading);

                // 自适应宽和高
                function calcGifSize() {
                    var auto = $gif.attr('auto');
                    var maxWidth = $('.list-item').width();
                    if (width > maxWidth || typeof auto !== 'undefined') {
                        height = maxWidth / gifWidth  * gifHeight;
                        width = maxWidth;
                    }
                    $gif.attr('width', width);
                    $gif.attr('height', height);
                    if (width && height) {
                        $parent.css({
                            width: width,
                            height: height
                        });
                        if ($gif.data('init') === true) {
                            $canvas.attr('width', width).attr('height', height);
                            $canvas[0].getContext('2d').drawImage($gif[0], 0, 0, width, height);
                        }
                    }
                }

                // 加载数据
                $gif.hide();
                $gif.attr('src', url);
                $gif.on('load', function() {
                    $loading.hide();
                    $play.show();
                    if ($gif.data('init') === true) {

                    } else {
                        // 获取首帧
                        $parent.append($canvas);
                        $canvas.attr('width', width).attr('height', height);
                        var img = new Image();
                        img.src = $gif.attr('src');
                        $canvas[0].getContext('2d').drawImage($gif[0], 0, 0,width, height);

                        $gif.hide();

                        var isPlay = false;
                        $play.on('click', function (e) {
                            if (!isPlay) {
                                $canvas.hide();
                                $gif.show();
                                $gif.attr('src', '').attr('src', url);
                                $play.addClass('fadeOut');
                                setTimeout(function(){
                                    $play.hide();
                                    $stop.show().removeClass('fadeOut');
                                }, 500);
                                isPlay = true;
                            }
                        });
                        $stop.on('click', function (e) {
                            if (isPlay) {
                                $canvas.show();
                                $gif.hide();
                                $stop.addClass('fadeOut');
                                setTimeout(function () {
                                    $stop.hide();
                                    $play.show().removeClass('fadeOut');
                                }, 500);
                                isPlay = false;
                            }
                        });
                        $gif.data('init', true)
                    }
       
                });
                // 重新初始化
                $window.resize(calcGifSize);
            });
        }
    };

    // 图片轮播
    var imgList = {
        allLength: 0,
        activeIndex: 0,
        isDuringScroll: false,
        init: function () {
            // 最外层包裹层
            var $imgList = $('.img-list'); 
            var $imgListContainer = $('<div class="list-container">');
            var $allImg = $imgList.find('img');
            var $imgContainer = $('<div class="img-container">');
            var $imgPreviewListContainer = $('<div class="preview-list-container">');
            imgList.allLength = $allImg.length;
            var $imgWrapperList;
            var EACH_WIDTH; // 图层宽度
            var EACH_PREVIEW_WIDTH; // 预览图层宽度

            // 创建大图 & 预览图
            var afterfix = '?x-oss-process=style/preview';
            var $imgPreviewContainer = $('<div class="preview-container">'); // 小图Container
            $allImg.each(function () {

                // 创建大图
                var $imgWrapper = $('<div class="wrapper">');
                var url = $(this).attr('data-src');
                var previewUrl = url + afterfix;
                $imgWrapper.attr('data-src', url); // preview依赖于OSS
                $imgWrapper.css({
                    'background-image': 'url('+ previewUrl + ')', 
                });

                // 添加描述
                if ($(this).attr('data-desc')) {
                    var $imgDesc = $('<span class="desc">').text($(this).attr('data-desc'));
                    $imgWrapper.append($imgDesc);
                }
                $imgContainer.append($imgWrapper);

                // 创建小图
                var $imgPreviewWrapper = $('<div class="preview-wrapper">');
                var $imgPreviewImg = $('<div class="preview">');
                $imgPreviewImg.css({
                    'background-image': 'url('+ previewUrl + ')', 
                });
                $imgPreviewWrapper.append($imgPreviewImg);
                $imgPreviewContainer.append($imgPreviewWrapper);
            });

            // 遮罩层
            var $imgHover = $('<div class="hover">');

            // 进度条
            var $progressContainer = $('<div class="progress">');
            $allImg.each(function () {
                var $tempProgress = $('<div class="each-progress">');
                $progressContainer.append($tempProgress);
            });
            
            // 添加
            $imgList.empty();
            $imgListContainer.append($imgContainer);
            $imgListContainer.append($progressContainer);
            $imgPreviewListContainer.append($imgPreviewContainer);
            $imgList.append($imgListContainer);
            $imgList.append($imgPreviewListContainer);
            $imgList.append($imgHover);

            // 每个图层 
            $imgWrapperList = $('.wrapper');

            // 激活第一个预览图
            var $progressLi = $('.each-progress');
            $progressLi.eq(0).addClass(ACTIVE_CLASS);
            var $imgPreviewList = $(".preview-wrapper");
            $imgPreviewList.eq(0).addClass(ACTIVE_CLASS);
            getPicDicture(0);

            // 计算高度
            calcSize();
            $window.resize(calcSize);

            var startX = -1;
            var endX = -1;
            var OFFSET_DISTANCE = 50;
            $imgHover.on('touchstart', function (e) {
                startX = e.originalEvent.touches[0].pageX;
                endX = -1;
            });
            $imgHover.on('touchmove', function (e) {
                endX = e.originalEvent.touches[0].pageX;
            });
            $imgHover.on('touchend', function () {
                var offset = startX - endX;
                if (offset > 0 && Math.abs(offset) > OFFSET_DISTANCE) {
                    nextPic();
                } else if (offset < 0 && Math.abs(offset) > OFFSET_DISTANCE){
                    prePic();
                }
            });

            // 重新计算部件高度
            function calcSize() {
                EACH_WIDTH = parseInt($imgList.css('width'));
                $imgContainer.css('width', EACH_WIDTH * $allImg.length);
                $imgWrapperList.css('width', EACH_WIDTH);
                EACH_PREVIEW_WIDTH = parseInt($imgPreviewList.css('width'));
                $imgPreviewContainer.css('width', EACH_PREVIEW_WIDTH * $imgPreviewList.length);

                // 最后点击一下目前激活的图片
                if (!imgList.isDuringScroll) {
                    imgJumpTo(imgList.activeIndex, false);
                    progressJumpTo(imgList.activeIndex);
                    previewImgJumpTo(imgList.activeIndex, false);
                }
            }

            // 获得图片详细信息
            function getPicDicture(index) {
                var $currImgWrapper = $imgWrapperList.eq(index);
                if ($currImgWrapper.length > 0 && $currImgWrapper.attr('data-load') !== 'true') {
                    var url = $currImgWrapper.attr('data-src');
                    $currImgWrapper.attr('data-load', 'true');
                    // 等真实图片加载完毕后，再渲染
                    var img = new Image();
                    img.src = url;
                    img.onload = function() {
                        $currImgWrapper.css({
                            'background-image': 'url('+ url + ')',
                        })
                    }
                }
            }
            function prePic() {
                if (!imgList.isDuringScroll) {
                    imgList.isDuringScroll = true;
                    imgList.activeIndex--;
                    var i = imgList.activeIndex = imgList.activeIndex < 0 
                        ? imgList.allLength - 1 : imgList.activeIndex;
                    imgJumpTo(i);
                    progressJumpTo(i);
                    previewImgJumpTo(i);
                }
            }
            function nextPic() {
                if (!imgList.isDuringScroll) {
                    imgList.isDuringScroll = true;
                    imgList.activeIndex++;
                    var i = imgList.activeIndex = imgList.activeIndex > imgList.allLength - 1 
                        ? 0 : imgList.activeIndex;
                    imgJumpTo(i);
                    progressJumpTo(i);
                    previewImgJumpTo(i);
                }
            }
            // 跳转到固定的图片
            $imgPreviewList.on('click', function () {
                if (!imgList.isDuringScroll) {
                    var i = imgList.activeIndex = $imgPreviewList.index($(this));
                    imgJumpTo(i);
                    previewImgJumpTo(i);
                }
            });
            function imgJumpTo(index, stopAnimate) {
                getPicDicture(index);
                var left = index * EACH_WIDTH + "px";
                if (stopAnimate !== false) {
                    $($imgListContainer).animate({
                        scrollLeft: left
                    }, {
                        duration: 500,
                        easing: "swing",
                        complete: function () {
                            imgList.isDuringScroll = false;
                        }
                    });
                } else {
                    $($imgListContainer).scrollLeft(index * EACH_WIDTH);
                }
            }
            function progressJumpTo(index) {
                $progressLi.removeClass(ACTIVE_CLASS);
                $progressLi.eq(index).addClass(ACTIVE_CLASS);
            }
            function previewImgJumpTo(index, stopAnimate) {
                var scrollLeft = index * EACH_PREVIEW_WIDTH;
                // 对滚动图层进行偏移
                if (imgList.activeIndex > index) {
                    scrollLeft += EACH_PREVIEW_WIDTH * 2;
                } else {
                    scrollLeft -= EACH_PREVIEW_WIDTH * 2;
                }
                $imgPreviewList.removeClass(ACTIVE_CLASS);
                var $currPreviewImg = $imgPreviewList.eq(index);
                $currPreviewImg.addClass(ACTIVE_CLASS);
                if (stopAnimate !== false) {
                    $($imgPreviewListContainer).animate({
                        scrollLeft: scrollLeft + "px"
                    }, {
                        duration: 500,
                        easing: "swing",
                        complete: function () {
                            imgList.isDuringScroll = false;
                        }
                    });
                } else {
                    $($imgPreviewListContainer).scrollLeft(scrollLeft);
                }
            }
        }
    };

    // 导航栏
    var toc = {
        init: function() {
            var $navBar = $('#nav-bar');
            var $headLink = $('.head-link');
            var $linkContainer = $('.link-container');
            var $scrollContainer = $navBar.find('ol.toc');
            var throttleScroll = util.throttle(handleScroll, 32);

            syncLink('.toc-item', null, function($activeLink) {
                var linkTop = $activeLink.position().top;
                // 移动到可非可视区时，重新跳转到可视区
                const containerHeight = $scrollContainer.innerHeight();
                if (linkTop > containerHeight || linkTop < 0) { 
                    $($scrollContainer).animate({
                        scrollTop: $activeLink[0].offsetTop - containerHeight / 2 + "px"
                    }, {
                        duration: 100,
                        easing: "swing",
                        complete: function () {}
                    });
                }
            }, {
                offset: NAV_HEIGHT
            });
            throttleScroll();

            // 变更toc状态
            $window.scroll(function() {
                throttleScroll();
            });

            function handleScroll() {
                var currHeight = $window.scrollTop();
                // toc
                if (currHeight >= FIX_HEIGHT) {
                    $headLink.addClass(FIX_CLASS);
                    $navBar.addClass(FIX_CLASS);
                    $linkContainer.addClass(FIX_CLASS);
                } else if (currHeight <= STATIC_HEIGHT) {
                    $headLink.removeClass(FIX_CLASS);
                    $navBar.removeClass(FIX_CLASS);
                    $linkContainer.removeClass(FIX_CLASS);
                }
            }

            // 左侧toc列表
            function syncLink(customNavSelector, customActiveClass, activeCallback, options) {
                var offset = options.offset;
                var ACTIVE_CLASS = customActiveClass || 'is-active';
                var navSelector = customNavSelector || '.nav-link';
                var desPosArray = [];
                var currActiveIndex = -1;
                var $navLink = $(navSelector);
                var isFromClick = false; // 点击跳转不作监听
                // 录入位置信息
                $navLink.each(function () {
                    var navLinkHref = $(this).children('.toc-link').attr('href');
                    var navAimId = navLinkHref.substr(1, navLinkHref.length);
                    desPosArray.push($('#' + navAimId).offset().top - offset);
                });
                desPosArray.push($(document).height());
                // 替换浏览器默认点击行为
                $navLink.on('click', function (e) {
                    console.log($(this));
                    var navLinkHref = $(this).children('.toc-link').attr('href');
                    var navAimId = navLinkHref.substr(1, navLinkHref.length);
                    util.scrollTo($('#' + navAimId), offset);
                    if (!$(this).hasClass(ACTIVE_CLASS)) {
                        $navLink.removeClass(ACTIVE_CLASS);
                        $(this).addClass(ACTIVE_CLASS);
                    }
                    e.stopPropagation();
                });
                var throttleLinkScroll = util.throttle(handleLinkScroll, 100);
                throttleLinkScroll();
                // 监听屏幕滚动情况
                var i = 0;
                $window.scroll(function () {
                    throttleLinkScroll();
                });
                function handleLinkScroll() {
                    if (isFromClick) {
                        return false;
                    }
                    var currTop = $(document).scrollTop();
                    currTop = typeof currTop !== 'undefined' ? currTop : window.pageYOffset;
                    desPosArray.some(function (key, index) {
                        if (currTop + 1 < key) {
                            var activeIndex = index - 1;
                            if (activeIndex !== currActiveIndex && activeIndex >= 0) {
                                var $activeLink = $navLink.eq(activeIndex);
                                if ($activeLink && !$activeLink.hasClass(ACTIVE_CLASS)) {
                                    $navLink.removeClass(ACTIVE_CLASS);
                                    $activeLink.addClass(ACTIVE_CLASS);
                                }
                                currActiveIndex = activeIndex;
                                $.isFunction(activeCallback) && activeCallback($activeLink, currActiveIndex);
                            }
                            return true;
                        }
                        return false;
                    })
                }
            }
        }
    };

    // 右侧侧边栏
    var menuBar = {
        isMenuHide: false,
        $linkUl : $('ul.some-link'),
        $linkIcon : $('a#link-list i'),
        init: function () {
            menuBar.initEvent();
        },
        initEvent: function () {
            // 点击隐藏(已废弃)
            // $('#link-list').on('click', function () {
            //     var animateSecond = 200;
            //     if (menuBar.isMenuHide) {
            //         menuBar.showMenuList(animateSecond);
            //     } else {
            //         menuBar.hideMenuList(animateSecond)
            //     }
            // });
            // 切换日间/夜间模式（@see head.jade）
            var $lightBtn = $('#light-or-not');
            var $html = $('html');
            var nightClassName = 'night';
            var transitionAllColorClassName = 'transition-all-color';
            $lightBtn.on('click', function() {
                $html.addClass(transitionAllColorClassName);
                if ($html.hasClass(nightClassName)) {
                    $html.removeClass(nightClassName);
                    util.setItem('theme', 'light');
                } else {
                    $html.addClass(nightClassName);
                    util.setItem('theme', 'night');
                }
                setTimeout(function() {
                    $html.removeClass(transitionAllColorClassName);
                }, 500)
            });
            // 点击返回顶部
            var $topBtn = $("#up-to-top");
            $topBtn.on('click', function () {
                util.scrollTo($("body"));
            });
            // 初始化页面时，也应该出现
            var afterScrollTop = $(this).scrollTop();
            if (afterScrollTop > 400) {
                $topBtn.show();
            }
            // 滚动到顶部时消失
            $window.on('scroll', function () {
                var afterScrollTop = $(this).scrollTop();
                if (afterScrollTop > 400) {
                    $topBtn.show();
                } else {
                    $topBtn.hide();
                }
            });
        },
    };

    // 左侧菜单栏-仅移动端用到
    var slideBar = {
        init: function() {
            var NO_SCROLL = 'no-scroll';
            var $toolbar =  $('.toolbar');
            var $btn = $toolbar.find('.icon-menu');
            // add
            $btn.on('click', function(e) {
                $toolbar.addClass(ACTIVE_CLASS);
                $('.head-link').addClass(ACTIVE_CLASS);
                $('body').addClass(NO_SCROLL);
                e.stopPropagation();
            });
            // remove
            $toolbar.on('click', function() {
                $toolbar.removeClass(ACTIVE_CLASS);
                $('.head-link').removeClass(ACTIVE_CLASS);
                $('body').removeClass(NO_SCROLL);
            });
            var throttleToolBar = util.throttle(handleToolBar, 100);
            throttleToolBar();
            slideBar.acitveLink();
            $window.on('scroll', function () {
                throttleToolBar();
            });
            function handleToolBar() {
                var afterScrollTop = $window.scrollTop();
                if (afterScrollTop > 200) {
                    $toolbar.addClass(FIX_CLASS)
                } else {
                    $toolbar.removeClass(FIX_CLASS);
                }
            }
        },
        // 激活当前页面
        acitveLink: function() {
            var $btns = $('.head-link .btn');
            var path = window.location.pathname;
            $btns.each(function() {
                var isMatch = $(this).attr('href') === path;
                if (isMatch) {
                    $(this).addClass(ACTIVE_CLASS);
                }
            })
        }
    };

    // 效果,添加小名言
    // var aphorism = {
    //     aphorismList: [
    //         "Talk less, write more.",
    //         "God helps those who help themselves.",
    //         "Youth is not a period of time, it is a state of mind.",
    //         "Talk is cheap, show me the code.",
    //         "I am a slow walker, but i never walk backwards.",
    //         "Stay hungry, stay foolish.",
    //         "Choose what you love,love what you choose.",
    //         "Actions speak louder than words.",
    //         "After all,tomorrow is another day",
    //         "For the shadow of lost knowledge at least protects you from many Iillusions.",
    //         "You're uinique, nothing can replace you.",
    //         "True mastery of any skill takes a lifetime.",
    //         "The first wealth is health .",
    //         "Where there is life, there is hope.",
    //         "If you fail, don't forget to learn your lesson.",
    //         "If winter comes , can spring be far behind ?",
    //         "Don't give up and don't give in.",
    //         "To choose time is to save time .",
    //         "A chain is no stronger than its weakest link.",
    //         "If you don't aim high you will never hit high.",
    //         "Every noble work is at first impossible.",
    //         "Energy and persistence conquer all things."
    //     ],
    //     init: function () {
    //         var titleCode = $('.post-title').text().charCodeAt(0);
    //         var aphorismDiv = $('.aphorism');
    //         var aphorismLen = aphorism.aphorismList.length;
    //         aphorismDiv.each(function (i) {
    //             $(this).text(aphorism.aphorismList[titleCode % aphorismLen]);
    //         });
    //     }
    // };

    // 插件系统
    // var commont = {
    //     init: function() {
    //         var $comment = $('#comment');
    //         if ($comment.length !== 0) {
    //             var $contentMain = $('#content-main');
    //             $comment.remove();
    //             $contentMain.append($('<div id="comment">'));
    //             if (typeof Gitment !== 'undefined') {
    //                 var gitment = new Gitment({
    //                     // id: '页面 ID', // 可选。默认为 location.href
    //                     owner: 'edeity',
    //                     repo: 'blog',
    //                     oauth: {
    //                     client_id: '7c4bb5ae1a21212d7a21',
    //                     client_secret: '265378a8e0ce2cb7a01aff285e4b68ced6ef9cc6',
    //                     },
    //                     perPage: "20",
    //                 });
    //                 gitment.render('comment')
    //             }
    //         }
    //     }
    // };

    // 弹出提示
    var dataTitle = {
        preTimeOutKey: null,
        init: function() {
            // 创建
            var $dataTitle = $('body').find('#data-title');
            if ($dataTitle.length > 0) {
                $dataTitle.txt(eachTitle);
            } else {
                $dataTitle = $('<div>').attr({
                    id: 'data-title',
                    class: 'pop-title'
                });
                $('body').append($dataTitle);
            }
            // 添加监听事件
            $('.pop').hover(function() {
                var top = $(this).offset().top;
                var width = $(this).outerWidth();
                var height = $(this).outerHeight();
                var left = $(this).offset().left;
                var title = $(this).attr('data-title');
                var direction = $(this).attr('data-direction');
                $dataTitle.html(title);
                var titleWidth = $dataTitle.outerWidth();
                var titleHeight = $dataTitle.outerHeight();
                $dataTitle.removeClass('left').removeClass('right')
                .removeClass('top').removeClass('bottom');
                $dataTitle.addClass(direction);
                switch(direction) {
                    case 'right': { 
                        top = top + height / 2;
                        left = left + width + titleWidth / 2 + 10; 
                        break; 
                    }
                    case 'left': { 
                        top = top + height / 2;
                        left = left - titleWidth / 2 - 10 ; 
                        break; 
                    }
                    case 'bottom': { 
                        top = top + height + titleHeight / 2 + 10; 
                        left = left + width / 2;
                        break; 
                    }
                    case 'top': { 
                        top = top - titleHeight / 2 - 10; 
                        left = left + width / 2;
                        break;
                    }
                    default: { 
                        break; 
                    }
                }
                $dataTitle.css({
                    top: top,
                    left: left
                });
                $dataTitle.fadeIn();
            }, function() {
                $dataTitle.hide();
            });
        }
    };

    var beauty = {
        init: function() {
            // loading样式
            $('a').on('click', function (e) {
                // 非导航链接才会触发
                if (!$(this).hasClass('toc-link')) {
                    var href = $(this).attr('href');
                    if (href && !$(this).attr('target')) {
                        $('.loading').addClass(ACTIVE_CLASS);
                        window.location = href;
                        e.preventDefault();
                    }
                }
            });

             // 美化window样式
             if (navigator.platform === 'Windows' || navigator.platform === 'Win32') {
                $('body').addClass('win');
            }

            // 双击可放大
            document.querySelector( '.article' ).addEventListener('dblclick', function( event ) {
                event.preventDefault();
                zoom.to({ element: event.target, scale: 1.5 });
            });
        }
    };
    
    // 安全相关脚本
    var safe = {
        init: function() {
            safe.inSafeFrame();
        },
        // 防止页面嵌套
        inSafeFrame: function() {
            if (window.top !== window && document.referrer){
                var a = document.createElement("a");
                a.href = document.referrer;
                var host = a.hostname;

                var endsWith = function (str, suffix) {
                    return str.indexOf(suffix, str.length - suffix.length) !== -1;
                };
                if (!endsWith(host, '.edeity.me') && !endsWith(host, 'localhost')){
                    top.location.href = "https://blog.edeity.me";
                }
            }
        }
    };

    // 一年时间剩余
    var timeLeft = {
        init: function() {
            var $timeLeft = $('.time-left');
            var date = new Date();
            if ($timeLeft) {
                var $time = $('<div class="time">');
                var $timeTag = $('<div class="time-tag">');
                var totalDay = timeLeft.isLeapYear() ? 366 : 365;
                var percent = Math.floor(timeLeft.getDayInYear() / totalDay * 100);
                var width = $timeLeft.width();
                setTimeout(function() {
                    $time.css('width', percent + '%');
                    var time = (date.getMonth() + 1)+ '月' + date.getDate() + '日';
                    $timeTag.text(time);
                    let left = width * percent / 100 - 60;
                    if (left < 0) {
                        left = 0;
                    }
                    $timeTag.css('left', left);
                }, 100);
                $time.append($timeTag);
                $timeLeft.append($time);
            }
        },
        isLeapYear: function() {
            var date = new Date();
            var year = date.getFullYear();
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },
        getDayInYear: function() {
            var dateArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            var date = new Date();
            var day = date.getDate();
            var month = date.getMonth();
            var result = 0;
            for ( var i = 0; i < month; i++) {
                result += dateArr[i];
            }
            result += day;
            //判断是否闰年
            if (month > 1 && timeLeft.isLeapYear()) {
                result += 1;
            }
            return result;
        }
    };


    // workbox3接口
    var pwa = {
        init: function() {
            const HTML_FAIL_URL = '/public/html/offline.html';
            const IMG_FAIL_URL = '/public/img/404.png';
            // workbox尝试
            try {
                function addToCache(urls) {
                    if (window.caches) {
                        let myCache = window.caches.open('my-cache');
                        // 避免使用await
                        if (!myCache) {
                            setTimeout(function () {
                                myCache.addAll(urls);
                            }, 100);
                        }
                    }
                }
                window.addEventListener('load', function () {
                    addToCache([HTML_FAIL_URL, IMG_FAIL_URL]);
                });

                if (navigator.serviceWorker != null) {
                    const version = 1;
                    navigator.serviceWorker.register('/sw.v' + version + '.js').then(function (reg) {});
                }

                pwa.offlineTips();
            } catch(e) {
                console.error('当前浏览器不支持pwa');
            }
        },
        offlineTips: function() {
            var $offLineContainer = $('<div class="offline">');
            $offLineContainer.text('无法连接网络');
            $('footer').append($offLineContainer);
            if (navigator.onLine === false) {
                $offLineContainer.fadeIn();
            }
            window.addEventListener('online',  function () {
                $offLineContainer.slideUp();
            });
            window.addEventListener('offline', function () {
                $offLineContainer.slideDown();
            });

        } 
    };

    // 初始化工作
    gif.init();
    imgList.init();
    toc.init();
    menuBar.init();
    // aphorism.init();
    dataTitle.init();
    // commont.init();
    beauty.init();
    safe.init();
    // pwa.init();
    slideBar.init();
    timeLeft.init();
});