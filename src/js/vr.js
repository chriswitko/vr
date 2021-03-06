(function($, W){
    
if (top != self) { top.location.replace(self.location.href); }

var $win = $(W),
    $body = $('body'),
    $doc =$(document);

var VR = {
    ensureValidProtocol: function($el, evt) {
        var protocol = $el.val().substring(0,4),
        $parent = $el.parent(),
        regex = new RegExp(":\/\/");
        $parent.removeClass('error');
        if(regex.test($el.val()) && protocol != 'http') {
            $el.focus().select();
            $parent.addClass('error');
            evt.stopPropagation();
            evt.preventDefault();
        }
    },
    getParameterByName: function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    init:function(){ 
        delete this.init;
        if(this.hideOnMobile()){
            return;    
        }
        this.$frame = $('#vrFrame');
        this.device = this.getDeviceFromCookie(this.getDeviceFromUrl());
        this.initUA();
        initEvts();
        this.toggleSiteLoader(true);
        this.parseUrl();
        this.parseAddrBar();
        this.restore(this.device);
    },
    hideOnMobile:function(){
        var mobi = this.getParameterByName('mobi'),
            url = this.getParameterByName('url'),
            isMobi = /mobile/i.test(navigator.userAgent);

        if(mobi ==='0' && isMobi && url.length>0){
            location.href = url;
            return true;
        }
        return false;
    }, 
    parseUrl:function(reload){
        // parse url parameter
        var urlParam = this.url = this.getParameterByName('url'),
            vrt = new Date().getTime(),
            ua = this.device.ua;

        if(urlParam.length > 0) {
            if(urlParam.substr(0,4) != 'http') {
                urlParam = 'http://' + urlParam;
            }
            this.url = urlParam;
            $('[name="url"]').val(this.url);

            if(reload === true){
                if(urlParam.indexOf('?')>0){
                    urlParam = urlParam + '&vrt='+ vrt;
                }else{
                    urlParam = urlParam + '?vrt='+ vrt;
                }
            }

            this.showLoader();
            $('#btnVRClose').attr('href', urlParam);
            //this.setUA(W, ua);
            this.setUA(this.$frame[0].id, ua);
            this.$frame.attr('src', urlParam);
            $('#vrPage').removeClass('hidden');
        } else {
            $('#indexPage').removeClass('hidden');
        }
    },
    parseAddrBar: function(){
        var addrBar = this.getParameterByName('addrbar'),
            $toolbar = $('#toolbar');
        addrBar = addrBar === '1' ? '1':'0';
        document.getElementById('iptAddrBar').value = addrBar;
        if(addrBar === '1'){
            this.toggleAddressBar();
        }        
    },
    getDeviceFromUrl: function(){
        var device = this.getParameterByName('device');
        document.getElementById('iptDevice').value = device;
        return device;
    },
    getDeviceFromCookie:function(userDevice){
        var device = $.cookie('vr-device'),
            orient = $.cookie('vr-orientation');

        device = userDevice === '' ? device : userDevice;

        device = device || 'iphone5'; 

        return ({
            id:device,
            orient:orient
        });

    },
    restore:function(device){ 
        $('[data-device="'+ device.id +'"]').trigger('click');
        if( device.orient === 'landscape' ) {
            $('#btnToggleRotate').trigger('click');
        }   
    },
    showLoader:function(){
        this.$frame.addClass('invisible'); 
        this.toggleSiteLoader(false);
    },
    hideLoader:function(){
        this.$frame.removeClass('invisible');
        this.toggleSiteLoader(true);
    },
    toggleAddressBar: function(){
        $('#toolbar').toggleClass('open');
        $('[data-addrtoggle]').toggleClass('open');
    },
    toggleSiteLoader:function(hide){
        if(hide === true){
            $('#siteLoader').addClass('hidden').removeClass('animate-rotate360');
        }else{
            $('#siteLoader').removeClass('hidden').addClass('animate-rotate360');
        }
    },
    initUA:function(){
        var ua = navigator.userAgent;
        $('.desktop-only').attr('data-user-agent', ua); 
        this.device.ua = ua;
    },
    setUA:function(win, userAgent) {
        
        var sameHost = this.url.indexOf(location.host)>-1,
            navig;
        
        //iframe id
        if(typeof(win)==='string'){
            win = document.querySelector('#'+win).contentWindow;
        }
        try{
            navig = win.navigator;    
        }catch(e){
            console.log(e);
            navig = null;
        }
        if (navig && navig.userAgent != userAgent) {
            var userAgentProp = { get: function () { return userAgent; } };
            try {
                Object.defineProperty(navig, 'userAgent', userAgentProp);
            } catch (e) {
                win.navigator = Object.create(navig, {
                    userAgent: userAgentProp
                });
            }
        }
    },
    refresh:function(){
        this.parseUrl(true);    
    }
};

var initEvts = function() {

    var $viewports = $('button[data-viewport-width]'),
        $frame =VR.$frame,
        $rotateViewports = $('button[data-rotate=true]'),
        $vr = $('#vr');

    var closeResizer = function(href) {
        var newWidth = $win.width(),
            newHeight = $win.height();
        $viewports.removeClass('active');
        $frame.css({
            'max-width': newWidth,
            'max-height': newHeight
        });
        $vr.fadeOut(500, function() {
            document.location.href = href;
        });
    };

    $frame.on('load',function(e){
        VR.hideLoader();
        W.postMessage(VR.device, '*');    
    });

    $body.on('click', 'button[data-viewport-width]', function(e) {
        var newWidth = this.getAttribute('data-viewport-width'),
            newHeight = this.getAttribute('data-viewport-height'),
            $this = $(this),
            device = this.getAttribute('data-device'),
            ua = this.getAttribute('data-user-agent');

        VR.device.ua = ua;
        VR.device.id = device;

        $viewports.removeClass('active');
        $this.addClass('active');
        $.cookie('vr-device', device);
        $frame.css({
            'max-width': newWidth,
            'max-height': newHeight
        });
        //VR.setUA(W, ua);
        VR.setUA($frame[0].id, ua);
        e.preventDefault();
        return false;
    }).on('click', '.rotate', function(e) {
        $rotateViewports.each(function() {
            var $this = $(this).toggleClass('landscape'),
                width = $this.attr('data-viewport-width'),
                height = $this.attr('data-viewport-height');
            
            $this.attr('data-viewport-width', height);
            $this.attr('data-viewport-height', width);
            if($this.hasClass('active')) {
                $this.trigger('click');
                if( $this.hasClass('landscape') ) {
                    $.cookie('vr-orientation', 'landscape');
                    VR.device.orient = 'landscape';
                }else{
                    VR.device.orient = 'portrait';
                    $.removeCookie('vr-orientation');
                }
            }
        });
    }).on('click', '.refresh', function(e) {
        VR.refresh();
    }).on('click', '.close', function(e) {
        closeResizer(VR.url);
        return false;
    }).on('click', '[data-addrtoggle]', function(e) {
        var $this = $(this),
            $el = $(this.getAttribute('data-toggle'));
        VR.toggleAddressBar();
        if($el.hasClass('open')) {
            $el.find('[name="url"]').focus().select();
        }
        
    }).on('keyup', 'input', function(e) {
        if(e.keyCode == 27) {
            $('[data-toggle]').first().trigger('click');
            $('[name="url"]').val(VR.url);
        }
        e.stopPropagation();
    }).on('keypress', '[name="url"]', function(e) {
        if(e.keyCode == 13) {
            VR.ensureValidProtocol($(this), e);
        }
    }).on('click', 'button[type="submit"]', function(e) {
        VR.ensureValidProtocol($(this).parents('form').find('[name="url"]'), e);
    });

    $doc.on('keyup', function(e) {
        switch(e.keyCode) {
          case 27:
            $('[data-toggle]').first().trigger('click');
            break;
          case 49:
            $('[data-device="fullscreen"]').trigger('click');
            break;
          case 50:
            $('[data-device="desktop"]').trigger('click');
            break;
          case 51:
            $('[data-device="macbook"]').trigger('click');
            break;
          case 52:
            $('[data-device="iPadMini"]').trigger('click');
            break;
          case 53:
            $('[data-device="iphone6+"]').trigger('click');
            break;
          case 54:
            $('[data-device="iphone6"]').trigger('click');
            break;
          case 55:
            $('[data-device="iphone5"]').trigger('click');
            break;
          case 32:
          case 56:
          case 82:
            $('.rotate').trigger('click');
            break;
          case 88:
            closeResizer(VR.url);
            break;
        }
    });


    $('form').on('submit', function(e) {
        var $url = $(this).find(['name="url"']),
            $urlParent = $url.parent();
        $urlParent.removeClass('error');
        if($url.val() === '') {
            $urlParent.addClass('error');
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

};

//doc ready
$(function(){
    VR.init();    
});

})(jQuery,window);
