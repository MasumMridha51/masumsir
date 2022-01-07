(function($) {

	function HeaderAnimation(el, options) {
		this.el = el;
		this.$el = $(el);
		this.options = {
			startTop: 1
		};
		$.extend(this.options, options);
		this.initialize();
	}

	HeaderAnimation.prototype = {
		initialize: function() {
			var self = this;
			this.$page = $('#page').length ? $('#page') : $('body');
			this.$wrapper = $('#site-header-wrapper');
			this.$topArea = $('#top-area');
			this.topAreaInSiteHeader = $('#site-header #top-area').length > 0;
			this.$headerMain = $('.header-main', this.$el);
			this.hasAdminBar = document.body.className.indexOf('admin-bar') != -1;
			this.adminBarOffset = 0;
			this.adminBarHeight = 0;
			this.topOffset = 0;
			this.oldScrollY = 0;
			this.isResponsive = null;
			this.isResponsiveOld = null;
			this.elHeight = this.$el.outerHeight();
			this.elHeightOld = this.$el.outerHeight();
			this.headerInited = false;
			this.windowWidth = $(window).width();

			this.hideWrapper = this.$wrapper.hasClass('site-header-wrapper-transparent');
			this.videoBackground = $('.page-title-block .gem-video-background').length && $('.page-title-block .gem-video-background').data('headerup');

			if(this.$el.hasClass('header-on-slideshow') && $('#main-content > *').first().is('.gem-slideshow, .block-slideshow')) {
				this.$wrapper.css({position: 'absolute'});
			}

			if(this.$el.hasClass('header-on-slideshow') && $('#main-content > *').first().is('.gem-slideshow, .block-slideshow')) {
				this.$wrapper.addClass('header-on-slideshow');
			} else {
				this.$el.removeClass('header-on-slideshow');
			}

			if(this.videoBackground) {
				this.$el.addClass('header-on-slideshow');
				this.$wrapper.addClass('header-on-slideshow');
			}

			this.initHeader();

			$(document).ready(function() {
				self.updateAdminBarInfo();
				self.updateStartTop();
			});

			$(window).scroll(function() {
				self.scrollHandler();
			});

			if ($('#thegem-perspective').length) {
				this.$page.scroll(function() {
					self.scrollHandler();
				});
			}

			$(window).resize(function() {
				setTimeout(function() {
					if (self.windowWidth != $(window).width()) {
						self.initHeader();
						self.scrollHandler();
						self.windowWidth = $(window).width();
					}
				}, 0);
			});

			//load header fix
			if (document.readyState === 'complete') {
				self.$el.addClass('ios-load');
			} else {
				window.onload = function() {
					self.$el.addClass('ios-load');
				};
			}
		},

		initHeader: function() {
			this.isResponsiveOld = this.isResponsive;
			this.isResponsive = window.isResponsiveMenuVisible();
			this.elHeightOld = this.elHeight;
			this.elHeight = this.$el.outerHeight();

			if (this.isResponsive) {
				this.$el.addClass('shrink-mobile');
			} else {
				this.$el.removeClass('shrink-mobile');
			}

			this.updateAdminBarInfo();
			this.updateStartTop();
			if (this.isResponsive != this.isResponsiveOld || this.elHeight != this.elHeightOld) {
				this.initializeStyles();
			}
		},

		updateAdminBarInfo: function() {
			if (this.hasAdminBar) {
				this.adminBarHeight = $('#wpadminbar').outerHeight();
				this.adminBarOffset = this.hasAdminBar && $('#wpadminbar').css('position') == 'fixed' ? parseInt(this.adminBarHeight) : 0;
			}
		},

		updateStartTop: function() {
			if (this.$topArea.length && this.$topArea.is(':visible') && !this.topAreaInSiteHeader) {
				this.options.startTop = this.$topArea.outerHeight();
			} else {
				this.options.startTop = 1;
			}

			if (this.hasAdminBar && this.adminBarOffset == 0) {
				this.options.startTop += this.adminBarHeight;
			}
		},

		setMargin: function($img) {
			var $small = $img.siblings('img.small'),
				w = 0;

			if (this.$headerMain.hasClass('logo-position-right')) {
				w = $small.width();
			} else if (this.$headerMain.hasClass('logo-position-center') || this.$headerMain.hasClass('logo-position-menu_center')) {
				w = $img.width();
				var smallWidth = $small.width(),
					offset = (w - smallWidth) / 2;

				w = smallWidth + offset;
				$small.css('margin-right', offset + 'px');
			}
			if (!w) {
				w = $img.width();
			}
			$small.css('margin-left', '-' + w + 'px');
			$img.parent().css('min-width', w + 'px');

			$small.show();
		},

		initializeStyles: function() {
			var self = this;

			if (this.$headerMain.hasClass('logo-position-menu_center')) {
				var $img = $('#primary-navigation .menu-item-logo a .logo img.default', this.$el);
			} else {
				var $img = $('.site-title .site-logo a .logo img', this.$el);
			}

			if ($img.length && $img[0].complete) {
				self.setMargin($img);
				self.initializeHeight();
			} else {
				$img.on('load error', function() {
					self.setMargin($img);
					self.initializeHeight();
				});
			}
		},

		initializeHeight: function() {
			if (this.hideWrapper) {
				this.headerInited = true;
				return false;
			}

			that = this;

			setTimeout(function() {
				var shrink = that.$el.hasClass('shrink');
				if (shrink) {
					that.$el.removeClass('shrink').addClass('without-transition');
				}
				var elHeight = that.$el.outerHeight();

				//load header fix
				if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
					that.$wrapper.css('min-height', elHeight);
				} else {
					that.$wrapper.height(elHeight);
				}

				if (shrink) {
					that.$el.addClass('shrink').removeClass('without-transition');
				}
				that.headerInited = true;
			}, 50);
		},

		scrollHandler: function() {
			if (!this.headerInited || window.gemSettings.fullpageEnabled || $('body').hasClass('vc_editor')) {
				return;
			}

			var self = this,
				scrollY = this.getScrollY();

			if (scrollY >= this.options.startTop) {
				if (this.isResponsive && this.$wrapper.hasClass('sticky-header-on-mobile-disabled') && scrollY < this.options.startTop + $('#site-header-wrapper').height()) {
					return;
				}
				if (!this.$el.hasClass('shrink')) {
					var shrinkClass = 'shrink fixed';
					if (window.gemSettings.fillTopArea) {
						shrinkClass += ' fill';
					}
					if (this.$wrapper.hasClass('sticky-header-on-mobile-disabled')) {
						shrinkClass += '  hidden hide-immediately';
					}
					this.$el.addClass(shrinkClass);
					//$('.hamburger-group').not('.hamburger-size-small-original').addClass('hamburger-size-small');
					//$('.perspective-toggle, .overlay-toggle').not('.toggle-size-small-original').addClass('toggle-size-small');
				}
				var top = 0;
				if (this.$page[0].scrollTop > 0) {
					top += this.$page[0].scrollTop;
				} else {
					if (this.hasAdminBar) {
						top += this.adminBarOffset;
					}
				}

				this.$el.css({
					top: top != 0 ? top : ''
				});
			} else {
				if (this.$el.hasClass('shrink')) {
					this.$el.removeClass('shrink fixed');
					//$('.hamburger-group').not('.hamburger-size-small-original').removeClass('hamburger-size-small');
					//$('.perspective-toggle, .overlay-toggle').not('.toggle-size-small-original').removeClass('toggle-size-small');
				}
				if (this.hasAdminBar) {
					this.$el.css({
						top: ''
					});
				}
			}

			if (this.isResponsive && !this.$wrapper.hasClass('sticky-header-on-mobile')) {
				if (!$('.mobile-menu-slide-wrapper.opened').length && !$('#primary-menu.dl-menuopen').length && !$('.menu-overlay.active').length) {
					var hideScroll = 300;
					if (this.$wrapper.hasClass('sticky-header-on-mobile-disabled')) {
						hideScroll = 0;
					}
					if (scrollY - this.oldScrollY > 0 && scrollY > hideScroll && !this.$el.hasClass('hidden')) {
						self.$el.addClass('hidden');
					}
					if (scrollY - this.oldScrollY < 0 && this.$el.hasClass('hidden')) {
						if (this.$el.hasClass('hide-immediately')) {
							self.$el.removeClass('hide-immediately');
						} else {
							self.$el.removeClass('hidden');
						}
					}
				} else {
					self.$el.removeClass('hidden');
				}
			}

			this.oldScrollY = scrollY;
		},

		getScrollY: function() {
			return window.pageYOffset || document.documentElement.scrollTop + this.$page[0].scrollTop;
		},
	};

	$.fn.headerAnimation = function(options) {
		options = options || {};
		return new HeaderAnimation(this.get(0), options);
	};
})(jQuery);