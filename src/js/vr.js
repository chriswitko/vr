if (top != self) { top.location.replace(self.location.href); }

window.resizer = {
  ensureValidProtocol: function(el, event) {
    var $el = $(el);
    var protocol = $el.val().substring(0,4);
    var regex = new RegExp(":\/\/");
    if(regex.test($el.val()) && protocol != 'http') {
      alert("Invalid protocol detected. Unfortunately, only HTTP and HTTPS protocols will work  =(");
      $el.focus().select();
      event.stopPropagation();
      event.preventDefault();
    }
  }
};

function createBookmarklet() {
  var title = document.title;
  var address =  window.location.href;
  if(window.sidebar) {
    window.sidebar.addPanel(title,address);
  } else if(window.external) {
    window.external.AddFavorite(address,title);
  } else if(window.opera && window.print) {
    var elem = document.createElement('a');
    elem.setAttribute('href',address);
    elem.setAttribute('title',title);
    elem.setAttribute('rel','sidebar');
    elem.click();
  }
}

function setupBookmarkLinks() {
  $('[rel="bookmark"]').attr('href', "javascript:document.location='"+document.location+"?url=' + document.location.href;");
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(document).ready(function() {

  setupBookmarkLinks();

  if(getParameterByName('url').length > 0) {
    urlParam = getParameterByName('url');
    if(urlParam.substr(0,4) != 'http') {
      urlParam = 'http://' + urlParam;
    }
    window.resizer.url = urlParam;
    $('[name="url"]').val(window.resizer.url);
    $('iframe#resizerFrame').attr('src',window.resizer.url);
    $('.index-page').hide();
    $('.resizer-page').show();
  }

  $('body').on('click', 'button[data-viewport-width]', function(e) {
    if($(this).attr('data-viewport-width') == '100%') {
      newWidth = '100%';
    }else{
      newWidth = $(this).attr('data-viewport-width');
    }
    if($(this).attr('data-viewport-height') == '100%') {
      newHeight = '100%';
    }else{
      newHeight = $(this).attr('data-viewport-height');
    }
    $('button[data-viewport-width]').removeClass('asphalt active').addClass('charcoal');
    $(this).addClass('asphalt active').removeClass('charcoal');
    $.cookie('device', $(this).attr('data-device'));
    $('#resizerFrame').css({
      'max-width': newWidth,
      'max-height': newHeight
    });
    e.preventDefault();
    return false;
  });

  $('body').on('click', 'button.rotate', function(e) {
    $('button[data-rotate=true]').each(function() {
      $(this).toggleClass('landscape');
      width = $(this).attr('data-viewport-width');
      height = $(this).attr('data-viewport-height');
      $(this).attr('data-viewport-width', height);
      $(this).attr('data-viewport-height', width);
      if($(this).hasClass('active')) {
        $(this).trigger('click');
        if( $(this).hasClass('landscape') ) {
          $.cookie('orientation', 'landscape');
        }else{
          $.removeCookie('orientation');
        }
      }
    });
  });

  $('body').on('click', 'button.refresh', function(e) {
    $(this).find('i[class*="icon-"]').addClass('icon-rotate-360');
    document.getElementById('resizerFrame').contentWindow.location.reload();
  });

  var triggerClose = function() {
    if($('#closeResizer').length) {
      closeResizer();
    }else{
      document.location = $('.close').attr('href');
    }
  };

  var closeResizer = function() {
    newWidth = $(window).width();
    newHeight = $(window).height();
    $('button[data-viewport-width]').removeClass('asphalt active').addClass('charcoal');
    $('#resizerFrame').css({
      'max-width': newWidth,
      'max-height': newHeight
    });
    $('#resizer').fadeOut(500, function() {
      document.location = document.getElementById("resizerFrame").contentWindow.location.href;
    });
  }

  $('body').on('click', '#closeResizer', function(e) {
    closeResizer();
  });

  $('body').on('click', '[data-toggle]', function(e) {
    var $el = $($(this).attr('data-toggle'));
    $el.slideToggle(150, function() {
      if($el.is(':visible')) {
        $el.find('[name="url"]').focus().select();
      }
    });
  });

  $(document).on('keyup', function(e) {
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
        $('[data-device="ipad"]').trigger('click');
        break;
      case 53:
        $('[data-device="tablet"]').trigger('click');
        break;
      case 54:
        $('[data-device="android"]').trigger('click');
        break;
      case 55:
        $('[data-device="iphone"]').trigger('click');
        break;
      case 32:
      case 56:
      case 82:
        $('.rotate').trigger('click');
        break;
      case 88:
        triggerClose();
        break;
    }
  });

  $('body').on('keyup', 'input', function(e) {
    if(e.keyCode == 27) {
      $('[data-toggle]').first().trigger('click');
      $('[name="url"]').val(window.resizer.url);
    }
    e.stopPropagation();
  });

  $('body').on('keypress', '[name="url"]', function(e) {
    if(e.keyCode == 13) {
      window.resizer.ensureValidProtocol($(this), e);
    }
  });

  $('body').on('click', 'button[type="submit"]', function(e) {
    window.resizer.ensureValidProtocol($(this).parents('form').find('[name="url"]'), e);
  });

  $('body').on('click', '[rel="bookmark"]', function(e) {
    e.preventDefault();
    return false;
  });

  $('form').on('submit', function(e) {
    if($(this).find('url').val() == '') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  if( $.cookie('device') ) {
    $('[data-device="'+$.cookie('device')+'"]').trigger('click');
  }
  if( $.cookie('orientation') == 'landscape' ) {
    $('.rotate').trigger('click');
  }

});
