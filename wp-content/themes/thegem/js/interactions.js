(function ($) {
	"use strict";

	var gem = window.gem || {};
	
	window.gem = gem;
	
	gem.window = $(window);
	gem.windowWidth = gem.window.width();
	gem.scrollbarWidth = 0;

	$(document).ready(function() {
		var div = document.createElement('div');

		div.style.overflowY = 'scroll';
		div.style.width =  '50px';
		div.style.height = '50px';

		div.style.visibility = 'hidden';

		document.body.appendChild(div);
		gem.scrollbarWidth = div.offsetWidth - div.clientWidth;
		document.body.removeChild(div);
	});

	var recalcWindowInit = function() {
		gem.windowWidth = gem.window.width() + gem.scrollbarWidth;
	};
	
	function interactions() {
		$('.gem-interactions-enabled').each(function() {
			var $self = $(this),
				vertical_scroll_speed = $self.data('vertical_scroll_speed'),
				horizontal_scroll_speed = $self.data('horizontal_scroll_speed'),
				vertical_scroll_enable = $self.data('vertical_scroll_enable'),
				horizontal_scroll_enable = $self.data('horizontal_scroll_enable'),
				mouse_effects = $self.data('mouse_effects'),
				disable_effects_desktop = $self.data('disable_effects_desktop'),
				disable_effects_tablet = $self.data('disable_effects_tablet'),
				disable_effects_mobile = $self.data('disable_effects_mobile');
		
			if(vertical_scroll_enable == 'yes' || horizontal_scroll_enable == 'yes') {
				if(
					(disable_effects_desktop == 'disable' && gem.windowWidth > 991)
					|| (disable_effects_tablet == 'disable' && gem.windowWidth < 992 && gem.windowWidth > 767)
					|| (disable_effects_mobile == 'disable' && gem.windowWidth < 768)
				) {
					if($self.hasClass('rellax-inited')) {
						$self.css('transform', 'none');
						this.rellax.destroy();
						$self.removeClass('rellax-inited');
					}
				} else {
					if(!$self.hasClass('rellax-inited')) {
						this.rellax = new Rellax(this,
							{
								speed: 0,
								verticalSpeed: vertical_scroll_speed ? vertical_scroll_speed : null,
								horizontalSpeed: horizontal_scroll_speed ? horizontal_scroll_speed : null,
								center: true,
								horizontal: true,
								verticalScrollAxis: "xy",
								breakpoints:[767, 998, 1199]
							}
						);
						$self.addClass('rellax-inited');
					}
				}
			}
			
			if(mouse_effects == 'yes') {
				if(
					(disable_effects_desktop == 'disable' && gem.windowWidth > 991)
					|| (disable_effects_tablet == 'disable' && gem.windowWidth < 992 && gem.windowWidth > 767)
					|| (disable_effects_mobile == 'disable' && gem.windowWidth < 768)
				) {
					var mouse_effects_speed = 0,
						mouse_effects_direction = 0;
					$self.css('transform', 'none');
				} else {
					var mouse_effects_speed = $self.data('mouse_effects_speed'),
						mouse_effects_direction = $self.data('mouse_effects_direction');
				}
				
				$('html').mousemove(function (e) {
					let x_pos = (e.clientX / $(window).width() - 0.5) * 100 * mouse_effects_speed * mouse_effects_direction;
					let y_pos = (e.clientY / $(window).height() - 0.5) * 100 * mouse_effects_speed * mouse_effects_direction;

//					$($self[0]).css("transform", "translate3D(" + x_pos + "px, " + y_pos + "px, 0)");
					$self.find('> *').css("transform", "translate3D(" + x_pos + "px, " + y_pos + "px, 0)");
				});
			}
			
			$(window).on('scroll', function() {
				if( ( $self.hasClass('vc_row') || $self.hasClass('wpb_column') ) && $self.hasClass('animated')) {
						$self.css({
							'-webkit-animation-fill-mode': 'none',
							'animation-fill-mode': 'none'
						});
					setTimeout(function() {
					},200);
				}
			});
		});
	};
	
	$(window).on('load resize', function() {
		recalcWindowInit();
		interactions();
	});

}(jQuery));
