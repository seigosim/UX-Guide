
var useMouseOver = false;


/* ------- popupWindows ---------- */
// The popup window is shown or hidden by clicking the supplied link object. 
// The location of the window is fixed
// USAGE: $(link).popupWindow($(window)); 
(function($) {
    $.fn.popupWindow = function(win){
	    var $theWindow = $(win);
		var $theLink =   $(this);
		var fn = this;
		this.openPopup = function () {
			$('.popupWindow').hide();
			$theWindow.show();
		}
		this.closePopup = function () {
			$theWindow.hide();
		}
		this.closeAll = function (){
			$('.popupWindow').hide();
		}
		this.init = function () {
			// attach close function to close button and title bar
			$theWindow.find('.title_bar' ).click(function(){
				fn.closePopup();
			});
			// attach toggle function to link
			$theLink.click(function(){
				if($theWindow.css('display') == 'none'){
					fn.openPopup();
				} else {
					fn.closePopup();
				}
			})
			// set link and parent of link to position:relative and overflow to visible
			if($theLink.css('position') != "absolute"){
				$theLink.css('position','relative');
			}
			if($theLink.parent().css('position') != "absolute"){
				$theLink.parent().css('position','relative');
			}
			$theLink.parent().css('overflow','visible');
		}
		this.init();

		return this;
	}
})( jQuery );
		


/* ---------- Main Nav Menus -------------- */


NavTabs = function () {
	// Show/Hide top level persistent tabs
	this.timeoutNavLinks = null;
	this.DelayDurationNavLinks = 300; // how long to wait to show the tab (in ms)
	this.QuickChangeZoneNavLinks = 0.55; // percentage of link area to switch to next tab immediately
	this.mobileBreakpoint = 480; //window size to trigger mobile menu mode
	var fn = this;

	this.showHideNavTabs = function (activeLink,resize){
		if(activeLink){
			$('#navLinks dd').removeClass('active');
			$('#navTabs li').removeClass('active');
			// activate the link and associated tab
			$('#' + activeLink).addClass('active');
			$('#' + activeLink.replace(/Link$/,'Tab')).addClass('active');
			if(! resize) {
				$('.tabs-content').removeClass('supress');
				$('#' + activeLink).removeClass('supress');
			}
		} else {
			$('.tabs-content').addClass('supress');
			$('#navLinks dd').each(function() {
				if(isMobile()) {
					if($(this).hasClass('active')) $(this).addClass('supress');
				} else {
					$(this).removeClass('active');
				}
				nextID = $(this).attr('id');
				$('#' + nextID.replace(/Link$/,'Tab')).removeClass('active');
			});		
		}
		// hide mobile overlays
		$('.flyout.mobile_menu').fadeOut(75,function(){
			$(this).remove();
		});
		$('.nav-bar').fadeIn(75);
	};
	this.showDefaultNav = function(){
		fn.timeoutNavLinks  = setTimeout( function() {
			fn.showHideNavTabs($('#navLinks dd.selected').attr('id'));
		} ,this.DelayDurationNavLinks);
	};
	this.queueShowTab = function (thisID){
		fn.timeoutNavLinks  = setTimeout( function() {
			fn.showHideNavTabs(thisID)
		} ,this.DelayDurationNavLinks);
	};

 	this.highlightCurrentMenu = function(){
		// highlight the menu links associated with the page
		var thisHref = document.location.href;
		var $navTabs = $('.tabs-content').children('li');
		var $navLinks = $('.tabs-content').find('.flyout').find('li').children('a');
		var found = false;
		for(var i = 0; i<=$navLinks.length; i++){
			var url = $navLinks.eq(i).attr('href') ;
			if(url && thisHref.search(url) != -1){ // look for link text at the end of document.href
				var $selfLink = $navLinks.eq(i);
				$selfLink.parent().addClass('active').addClass('selected');
				$selfLink.parents('li.has-flyout').children('a').addClass('selected').addClass('active');
				var $selfParent = $selfLink.parentsUntil('.tabs-content').eq(-1);
				if($selfParent && $selfParent.attr('id')) {
					var navLinkParentId = $selfParent.attr('id').replace(/Tab$/,'Link');
					fn.showHideNavTabs(navLinkParentId);
					$('#' + navLinkParentId).addClass('selected').addClass('active');
				}
				found = true;
				break;
			}
		}
		if(! found){
			found = false;
			var $navLinks = $('#navLinks dd > a');
			// look at top links
			for(var i = 0; i<=$navLinks.length; i++){
				var url = $navLinks.eq(i).attr('href');
				if(url && thisHref.search(url) != -1){ 
					$navLinks.eq(i).parent().addClass('active').addClass('selected');
					fn.showHideNavTabs($navLinks.eq(i).parent().attr('id'));
					found = true;
					break;
				}
			}
			if(! found) {
				// default to first menu
				var $fisrtNav = $('#navLinks dd').eq(0);
				$fisrtNav.addClass('active').addClass('selected');
				fn.showHideNavTabs($fisrtNav.attr('id'));
			}
		}
	};
	var isMobile = function(){
		return (window.innerWidth < fn.mobileBreakpoint) ;
	};
	var clickMenu = function(){
			if(isMobile()){			
				var thisID =  $(this).attr('id');
				if($(this).hasClass('active') && ! $(this).hasClass('supress')) {
					fn.showHideNavTabs();
				} else {
					fn.showHideNavTabs(thisID);
				}
				return false;
			}
	};
	var init = function (){
		if(isMobile()) {
			$('#navLinks dd.active').addClass('supress');
		}
		$('#navLinks dd').on('mouseenter',function(e) {
			if(! isMobile()){
				thisID =  $(this).attr('id');
				var evt = e ? e:event;
				var thisOffset = $(this).offset();
				var thisHeight = this.offsetHeight;
				var _y = evt.pageY - thisOffset.top;
				// see if the mouse is in the quickChangeZone
				if(_y < thisHeight * fn.QuickChangeZoneNavLinks) {
					// open the tab
					clearTimeout(fn.timeoutNavLinks);
					fn.showHideNavTabs(thisID);
				} else {
					// stay on previous tab a little longer
					fn.queueShowTab(thisID);
				}
			}
		});
		$('#navTabs').on('mouseenter',function(e) {
			clearTimeout(fn.timeoutNavLinks);
		});
		
		$('#navLinks dd, #navTabs').on('mouseleave',function() {
			clearTimeout(fn.timeoutNavLinks);
			if(! isMobile()) fn.showDefaultNav();
		});
		$('#navLinks dd').on('click',clickMenu);
		

		$(window).on('resize',function(){
			if(! $('#navLinks').children('dd.active').length) {
				fn.highlightCurrentMenu();
			}
			fn.showHideNavTabs($('#navLinks').children('dd.active').attr('id'),true);	
		});
		
	};
	init();
};


// secondary nav flyouts 

$.fn.foundationNavigation = function(){} //override foundation script

// this replaces jquery.foundation.navigation.js to handle flyout dropdowns
FlyoutMenu = function (){
	this.toggleOn = false;
	this.noneOpen = true;
	this.mobileBreakpoint = 480; //window size to trigger mobile menu mode
	this.timeoutFlyouts = null;
	this.timeoutHideFlyouts = null;
	this.expandFirstSubmenu = false; //(mobile) expand the first subnav menu when the mobile panel opens
	this.DelayDurationFlyouts = 300; // how long to wait to show the tab (in ms)
	this.DelayHideFlyouts = 75; // flyout persists for a bit 
	this.QuickChangeZoneSubnav = 0.65; // percentage of link area to switch to next tab immediately
	var $allFlyouts = $('.has-flyout').find('.flyout');
	var docWidth = function(){
		return $(window).width();
	};
	var fn = this;
	var isMobile = function(){
		return (window.innerWidth < fn.mobileBreakpoint) ;
	};
	this.resetDelay = function (showDelayVal,hideDelayVal){
			// can optionally be used to change the delay value on the fly
			this.DelayDurationFlyouts = Math.abs(showDelayVal);
			this.DelayHideFlyouts = Math.abs(hideDelayVal);
	};
	this.queueShowFlyout = function (elem){
		clearTimeout(this.timeoutHideFlyouts);
		clearTimeout(this.timeoutFlyouts);
		var self = this;
		if(this.noneOpen) {
			// if no flyouts are currently open, open the first one with no delay
			this.showFlyouts(elem);
		} else {
			this.timeoutFlyouts = setTimeout(function() { self.showFlyouts(elem) }, this.DelayDurationFlyouts);
		}
	};
	this.queueHideFlyouts = function (){
		clearTimeout(this.timeoutHideFlyouts);
		clearTimeout(this.timeoutFlyouts);
		var self = this;
		this.timeoutHideFlyouts = setTimeout(function() { self.fadeOutFlyouts() }, this.DelayHideFlyouts);
	};
	this.showFlyouts = function (elem) {
		fn.hideFlyouts();
		var $flyouts = $(elem).children('.flyout');
		if(isMobile()){
			var $flPanel = $flyouts.clone();
			$flPanel.addClass('mobile_menu');
			$flPanel.prepend(this.flyoutTitle($(elem).children('a').text()));
			$flPanel.find('h5').prepend('<span class="arrow_right"> </span>');
			$flPanel.find('h5').on('click',function(){
				fn.expandSubmenu($(this).parent());
			});
			$flSubmenus = $flPanel.find('.submenu_items div');
			if($flSubmenus.length == 1) fn.expandSubmenu($flSubmenus.eq(0));// expand first submenu
			$flPanel.find('.footer_ad').eq(Math.floor(Math.random() * $flPanel.find('.footer_ad').length)).show();
			$flPanel.css('left','100%').css('display','block');
			$flPanel.insertBefore('.tabs-content');
			$flPanel.parent().css('position','relative');
			$('.nav-bar').css('opacity','0.3');
			$flPanel.animate({'left':'0'}, 200 , function(){
				$(this).addClass('relative');
				$('.nav-bar').hide().css('opacity','1');
			});
		} else {
			$flyouts.show();
			fn.noneOpen = false;
			// control flyout position to stay within screen
			// cannot read position of elements with display:none, so attach to the mouseenter event
			var objOffset = $flyouts.offset(); // reads left and top offsets
			if(objOffset) {
				$flyouts.css('max-width','');
				var objWidth = $flyouts.width();
				if(objWidth > docWidth()) {
					// flyout is wider than window, reduce to fit
					$flyouts.css('max-width',docWidth());
					objWidth = docWidth();
				}
				if(objWidth < 700)  {
					this.alterFooterAds($flyouts,true);
				} else {
					this.alterFooterAds($flyouts,false);
				}
				var objRight = objOffset.left + objWidth;
				if(objRight > docWidth()) {
					if(objOffset.left > 24) { // don't move if the flyout is alerady at the far left
						$flyouts.css('left', docWidth() - objRight + 'px'); // reposition the flyout to stay within screen
					}

				}
			}

		}
	}
	this.alterFooterAds = function(flyout,reduce){
		var $footerAds = $(flyout).find('.footer_ad');
		if($footerAds.length == 3) {
			if(reduce){
				$footerAds.removeClass('four').addClass('six');
				$footerAds.eq(-1).hide();
			} else {
				$footerAds.removeClass('six').addClass('four');
				$footerAds.show();
			}
		}
	};
	this.hideFlyouts = function (){
		$allFlyouts.css('left', '0px');
		$allFlyouts.hide();
		fn.toggleOn = false;
		fn.noneOpen = true;
	};
	this.fadeOutFlyouts = function (){
		$allFlyouts.css('left', '0px');
		$allFlyouts.fadeOut(150);
		fn.toggleOn = false;	
		fn.noneOpen = true;	
	};
	this.flyoutTitle = function(fltext){ //for mobile
		var $flTitle = $(document.createElement('div'));
		$flTitle.addClass('flyout_topper');
		$flTitle.html(fltext);
		var $flBack =  $(document.createElement('a'));
		$flBack.addClass('back');
		$flBack.html('<span class="arrow_left"> </span> Back');
		$flBack.attr('href','javascript:void(0)');
		$flTitle.on('click',function(){
			var $flPanel = $(this).parents('.flyout.mobile_menu');
			$flPanel.removeClass('relative');
			$('.nav-bar').fadeIn(100);
			$flPanel.show().animate({'left':'100%'}, 180 , function(){
				$flPanel.remove();
			});
		});
		$flTitle.append($flBack);
		return $flTitle;
	};
	this.expandSubmenu = function(submenu){ //for mobile
		var $submenuDiv = $(submenu);
		if($submenuDiv.hasClass('expanded')){
			$submenuDiv.removeClass('expanded');
			$submenuDiv.children('h6 span').removeClass().addClass('arrow_right');
		} else {
			$submenuDiv.addClass('expanded');
			$submenuDiv.children('h6 span').removeClass().addClass('arrow_down');
		}
	};
	var init = function(){
		/*
		var $moreTab = $(document.createElement('li'));
		$moreTab.addClass('has-flyout').addClass('more_tab');
		var $moreTabLink = $(document.createElement('a'));
		$moreTabLink.html('More').attr('href','#');
		$moreTab.append($moreTabLink);
		$('.tabs-content').find('.nav-bar').append($moreTab);
		*/

		if(isMobile()){
			$('.tabs-content').addClass('supress');
		}

		// attach mouse events to navbar links
		$('.nav-bar>li.has-flyout').on('mouseenter mouseleave', function(e) {
			if(! isMobile()){
				if(e.type == 'mouseleave') fn.queueHideFlyouts();
				if(e.type == 'mouseenter') {
					var evt = e ? e:event;
					var thisOffset = $(this).offset();
					var thisHeight = this.offsetHeight;
					var _y = evt.pageY - thisOffset.top;

					// see if the mouse is in the quick change zone of the li
					if(_y < thisHeight * fn.QuickChangeZoneSubnav) {
						// open the flyout
						clearTimeout(fn.timeoutHideFlyouts);
						clearTimeout(fn.timeoutFlyouts);
						fn.showFlyouts(this);
					} else {
						// stay on previous flyout a little longer
						fn.queueShowFlyout(this);
					}
				}
			}
		});

		// click functions for touchscreen devices
		$('.nav-bar>li.has-flyout>a').on('click', function(e) {
				e.stopPropagation();
				e.preventDefault();			
				fn.showFlyouts($(this).parent().get(0)); 
		});


	};
	init();
}

var highlightSideNavItem = function(){
	// highlight the sidenav menu links associated with the page
	var thisHref = document.location.href;
	var $navLinks = $('#sidenavbar > ul > li > a');
	for(var i = 0; i<=$navLinks.length; i++){
		var url = $navLinks.eq(i).attr('href') ;
		if(thisHref.search(url) != -1){ // look for link text at the end of document.href
			var $selfLink = $navLinks.eq(i);
			$selfLink.parent().addClass('active');
			break;
		}
	}
};


$(document).ready(function(){

	// create new navTabs object
	var pageNavTabs = new NavTabs();

	// create new FlyoutMenu object
	var pageFlyoutMenu = new FlyoutMenu();

	// highlight nav links
	pageNavTabs.highlightCurrentMenu();

	highlightSideNavItem();

	// login and country select popups
		$('#clickLogin').popupWindow('#loginPopup');
		$('#clickCountry').popupWindow('#languageSelector');


});

