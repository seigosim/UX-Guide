			


$(document).ready(function(){
	// load page includes 
	$("#loginbarinclude").load('loginbarinclude.htm');
	$("#footerinclude").load('footerinclude.htm');
	
	$("#sidenavinclude").load('sidenavinclude.htm');	
	$("#sidenavbrandinclude").load('sidenavbrandinclude.htm');	


	$("#logoinclude").load('logoareainclude.htm');	

	$('#mainnav').load('real_mainnav.htm', function(){

		// create new navTabs object
		var pageNavTabs = new NavTabs();

		// create new FlyoutMenu object
		var pageFlyoutMenu = new FlyoutMenu();

		pageNavTabs.highlightCurrentMenu();
		highlightSideNavItem();

	});


		


	

});

