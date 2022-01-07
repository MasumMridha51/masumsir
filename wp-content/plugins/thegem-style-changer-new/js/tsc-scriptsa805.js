(function($) {
	/*var $cssLink = $('#tsc-style-id');
	if ($cssLink[0].sheet) {
		run();
	} else {
		$cssLink.on('load', run);
	}*/

	var $container = $('.style-changer-holder'),
		$buttons = $('.tsc-button', $container),
		$boxes = $('.tsc-content-box', $container);

	window.runStyleChanger = function(){
		if(!window.styleChangerAjaxLoaded || window.styleChangerRun) return;
		window.styleChangerRun = true;
		$container = $('.style-changer-holder');
		$buttons = $('.tsc-button', $container);
		$boxes = $('.tsc-content-box', $container);

		setTimeout(run, 10);
	}

	window.runStyleChanger();

	function run() {
		setTimeout(function() {
			//$container.removeClass('not-inited');
		}, 100);
		setTimeout(init, 100);
	}

	function fixDoubleScroll() {
		if ($container.is('.collapsed')) {
			var scrollWidth = 0;

			$('.tsc-content-box-scroll', $boxes).each(function() {
				if (this.offsetWidth > this.clientWidth) {
					scrollWidth = this.offsetWidth - this.clientWidth;
					return false;
				}
			});

			if (scrollWidth > 0) {
				$container.css('width', (377 - scrollWidth) + 'px');

				$('.tsc-content-box-scroll', $boxes).each(function() {
					if (this.offsetWidth > this.clientWidth) {
						$(this).css('padding-right', '');
					} else {
						$(this).css('padding-right', scrollWidth + 'px');
					}
				});
			} else {
				$container.css('width', '362px');
				$('.tsc-content-box-scroll', $boxes).css('padding-right', '15px');
			}
		} else {
			$container.css('width', '');
			$('.tsc-content-box-scroll', $boxes).css('padding-right', '');
		}
	}

	function activateTab($button, needSetCookie) {
		if ($button.hasClass('active')) {
			close();
			return;
		}

		$buttons.removeClass('active');
		$button.addClass('active');

		$boxes.removeClass('active');
		$boxes.filter('[data-box-id="' + $button.data('id') + '"]').addClass('active');

		if (needSetCookie === undefined) {
			needSetCookie = true;
		}

		if (!$container.hasClass('collapsed')) {
			$container.addClass('collapsed');
			fixDoubleScroll();

			//$('body, html').animate({scrollTop: 0});

			if (needSetCookie) {
				setCookie('style_changer_status', 'open', { path: '/', SameSite: 'None', Secure: true });
			}

			setTimeout(function() {
				$container.addClass('animated-boxes');
			}, 100);
		}
	}

	function close() {
		$container.removeClass('collapsed animated-boxes');
		fixDoubleScroll();

		$buttons.removeClass('active');
		setTimeout(function() {
			$boxes.removeClass('active');
		}, 600);

		setCookie('style_changer_status', 'closed', { path: '/', SameSite: 'None', Secure: true });
	}

	function init() {
		var status = getCookie('style_changer_status');

		if (status == undefined || status == 'open') {
			var activeBtn = $buttons.last();
			if (window.location.search.match(/tsc_options/)!=null) {
				activeBtn = $buttons.first();
			}
			//activateTab(activeBtn, false);

			$('.tsc-buttons', $container).addClass('tsc-animation-enabled');

			if (status == undefined) {
				setTimeout(close, 3000);
			}
		} else {
			$('.tsc-buttons', $container).addClass('tsc-animation-enabled');
		}

		if (!getCookie('style_changer_sites_tooltip')) {
			$('.tsc-button-new-sites-tooltip', $container).fadeIn();

			$('.tsc-button-new-sites', $container).on('click', function() {
				setCookie('style_changer_sites_tooltip', 1, { path: '/', SameSite: 'None', Secure: true });
				$('.tsc-button-new-sites-tooltip', $(this)).fadeOut();
			});
		}

		$buttons.on('click', function(e) {
			e.preventDefault();
			var $button = $(this);
			$button.removeClass('clicked');
			if($container.hasClass('activated')) {
				activateTab($(this));
			} else {
				$.ajax({
					type: 'POST',
					url: window.fullStyleChangerLink,
					dataType: 'json',
					success: function (response) {
						var styleChanger = document.querySelector('.style-changer');
						styleChanger.insertAdjacentHTML('beforeend', response.content);
						fullInit();
						$container.addClass('activated');
						$button.trigger('click');
					}
				});
			}
		});

		$buttons.filter('.clicked').trigger('click');

		$(document).on('click', function(event) {
			if (!$(event.target).closest('.style-changer-holder').length && $container.hasClass('collapsed')) {
				close();
			}
		});

		function fullInit() {
			$boxes = $('.tsc-content-box', $container);
			$('.tsc-close', $container).on('click', function(e) {
				close();
				e.preventDefault();
			});

			$('.tsc-control-button', $container).on('click', function(e) {
				e.preventDefault();
				var $form = $(this).closest('form');
				var $field = $('[name="tsc_options['+$(this).data('tsc-option')+']"]', $form);
				$field.val($(this).data('tsc-value'));
				$(this).addClass('active');
				$form.submit();
			});

			$('.tsc-presale-button-popup, .tsc-presale-new-button-popup', $container).on('click', function(e) {
				e.preventDefault();
				$.fancybox.open({
					title: false,
					type: 'inline',
					src: '#presale-form',
					width: 610,
					padding: 0,
					autoSize: false,
					autoHeight: true
				});
			});

			var $presaleForm = $('#presale-form div.wpcf7 > form');
			if ($presaleForm.length == 1 && window.wpcf7 !== undefined && window.wpcf7 !== null && typeof window.wpcf7.initForm === 'function') {
				window.wpcf7.initForm($presaleForm);
				if (window.wpcf7.cached) {
					window.wpcf7.refill($presaleForm);
				}
			}

			if (wpcf7.apiSettings !== undefined) {
				var tscOldGetRouteFunction = wpcf7.apiSettings.getRoute;

				wpcf7.apiSettings.getRoute = function(path) {
					var route = tscOldGetRouteFunction(path),
						mainDomain = $container.data('main-domain')

					if (mainDomain) {
						var index = route.indexOf('/wp-json/');
						if (index !== -1) {
							route = mainDomain + route.substring(index);
						}
					}

					return route;
				}
			}

			$('.tsc-menu-container #primary-menu', $container).on('mouseenter', '> li.menu-item-has-children', function() {
				var $menuItem = $(this),
					$child = $('> ul', this),
					position = $(this).position();

				$child.css('top', position.top);

				if ($(this).hasClass('megamenu-enable')) {
					fix_megamenu_position(this, function() {
						return window.gemOptions.clientWidth - $container.outerWidth();
					});

					var clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
						childHeight = $child.outerHeight();

					if (position.top + childHeight > clientHeight) {
						$child.css('top', clientHeight - childHeight - 20);
					}
				} else {
					var $items = $('ul', this);

					$items.removeClass('invert vertical-invert');

					var topItemTranslate = 0;
					if ($child.css('transform')) {
						topItemTranslate = parseInt($child.css('transform').split(',')[5]);
					}
					if (isNaN(topItemTranslate)) {
						topItemTranslate = 0;
					}

					$items.each(function() {
						var $item = $(this);
						var self = this;

						var windowScroll = $(window).scrollTop(),
							itemOffset = $item.offset(),
							itemOffsetTop = itemOffset.top - windowScroll,
							itemOffsetLeft = itemOffset.left,
							itemHeight = $item.outerHeight();

						if (itemOffsetTop - topItemTranslate + itemHeight > $(window).height()) {
							if (self == $child[0]) {
								var itemOffsetFix = 0;

								if (itemOffsetTop - topItemTranslate - itemHeight > 0) {
									itemOffsetFix = itemHeight - $menuItem.outerHeight();
								} else {
									itemOffsetFix = itemOffsetTop - topItemTranslate + itemHeight - $(window).height() + 20;
								}

								$item.css('top', position.top - itemOffsetFix);
							} else {
								if (itemOffsetTop - topItemTranslate - itemHeight > 0) {
									$item.addClass('vertical-invert');
								} else {
									$item.css('top', -(itemOffsetTop - topItemTranslate + itemHeight - $(window).height() + 20));
								}
							}
						}
					});
				}
			});
		}

		$('.tsc-ga-event-button', $container).on('click', function(e) {
			if (typeof(gtag) !== 'function') {
				return;
			}

			var id = $(this).attr('id');

			switch (id) {
				case 'tsc-main-button':
					gtag('event', 'click', {'event_category': 'STYLE_CHANGER', 'event_label': 'Gear'});
					break;
				case 'tsc-sites-button':
					gtag('event', 'click', {'event_category': '400_BUTTON', 'event_label': '400+ Demos Button'});
					break;
				case 'tsc-purchase-button':
					gtag('event', 'click', {'event_category': 'GEAR_PURCHASE_BUTTON', 'event_label': 'Gear Purchase Button'});
					break;
				case 'tsc-presale-button':
					gtag('event', 'click', {'event_category': 'GEAR_PRESALE_BUTTON', 'event_label': 'Gear Pre-Sale Button'});
					break;
				case 'tsc-purchase-new-button':
					gtag('event', 'click', {'event_category': '400_PURCHASE_BUTTON', 'event_label': '400+ Purchase Button'});
					break;
				case 'tsc-presale-new-button':
					gtag('event', 'click', {'event_category': '400_PRESALE_BUTTON', 'event_label': '400+ Pre-Sale Button'});
					break;
				case 'tsc-showcase-button':
					gtag('event', 'click', {'event_category': 'SHOWCASE_BUTTON', 'event_label': 'View Showcase'});
					break;
				case 'tsc-see-all-button':
					gtag('event', 'click', {'event_category': 'SEE_ALL_BUTTON', 'event_label': 'See All Demos'});
					break;
				case 'tsc-blocks-button':
					gtag('event', 'click', {'event_category': 'BLOCKS_STYLE_CHANGER', 'event_label': 'Gear Blocks'});
					break;
				case 'tsc-blocks-new-button':
					gtag('event', 'click', {'event_category': 'BLOCKS_STYLE_CHANGER', 'event_label': '400 Blocks'});
					break;
			}
		});
	}

	function setCookie(name, value, options) {
		options = options || {};

		var expires = options.expires;

		if (typeof expires == "number" && expires) {
			var d = new Date();
			d.setTime(d.getTime() + expires * 1000);
			expires = options.expires = d;
		}

		if (expires && expires.toUTCString) {
			options.expires = expires.toUTCString();
		}

		value = encodeURIComponent(value);

		var updatedCookie = name + "=" + value;

		for (var propName in options) {
			updatedCookie += "; " + propName;
			var propValue = options[propName];
			if (propValue !== true) {
				updatedCookie += "=" + propValue;
			}
		}

		document.cookie = updatedCookie;
	}

	function getCookie(name) {
		var matches = document.cookie.match(new RegExp(
			"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		));
		return matches ? decodeURIComponent(matches[1]) : undefined;
	}
})(jQuery);
