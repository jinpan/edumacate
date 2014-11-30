// attach ready event
jQuery(document).ready(function() {
	jQuery(".ui.dropdown").dropdown();

	// selector cache
	var
		jQuerymenuItem = jQuery('.menu a.item, .menu .link.item'),
		jQuerydropdown = jQuery('.main.container .menu .dropdown'),
	// alias
		handler = {

		  	activate: function() {
		    	if(!jQuery(this).hasClass('dropdown')) {
		      		jQuery(this)
		        		.addClass('active')
		        		.closest('.ui.menu')
		        		.find('.item')
		          			.not(jQuery(this))
		          			.removeClass('active')
		      		;
		    	}
		  	}
		};

	jQuerydropdown.dropdown({
	  on: 'hover'
	});

	jQuerymenuItem.on('click', handler.activate);

});
