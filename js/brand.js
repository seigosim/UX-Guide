

/* ------------ tabGroup Module --------------- */

	tabGroup = function (tabgroup,tgCount) {
		var fn = this;
		var animateTimeout = null;
		var autoadvanceTimeout = null;
		var cookieName = "lastopentab" + window.location.pathname.replace(/\//g,'-');
		this.openTab = function(tab){
			var $thistabgroup = $(tab).parent();
			if($thistabgroup.hasClass('accordion')){
				var opentabs = false; // are there any tabs that are open

				if($(tab).hasClass('active')){
					fn.contractTab(tab);
				} else {
					if($thistabgroup.hasClass('toggle')){
						fn.expandTab(tab);
					} else {
						fn.contractTab($thistabgroup.children('li.active'));
						animateTimeout = setTimeout(function(){fn.expandTab(tab)},250);
					}
				}
			} else {
				$thistabgroup.children('li').removeClass('active'); // remove active on all tabs
				$(tab).addClass('active'); // activate just this tab
				fn.fadeinContent(tab);
				var tabID = $(tab).data('tabid');
				document.cookie = cookieName + '=' + tabID + '; path=/';  // remember which tab was opened
			}
		};
		this.contractTab = function(tab){
			// accordion contract with animation
			var $activetabbody = $(tab).children('.body');
			$activetabbody.css('overflow','hidden');
			$activetabbody.children('*').animate({'opacity':'0.1' },{queue:false, duration:300,easing:'linear'});
			$activetabbody.animate({'height':'toggle'},{queue:false, duration:300,easing:'swing'});
			$activetabbody.animate({'padding-top':'toggle' },{queue:false, duration:200,easing:'linear'});
			$activetabbody.animate({'padding-bottom':'toggle' },{queue:false, duration:200,easing:'linear',complete:function(){
				$(tab).removeClass('active');
			}});
			$(tab).find('.rowcontract').removeClass('rowcontract').addClass('rowexpand');
			
		};
		this.expandTab = function(tab){
			var $thistabbody = $(tab).children('.body');
			$thistabbody.css('overflow','auto');
			$thistabbody.children('*').animate({'opacity':'1' },{queue:false, duration:350,easing:'linear'});
			$thistabbody.animate({'height':'toggle'},{queue:false, duration:400,easing:'swing'});
			$(tab).addClass('active');
			$(tab).find('.rowexpand').removeClass('rowexpand').addClass('rowcontract');
			var tabID = $(tab).data('tabid');
			document.cookie ='lastopentab=' + tabID + '; path=/';  // remember which tab was opened
		};
		this.fadeinContent = function (tab){
			$(tab).find('.body > *').css('opacity','0');
			$(tab).find('.body > *').animate({'opacity':'1'},{duration:250});
		}
		this.autoAdvance = function(thisTabgroupID,delaytime){
			var $thisTabgroup = $('#' + thisTabgroupID);
			var $tabs = $thisTabgroup.children('li');
			var $curtab = $thisTabgroup.find('li.active');
			if($curtab.index() +1 < $tabs.length){	
				// open next tab
				var nexttab = $tabs.eq($curtab.index() +1);
			} else {
				// open first tab
				var nexttab = $tabs.eq(0);
			}
			clearTimeout(fn.autoadvanceTimeout); 
			fn.autoadvanceTimeout = setTimeout(function() { 
				fn.openTab(nexttab); 
				fn.autoAdvance(thisTabgroupID,delaytime); 
				} 
				, delaytime);
		}

		this.init = function () {
			var i = 0;
			var tabCookie = '';
			if(document.cookie){
				var regexp = new RegExp('(?:^|; )' + cookieName + '=([^;]*)');
				var match = document.cookie.match(regexp);
				if(match && match.length >= 2){
					tabCookie = match[1];
				}
			}
			var tabgroupID = "tg" + tgCount;
			$(tabgroup).attr('id',tabgroupID);
			$(tabgroup).children('li').each(function(){
				$(this).attr('data-tabid', tabgroupID + "_t" + i++); // set a unique id for each tab
				$(this).addClass('tabpos' + i); // add position class sequentially
				if (i==1 && $(this).parent().hasClass('accordion') == false){
					// first tab active except for accordions
					fn.openTab($(this));
				}
				if(tabCookie.length && tabCookie == $(this).data('tabid')){
					// open tab from cookie
					fn.openTab($(this));
				}  
				if($(this).parent().hasClass('accordion')){
					// add rowexpand indicators
					$(this).find('.title').prepend('<span class="rowexpand"></span>');
					if($(this).hasClass('active')) $(this).find('.rowexpand').removeClass('rowexpand').addClass('rowcontract');
				}
			});
			// attach click events to tab links
			$(tabgroup).children('li').children('a.title').click(function(e){
				clearTimeout(fn.autoadvanceTimeout);
				fn.openTab($(this).parent());
				e.preventDefault();
			});
			// find autoadvance directive
			var tabautoadvance = $(tabgroup).data('autoadvance');
			if (tabautoadvance && $.isNumeric(tabautoadvance) && tabautoadvance !== 0){
				fn.autoAdvance(tabgroupID,tabautoadvance);
			}
		};
		this.init();
	};

/* modal window & lightbox */
(function($) {
	 $.fn.modalWindow  = function (link,options){
	    	// link is a jquery selector or collection
	    	// options:
	    	// darken : true/false (default: true) - creates fullscreen overlay
	    	// clickbg : true/false (default: true) - allows clicking the background to close window
	    	// windowtype: rounded/square (default: square) - controls the corner radius
	    	// imgsrc : modal type is lightbox, load this image
	    	// closeicon : true/false (default:true) - Dialog can be closed by icon in the corner
	    	// height : this height value overrides the height of the modal content
	    	// width : this width value overrides the width of the modal content
	    	// padding : true/false  - padding on the inner container
	    	// callback : function to execute after the window opens
			
			var defaults = {
				 darken: true,
				 clickbg: true,
				 imgsrc: '', 
				 windowtype: '',
				 closeicon: true, 
				 height: 0, 
				 width: 0,
				 padding: true,
				 callback: null
			};
			var $overlay;
			var $theLink =  $(link);	
			var fn = this;
			var opts = $.extend( {}, defaults, options );

			// get contents
			var windowContent = $(this).html();

			// build window object
			var $windowOb = $(document.createElement('div'));
			$windowOb.addClass('modal');
			if(opts.windowtype == 'rounded'){
				$windowOb.addClass('rounded');
			}
			var $inner = $(document.createElement('span'));
			if(!opts.padding){
				$inner.css('padding','0');
			}
			$inner.appendTo($windowOb);
			$inner.addClass('inner');
			if(opts.imgsrc.length){
				var $img = $(document.createElement('img'));
				$img.prop('src',opts.imgsrc);
				$inner.append($img);
				$windowOb.addClass('lightbox');
			} else {
				$inner.css('height',(opts.height) ? opts.height : 'auto');
				$inner.css('width',(opts.width) ? opts.width : 'auto');

				$inner.html(windowContent);
			}

			if(opts.closeicon){
				// add close icon in corner
				var $closeicon = $(document.createElement('a'));
				$closeicon.addClass('close_x');
				$closeicon.html('<div class="close_x_inner"></div>');
				$closeicon.appendTo($windowOb.children('.inner'));
				$closeicon.click(function(){
					$windowOb.closeWindow();
				});
			}
			// attach close function to close button
			$windowOb.find('.close_button').click(function(){
				$windowOb.closeWindow();
			});
			
			// detach modal and append to body
			$(this).detach();
			$('body').css('height','100%');
	    	$windowOb.css('z-index',1000);
	    	if(opts.darken){
	  			// add dark overlay
	  			$overlay = $(document.createElement('div'));
	  			$overlay.addClass('modaloverlay');
	  			$windowOb.prepend($overlay);
			} else {
				$windowOb.addClass('border');
			}
			$windowOb.appendTo('body');

			if(opts.clickbg){
				// click background to close (or esc key)
				$(document).on('keydown',function(e){
					if(e.which === '27'){
						$windowOb.closeWindow();
					}
				});
				if($overlay){
					$overlay.on('click',function(){
						$windowOb.closeWindow();
					});
				}
			}

		 	// attach toggle function to link
			$theLink.click(function(e){
				if($windowOb.css('display') == 'none'){
					$windowOb.openWindow();
				} else {
					$windowOb.closeWindow();
				}
				e.stopPropagation();
				e.preventDefault();
			});


			$windowOb.openWindow = function(){
				if($windowOb.css('display') == 'none'){
					var $inner = $windowOb.children('.inner');
					// move to middle of screen and fade in
					var myHeight = $inner.outerHeight();
					var docHeight = $(window).innerHeight();
					var scrollTop = $(window).scrollTop();
					myHeight = Math.max(400,myHeight);
					var newTop = ((docHeight/2) + scrollTop - (myHeight/2));
					$windowOb.css('padding-top', newTop+ 'px');
					$windowOb.fadeIn(150);
					if(opts.callback && typeof opts.callback == 'function'){
						opts.callback.call(this);
					}

				}
				return this;
			};
			$windowOb.closeWindow = function(){
				if($windowOb.css('display') == 'block'){
					$windowOb.fadeOut(250);
					return this;
				}
			};
			return $windowOb;
		}
		
})( jQuery );

/* ------- Button hoverMenus ---------- 
Usaage: $([theMenu]).hoverMenu([theButton])

*/

(function($) {
 
	$.fn.hoverMenu = function(link) {
		var $theMenu = $(this);
		var $theLink =  $(link);
		fn = this;
		fn.timeoutHide = null;
		
		var DelayHide = 150; // (ms) delay closing of the menu to giev time for the mouse to enter
		var toggle = false; // used for click events

		// move menus to be direct children of body
		$theMenu.detach();
		$theMenu.appendTo('body');
		// attach hover events to menu
		$theMenu.on('mouseenter',function(){
			clearTimeout(fn.timeoutHide);
			$theMenu.show();
		});
		$theMenu.on('mouseleave',function(){
			clearTimeout(fn.timeoutHide);
			fn.timeoutHide = setTimeout(doHide, DelayHide);
		});
		var doHide = function(){
			$theMenu.animate({'opacity':'0'},150,function(){
				$theMenu.hide();
				toggle = false;
				
			});
			
			
		}
		// attach hover events to link
		$theLink.on('mouseenter click',function(e){
			clearTimeout(fn.timeoutHide);
			if(e.type == 'click'){
				e.stopPropagation();
				if (e.type == 'click' && toggle){
					$theMenu.fadeOut(150);
					toggle = false;
					return;
				} else if ($theMenu.css('display') == 'none'){
					toggle = true;
				}
			}
				objOffset = $(this).offset(); // reads left and top offsets in page
				docWidth = $(window).width(); // page width
				
				if($theMenu.css('display') == 'none'){
					$theMenu.css('top',objOffset.top + $(this).outerHeight());
					$theMenu.css('left',objOffset.left -90);
					$theMenu.show();
					$theMenu.css('opacity','0');
					$theMenu.animate({'opacity':'1'},{queue:false, duration:150}).animate({'top':'+=14px'},100);
				} 
		});
		$theLink.on('mouseleave',function(){
			clearTimeout(fn.timeoutHide);
			fn.timeoutHide = setTimeout(doHide, DelayHide);
			
		});
		return this;
	}
})( jQuery );


/* scrollto plugin for sticky scrolling */
(function($) {
 
	$.fn.scrollto = function(target,options) {
		/*	This object will get a click event that will scroll to the location
			of the target element
		*/
		var defaults = {
		 speed: 1800, // pixels per second
		 duration: 0, // optional to supply duration instead of speed
		 offset: 0, // subtract this from target top position
		 showTopLinkerAt: 250, // show top linker when scroll is past this point
		 useTopLinker: true, // create link to go back to top of page
		 topLinkerClass: 'scrollto_toplinker', // class to apply to the toplinker element
		 onStart: void(0), // function to call when begining scroll
		 endScroll: void(0), // function to call after scroll has finished
		 topCallback: void(0), // function to call when scrolling back to the top
		};

		var fn = this;
		var opts = $.extend( {}, defaults, options );
		var $doc = $('html,body'); 
		var $topLinker;
		this.hasTopLinker = false;

		var getScrollTop = function(){
			return $(window).scrollTop();
		};

		this.startScroll = function(toTarget){
			scrollToPosition(getTargetOffset($(toTarget)),opts.endScroll);
			if (opts.onStart && typeof opts.onStart == 'function') opts.onStart.call(this);
		};
		this.setOffset = function(newoffset){
			opts.offset = newoffset;
		};

		var getTargetOffset = function(targ){
			var tgOffset = $(targ).offset();
			if(tgOffset) return tgOffset.top - opts.offset; 
			
			return false
		};
		var scrollToPosition = function(to, callback) {
    		var start = getScrollTop();
    		var duration = (opts.duration) ? opts.duration : Math.abs(to - start)/opts.speed * 1000;
       		var change = to - start;
        	var currentTime = 0;
        	var increment = 20;

    		var animateScroll = function(){        
        		currentTime += increment;
        		var val = easeInOutQuad(currentTime, start, change, duration);                        
        		$doc.scrollTop(val); 
        		if(currentTime < duration) {
            		setTimeout(animateScroll, increment);
        		} else if(callback && typeof callback == 'function'){
					callback.call(this);
        		}
        		to = getScrollTop();
    		};
    		if(Math.abs(to - start) > 10) animateScroll();
		};
		var easeInOutQuad = function (t, b, c, d) {
		    t /= d/2;
		    if (t < 1) return c/2*t*t + b;
		    t--;
		    return -c/2 * (t*(t-2) - 1) + b;
		};
		var addTopLinker = function(){
				removeTopLinker();
				$topLinker = $(document.createElement('div'));
				$topLinker.addClass(opts.topLinkerClass);
				$topLinker.append('<div class="inner"><a href="javascript:void(0)">Top</a></div>');
				$topLinker.find('a').each(function(){
					$(this).on('click',function(){
						scrollToPosition(0,opts.topCallback);
					});
				});
				$topLinker.addClass('scrollto_toplinker');
				$('body').append($topLinker);
		};
		var removeTopLinker = function(){
			$('.scrollto_toplinker').remove();
		};
		var testTopLinker  = function(){
			if(getScrollTop() > opts.showTopLinkerAt) {
				addTopLinker();
			} else {
				removeTopLinker();
			}
		};

		this.init = function(target){
			var $target = $(target);
			if($target && $target.length == 1){
				$(this).on('click',function(e){
					e.preventDefault();
					e.stopPropagation();
					fn.startScroll($target.get(0));
				});
			}
			$(window).on('scroll',testTopLinker);
			testTopLinker();
		};
		this.init(target);

		return this;
	};


})( jQuery );


/* sticky plugin for sticky scrolling */

(function($) {
 
	$.fn.sticky = function(options) {
		/* make an element "stick" to the top of the viewport 
			options: offset, startOffset, onStick (callback), offStick (callback), resizeCallback (callback)
			-- positive startOffset begins to stick the element before it reaches the top of the page, negative startOffset delays the stickiness until the top of the element has passed the scrolltop
			-- offset should normally be the same value as startOffset unless you are modifying the dimensions of the stuck element
		*/
		var opts = (options) ? options : {};	
		var offset = (opts.offset) ? opts.offset : 0;
		var startOffset = (opts.startOffset) ? opts.startOffset : 0;
		var stuck = false;
		var myStartPos;
		var $fixedObj;
		var my = this;

		var getOffset = function(target){
			var stOffset  = $(target).offset();
			if(stOffset && stOffset.top) return stOffset.top;
			return false;
		};
		var getScrollTop = function(){
			return $(window).scrollTop();
		};
		var startSticky = function(){
			$fixedObj = $(my).clone(true);
			$fixedObj.addClass('scrolling');
			$fixedObj.css('position','fixed');
			$fixedObj.css('top', offset);
			$fixedObj.css('height', $(my).innerHeight());
			$fixedObj.css('width', $(my).innerWidth());	
			$(my).css('visibility','hidden');
			$(my).after($fixedObj);
			stuck = true;
			if(opts.onStick && typeof opts.onStick == 'function') {
				// callback when element becomes stuck
				opts.onStick.call(this);
			}
		};
		var endSticky = function(){
			$fixedObj.remove();
			$(my).css('visibility','visible');
			stuck = false;
			if(opts.offStick && typeof opts.offStick == 'function') {
				// callback when element becomes unstuck
				opts.offStick.call(this);
			}
		};
		var resize = function(){
			// tracks dimensions of the parent object
			if($fixedObj){
				$fixedObj.css('height', $(my).innerHeight());
				$fixedObj.css('width', $(my).innerWidth());	
				if(opts.resizeCallback && typeof opts.resizeCallback == 'function'){
					// callback when window is resized
					opts.resizeCallback.call(this);
				}
			}
		};

		var init = function(){
			myStartPos = getOffset(my);
			$(window).on('scroll',function(){
				if(getScrollTop() - myStartPos + startOffset > 0) {
					if(! stuck) startSticky();
				} else {
					if(stuck) endSticky();
				}
			});
			$(window).on('resize',resize);
		};
		init();
	};
	return this;
})( jQuery );



/* inview plugin for sticky scrolling */
(function($) {
	$.fn.inview = function(offset,callback) {
		/*  
			calls a callback function when an element reaches a set scroll position
		*/
		var offset = offset-0; // numeric
		var callback =  callback ;
		var fn = this;
		var getBounds = function(){
			var stOffset  = $(fn).offset();
			var obHeight = $(fn).outerHeight();
			if(stOffset.top) return {'top':stOffset.top,'bottom':stOffset.top + obHeight};
			return {'top':0,'bottom':0};
		};
		var getScrollTop = function(){
			return $(window).scrollTop();
		};
		var getWindowHeight = function(){
			return $(window).innerHeight();
		};
		var testPosition = function(){
			if(getScrollTop() + offset > getBounds().top &&  getScrollTop() + offset < getBounds().bottom){
				if (typeof callback == 'function') callback.call(this);
			}
		};

		$(window).on('scroll',testPosition);
		$(window).on('resize',testPosition);

	};
	return this;
})( jQuery );




/* ------- tooltips ---------- */
	AtoolTips = function() {
		var $tooltipAnchors = $('a[rel="tooltip"],a[rel="errortip"]');
		var toggleTip = false;

		// attach hover events to link
		$tooltipAnchors.on('mouseenter click',function(e){
			if(e.type  == 'mouseenter'){
				this['tiptext'] = $(this).attr('title') ; // tooltip text is the title attribute
				$(this).attr('title',''); // clear out the title to avoid the default tooltip
				if($(this).hasClass('nohover') == false){
					createTooltip(this);
				}
			}
			if(e.type == 'click'){
				var anchor = this;
				if(! toggleTip){
					createTooltip(this);
					toggleTip = true;
					$(window).on('resize.' + anchor.tooltipID, function(){
						var objOffset = $(anchor).offset();
						var $anchorTooltip = $('#' + anchor.tooltipID);
						$anchorTooltip.css('top', objOffset.top + $(anchor).outerHeight());
						$anchorTooltip.css('left', objOffset.left + $(anchor).outerWidth() -24);
					});
				} else {
					removeToolTip();
					$(window).off('resize.' + anchor.tooltipID);
				}
				if($(this).hasClass('clickthrough') == false){
					return false;
				}
			}
			
		});

		$tooltipAnchors.on('mouseleave',function(){
			$(this).attr('title',this['tiptext']);
			if($(this).hasClass('nohover') == false){
				removeToolTip();
			}
		});
		$(document).on('click keydown',function(e){
			if((e.type == 'click' || e.which == '27') && toggleTip){
				// triggers on click or esc key which toggleTip is true
				removeToolTip();
			}
		});


		function createTooltip(anchor){
			var objOffset = $(anchor).offset(); // reads left and top offsets in page
			var docWidth = $(window).width(); // page width
			anchor.tooltipID = "tip" + Math.floor(Math.random() * (999999999 - 1000) + 1000); // make a random id
			var relType = ' tip';
			if($(anchor).attr('rel') == 'errortip'){
				relType = ' error';
			}
			var $anchorTooltip = $(document.createElement('div'));
			$anchorTooltip.addClass('AtoolTip');
			$anchorTooltip.attr('id',anchor.tooltipID);
			$anchorTooltip.append('<div class="inner' + relType + '">' + anchor.tiptext + '</div>');
			$anchorTooltip.appendTo('body'); 
			$anchorTooltip.css('top', objOffset.top + $(anchor).outerHeight());
			$anchorTooltip.css('left', objOffset.left + $(anchor).outerWidth() -24);
			var tipType = "right";
			if(objOffset.left + $(anchor).outerWidth() + 320 > docWidth) {
				// anchor link is too close to window edge
				if(objOffset.left - 270 < 0){
					// use centered version
					$anchorTooltip.addClass('center');
					$anchorTooltip.css('left',objOffset.left - ($(anchor).outerWidth()/2) -75);	
					tipType = "center";		
				} else {
					// use lefthanded version
					$anchorTooltip.addClass('lefthand');
					$anchorTooltip.css('left',objOffset.left - $anchorTooltip.outerWidth() +24);	
					tipType = "left";
				}
				
			}
			$anchorTooltip.fadeIn(150);
			switch(tipType){
				case "left":
					$anchorTooltip.children('.inner').animate({ right: '10px'},200);
					break;
				case "center":
					$anchorTooltip.children('.inner').animate({'margin-top':'12px'},200);
					break;
				case "right":
					$anchorTooltip.children('.inner').animate({'left':'10px'},200);
					break;
			}
			return $anchorTooltip;
		}
		function removeToolTip(){
			toggleTip = false;
			$allTips = $('.AtoolTip');
			$allTips.each(function(){
				if($(this).hasClass('permanent') ==  false){
					$(this).remove();
				}
			});
		}
	};

/* ------------- Feature Modules Auto Adjust Height ----------*/

	function setFeaturedContentHeights(){
		// featured product module height alignment
		// must be used in $(window).load() context to detect image sizes
		var allmodules = $('.featured_product_module');
		$(allmodules).css('height','auto'); // reset module heights
		var tallest = $(allmodules).first().height();
		for(var i=0; i< allmodules.length; i++){
			if($(allmodules[i]).height() > tallest){
				tallest = $(allmodules[i]).height();//find the tallest module
			}
		};
		$(allmodules).height(tallest); //set all module heights to match tallest

		// adjustment for first/last module margins
		var $moduleparents = $('.featured_product_module').parent();
		if($moduleparents.length > 1) {
			$moduleparents.first().find('.module_highlight').css('margin-left',0);
			$moduleparents.last().find('.module_highlight').css('margin-right',0);
		}
	}



$(document).ready(function(){


	// initialize tooltips
	AtoolTips();

	// initialize tabgroups
	(function(){
		var tabgroupcount = 0;
		$('.tabgroup').each(function(){
			tabGroup(this,tabgroupcount);
			tabgroupcount++;
		});
	})();	

	/*   camera image carosuel  */
	$('.camera_wrap').each(function(){
		if($.fn.camera) {
			var options = {};
			if($(this).hasClass('camera_thumbnails')) {
				options.thumbnails = true;
				options.pagination = false;
			}

			$(this).camera(options);
		}
	});

	/* banner links */
	(function(){
		var $banners = $('.banner_module');
		if($banners.length){
			$banners.each(function(){
				var $fg = $(this).find('.foreground');
				var $bglink = $(this).find('.background > a');
				if($bglink){
					var $fglink = $(document.createElement('a'));
					$fglink.addClass('foreground');
					$fglink.attr('href',$bglink.attr('href'));
					$fglink.attr('target',$bglink.attr('target'));
					$fglink.html($fg.html());
					$(this).append($fglink);
					$fg.remove();
				}
			});
		}
	})();

	/* Video Tab*/
	(function(){
		var youtubeLinks = $('a.youtubeLink');
		var next = $('li.videoTab .videoLinksPane a.down');
		var prev = $('li.videoTab .videoLinksPane a.up');
		var videoCount = 0;
		var revealedThumbnails = 3; // how many thumbnails to show at a time
		var firstThumbnail = 0;
		var $vidPane = $('li.videoTab .videoLinksPane');
		var $vidContainer = $('li.videoTab .videoContainer');
		var cookieName = 'viewedVideos';
		var viewedVideos = [];
		if(document.cookie){
			var regexp = new RegExp('(?:^|; )' + cookieName + '=([^;]*)');
			var match = document.cookie.match(regexp);
			if(match && match.length >= 2){
				viewedVideos = match[1].split('/');
			}
		}
		if(youtubeLinks.length){
			$vidContainer.append('<div class="vidcount"></div>');
			$(youtubeLinks).each(function() {
				var id = getYoutubeID($(this).attr('href'));
				if(id){
					if(videoCount == 0){
						viewedVideos.push(id);
						$(this).addClass('active').addClass('visited');
					}
					getVideo($(this),id,videoCount);
					if($.inArray(id,viewedVideos) != -1  ){
						$(this).addClass('visited');
					}
					if(videoCount == 0){
						$(this).addClass('active').addClass('visited');
					}
				}
	    		if(videoCount >= revealedThumbnails){
	    			$(this).hide(); //show only the first 3 thumbnails at start
	    		}
	    		
	    		videoCount++;
			});
			updateVidCount(videoCount,1,Math.min(revealedThumbnails,videoCount));
			showHideArrows();

			$(next).on('click', function(){
				firstThumbnail = firstThumbnail + revealedThumbnails;
				showThumbnails(firstThumbnail,revealedThumbnails);
			});
			$(prev).on('click', function(){
				firstThumbnail = firstThumbnail - revealedThumbnails;
				showThumbnails(firstThumbnail,revealedThumbnails);
			});
		}
		if(youtubeLinks.length  == 1){ 
			// one video, hide thumbnails and expand video player
			$vidPane.hide();
			$vidContainer.find('.vidcount').hide();
			$vidContainer.css('width','100%');
		}

		function getVideo(link,id,videoCount){
    			var title = $(link).html();
    			var thumb_url = "http://i.ytimg.com/vi/"+id+"/mqdefault.jpg";
    			$('<img src="'+thumb_url+'" alt="Watch Video" /><div class="playarrow"></div>').appendTo($(link));	
    			// convert the link to embed the video instead of link to YouTube 
    			$(link).on('click',function(){
					$videoOverlay = $(document.createElement('div'));
					$videoOverlay.addClass('overlay');
					$videoOverlay.appendTo($vidContainer);
					$videoOverlay.fadeIn(200,function(){
						embedVideo(id,title,true);
						setTimeout(function(){
							$videoOverlay.fadeOut(250,function(){
								$videoOverlay.remove();
							})
						},100);
					});
					$(youtubeLinks).removeClass('active');
					$(this).addClass('active').addClass('visited');
					viewedVideos.push(id);
					document.cookie = cookieName + '=' + viewedVideos.join('/') + '; Max-Age=2592000; path=/'; 
					return false;
    			});
    			if(videoCount == 0){
    				// open first video in the list
					embedVideo(id,title,false);
    			}
		}
		function getYoutubeID(url) {
    		var id = url.match("[\\?&]v=([^&#]*)");
   	 		if(id[1]){
   	 			return id[1];
   	 		}
    		return false;
		};
		function embedVideo(id,title,autoplay){
			var autoplayParam = "";
			if(autoplay){
				autoplayParam = "&autoplay=1";
			}
			$('li.videoTab #YTFrame').prop('src','').prop('src','http://www.youtube.com/embed/' + id + '?wmode=opaque&rel=0' + autoplayParam);
			$('li.videoTab .body h5').html(title);
		}
		function showThumbnails(start,count){
			$(youtubeLinks).fadeOut(150);
			var seqCount = 1;
			for(var i=start; i<start+count; i++){
				var thisLink = $(youtubeLinks)[i];
				$(thisLink).delay(150*seqCount).fadeIn(150);
				seqCount ++
			}	
			updateVidCount(videoCount,start+1,Math.min(start+revealedThumbnails,videoCount));
			showHideArrows();
		}
		function showHideArrows(){
			$(next).animate({'opacity':'0'},150).addClass('disabled');
			$(prev).animate({'opacity':'0'},150).addClass('disabled');
			if(firstThumbnail + revealedThumbnails < $(youtubeLinks).length ){
    			$(next).delay(200).removeClass('disabled').animate({'opacity':'1'},150);
    		}
    		if(firstThumbnail > 0){
				$(prev).delay(200).removeClass('disabled').animate({'opacity':'1'},150);
    		}
		}
		function updateVidCount(total,first,last){
			if(first == last){
				$vidContainer.children('.vidcount').html('Last of ' + total + ' Videos');
			} else {
				$vidContainer.children('.vidcount').html(first + ' to ' + last + ' of ' + total + ' Videos');
			}
			
		}
	})();



	(function(){
	  // fallback for form placeholder text on older browsers
	  function supports_input_placeholder() {
    	var i = document.createElement('input');
    	return 'placeholder' in i;
  	   }

	  if(!supports_input_placeholder()) {
	    var fields = document.getElementsByTagName('INPUT');
	    for(var i=0; i < fields.length; i++) {
	      if(fields[i].hasAttribute && fields[i].hasAttribute('placeholder')) {
	        fields[i].defaultValue = fields[i].getAttribute('placeholder');
	        fields[i].onfocus = function() { if(this.value == this.defaultValue) this.value = ''; }
	        fields[i].onblur = function() { if(this.value == '') this.value = this.defaultValue; }
	      }
	    }
	  }
	})();

	(function(){
		/* == reveal related content ==
			use data-reveal="[selector]" in a element 
			to unhide the target element(s) referenced by [selector]
			on mouseup. If calling element is a form object, reveal only 
			on 'checked'
			data-unreveal="[selector]" is used to hide another element
		*/
		$('[data-reveal]').each(function(){
			var selector = $(this).data('reveal');
			if (this.type && (this.type == 'checkbox' || this.type == 'radio')){
				$(this).on('change',function(){
					if(this.checked){
						reveal(selector,true);
					} else {
						reveal(selector,false);
					}
				});
			} else {
				$(this).on('click', function(){
					reveal(selector,true);
				});
			}
		});
		$('[data-unreveal]').each(function(){
			var selector = $(this).data('unreveal');
			if (this.type && (this.type == 'checkbox' || this.type == 'radio')){
				$(this).on('change',function(){
					if(this.checked){
						reveal(selector,false);
					} else {
						reveal(selector,true);
					}
				});
			} else {
				$(this).on('click', function(){
					reveal(selector,false);
				});
			}
		});
		reveal  = function(selector,show){
			if(show){
				$(selector).fadeIn(100);
			} else {
				$(selector).fadeOut(100);
			}
		}
	})();


	(function($) {
 		// load additional stylesheet
	    $.fn.styleSwitcher = function(url){
	    	if(url.length){
		    	if (document.createStyleSheet){
				    document.createStyleSheet(url);
				} else {
					var $newStyleSheet = $(document).createElement('link');
					$newStyleSheet.attr("rel", "stylesheet");
					$newStyleSheet.attr("type", "text/css")
					$newStyleSheet.attr("href", url)
				    $newStyleSheet.appendTo('head'); 
				}	
	    	}
			return this;
		}
	})( jQuery );
		
	(function(){
		// print contents of one tab only
		$('.printTab').each(function(){
			$(this).on('click',function(){
				$('.body_content *, #centerrow *').addClass('noprint');
				// remove noprint for page title, all parents of the tab and everything in the tab
				$(this).parents().removeClass('noprint');
				$(this).parents('li').find('*').removeClass('noprint');
				var $titles = $('body').find('h1');
				$titles.removeClass('noprint');
				$titles.parents().removeClass('noprint');
				window.print();
			});
		});
	})();

});

$(window).load(function(){
	// featured modules match height
	setFeaturedContentHeights();

	$(window).resize(function(){setFeaturedContentHeights()}); // handle responsive

});