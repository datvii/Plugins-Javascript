/* !
* selectJs.js
* @author  Davyd Benidze
* @version 1.0
* @url
*/

/* global define, module*/
;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define([], factory(root));
    } else if (typeof exports === 'object') {
        module.exports = factory(root);
    } else {
        root.selectJs = factory(root);
    }

})(typeof global !== 'undefined' ? global : this.window || this.global, function(root) {
    'use strict';

    /**
     * Create constructor
     * @constructor
	 * @this  {selectJs}
	 * @public
	 * @param {Object} options User settings
	 */

    var selectJs = function(opts) { // constructor function
    	var objs = [selectJs.defaults, opts];
    	
    	// Merge user options with defaults
		var result = objs.reduce(function(r, o) { //cross-browser solution for IE support
			Object.keys(o).forEach(function(k) {
				r[k] = o[k];
			});

			return r;
		}, {});

    	this.options = result;
    	this.init(); //initialize functionality
    }

    /**
	 * Handle events
	 * @private
	 */

    function addEvents() {
    	var self = this;

    	if (!Element.prototype.matches) { //cross-browser solution

    		Element.prototype.matches = Element.prototype.matchesSelector ||
    		Element.prototype.webkitMatchesSelector ||
    		Element.prototype.mozMatchesSelector ||
    		Element.prototype.msMatchesSelector;

    	}

    	function attachHandlers(e) {
    		var target = e ? e.target : window.event.srcElement; //cross-browser solution
            var cl = typeof(self.options.activeClass) === 'string' ? self.options.activeClass : 'option-active' || 'option-active';

			if (e.target.matches(self.options.element + ' *:not(.option)')) {

				try {
                    if (self.getClosest(target, '.select-bar') === null) {
                        return;
                    }

					var content = self.getClosest(target, '.select-bar').nextSibling,
                        sct = self.getClosest(target, self.options.element);

                    if (self.getClosest(target, self.options.element) && self.getClosest(target, self.options.element).classList.contains('select-open')) {
                        self.isOutsideClick(false);
                    } else {
                        self.isOutsideClick(true);
                    }

					self.addScroll(content);
					content.classList.toggle('select-open');
					sct.classList.toggle('select-open');
				} catch(err) {
					throw err;
				}
		
			} else if (e.target.matches(self.options.element + ' .option')) {
				
				try {
					var opts = self.getClosest(target, '.select-options'),
                        optsInOneSel = opts.children,
						sct = self.getClosest(target, self.options.element),
						txt = target.innerText || target.innerContent,
						tagSelect = sct.previousSibling,
						activeEl = sct.querySelector('.selected-value'),
						attr = target.getAttribute('data-index');

					self.addScroll(opts);
					opts.classList.remove('select-open');
					sct.classList.remove('select-open');

					activeEl.innerText = txt;
					tagSelect.selectedIndex = attr;

                    if (optsInOneSel) {
                        for (var i = 0; i < optsInOneSel.length; i++) {
                            optsInOneSel[i].classList.remove(cl);
                        }
                    }

                    self.addActiveToOption(e.target, self.options.activeClass);

				} catch(err) {
					throw err;
				}

			}

             if (!e.target.matches(self.options.element + ' *')) {
                self.isOutsideClick(true);
            }

    	}

    	// Listener for click events
    	document.addEventListener('click', attachHandlers, false);
    }

    selectJs.prototype = {

    	/**
		 * Initialize Plugin
		 * @public
		 */

    	init: function() {
    		var scts = document.querySelectorAll(this.options.element + '-initialized');
    		
    		if (scts.length) {
    			return;
    		}

    		this.createSelect(true);
    		this.trackDom();
    		addEvents.call(this);
    	},

    	/**
    	* Returns found elements
    	* @returns {Array} - Dom elements
    	*/

    	findSelect: function() {
    		var select = document.querySelectorAll(this.options.element).length ? document.querySelectorAll(this.options.element + ':not(select)') : document.querySelectorAll('div' + this.options.element);

    		return select;
    	},

		/**
		 * Remove select from the page.
		 * @public
		 * @param {Boolean} isRemove
		 */

    	removeSelect: function(isRemove) {

    		if (isRemove) {
    			var els = this.findSelect();

    			for (var k = 0; k < els.length; k++) {
    				els[k].parentNode.removeChild(els[k]);
    			}
    		}
    	},

    	/**
		 * Create select.
		 * @public
		 * @param {Boolean} isRemove
		 */

    	createSelect: function(isRemove) {
    		var	i = 0,
    			scts = document.querySelectorAll('select'),
    			child = '';

    			if (typeof (isRemove) === 'undefined') {
    				return;
    			}

    			this.removeSelect(isRemove);

			for (; i < scts.length; i++) {

				if (scts[i].getAttribute('style') !== null) {
					scts[i].removeAttribute('style');
				}

				var select = document.createElement('div'),
	    			bar = document.createElement('div'),
	    			content = document.createElement('div'),
	    			val = document.createElement('span'),
					selLen = scts[i].length,
					optLen = scts[i].children.length;

                    ;[].forEach.call(scts[i].children, function(_, k) {
                        _.setAttribute('data-id', k);
                    });

                    var selectedOpt = document.querySelectorAll('option:checked', scts[i]);

                    ;[].forEach.call(selectedOpt, function(_) {
                        _.classList.add('option-selected');
                    }.bind(this));

				select.className = (this.options.element).slice(1) + ' ' + (this.options.element).slice(1) + '-initialized';
				select.setAttribute('data-select-id', i);
				scts[i].setAttribute('data-select-id', i);
				bar.className = 'select-bar';
				val.className = 'selected-value';
				content.className = 'select-options';
				
				bar.appendChild(val);
				select.appendChild(bar);
				select.appendChild(content);

				for (var j = 0; j < optLen; j++) {
					var options = document.createElement('span'),
						placeholder = scts[i].getAttribute('data-placeholder');
					
					child = scts[i].children[j].innerHTML;
					options.innerHTML = child;
					content.appendChild(options);
					options.className = 'option';
					options.setAttribute('data-index', j);
					options.tabIndex = j;

					this.addEasing(content);

                    if (scts[i].children[j].classList.contains('option-selected')) {
                        if (this.isSelected(scts[i].children[j])) {
                            options.className += ' option-active';
                            val.innerHTML = scts[i].children[j].innerText;
                        }
                    }

					if (j === 0) {
                        if (this.options.txtFromPlaceholder) {
                            val.innerHTML = placeholder;
                        } else {
                            val.innerHTML = scts[i].children[0].innerText;
                        }

						options.className += ' default';
					}
				}
				
				scts[i].parentNode.insertBefore(select, scts[i].nextSibling);
			}
    	},

    	/**
		 * Destroy our select.
		 * @public
		 */

    	destroy: function() {

			var els = document.querySelectorAll('select' + this.options.element),
				i = 0;

			this.removeSelect(true);

			for (; i < els.length; i++) {
				els[i].setAttribute('style',
					'position: static; opacity: 1; visibility: visible; z-index: 0; left: auto;'
				);

				els[i].removeAttribute('data-select-id');
			}

    	},

        /**
         * Check whether the element selected.
         * @public
         * @param {Element} el - Dom element
         * @returns {Boolean}
         */

        isSelected: function(el) {
            if (el && el.selected) {
                return true;
            } else {
                return false;
            }
        },

    	/**
		 * Adding easing to the current select.
		 * @public
		 * @param {Element} el - Dom element
		 */

    	addEasing: function(el) {

    		if (this.options.easing) {
    			el.classList.add('select-easing');
    		}

    	},

        /**
         * Check whether the click outside.
         * @public
         * @param {Boolean} outside
         */

        isOutsideClick: function(outside) {
            var scts = document.querySelectorAll('.select-open'),
                i = 0;

            if (outside) {
                for (; i < scts.length; i++) {
                    scts[i].classList.remove('select-open');
                }
            }
        },

    	/**
		 * Adding scroll to the current select.
		 * @public
		 * @param {Element} el - Dom element
		 */

    	addScroll: function(el) {
    		var whichTransitionEvent = function () {
    			var el = document.createElement('fakeelement'),
    				transitions = {
	    				'transition': 'transitionend',
	    				'OTransition': 'oTransitionEnd',
	    				'MozTransition': 'transitionend',
	    				'WebkitTransition': 'webkitTransitionEnd'
	    			}

    			for (var key in transitions) {

    				if (transitions.hasOwnProperty(key)) {
    					if (el.style[key] !== undefined) {
    						return transitions[key];
    					}
    				}

    			}
    		};

    		var transition = whichTransitionEvent();

    		el.setAttribute('style', 'overflow-y: hidden');

    		el.addEventListener(transition, function(e) {

    			if (e.propertyName === 'max-height') {
    				e.target.setAttribute('style', 'overflow-y: auto');
    			}

    		});

    	},

        /**
         * Adding active class to the selected option.
         * @public
         * @param {Element} el - Dom element
         */
        addActiveToOption: function(el, newClass) {
            if (el) {
                var cl = typeof(newClass) === 'string' ? newClass : 'option-active' || 'option-active';

                el.classList.add(cl);
            }
        },

    	getClosest: function (elem, selector) {

	        for (; elem && elem !== document; elem = elem.parentNode ) {
	            if ( elem.matches( selector ) ) return elem;
	        }

	        return null;
	    },

    	trackDom: function() {
    		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
    			self = this;

    		var changeSelect = function() {
				self.createSelect(true);
    		}

    		var createObserver = function() {
    			var target = document.querySelectorAll('select' + self.options.element);
    			
    			var _config = { // config object
    				characterData: true,
    				characterDataOldValue: true,
    				childList: true,
    				subtree: true
    			};

    			function subscriber(mutations) { // subscriber function
    				mutations.forEach(function(mutation) {
    					changeSelect();
    				});
    			}

    			var _observer = new MutationObserver(subscriber); // instantiating observer

    			for (var i = 0; i < target.length; i++) {
    				_observer.observe(target[i], _config); // observing target
    			}
    		}

    		if (MutationObserver) {
    			createObserver();
    		} else {
    			document.addEventListener('DOMSubtreeModified', function(e) {
    				changeSelect();
    			}, false);
    		}
    	}
    }

    selectJs.defaults = { // Attach our defaults for plugin to the plugin itself
    	element: '.selectJs',
    	txtFromPlaceholder: true,
    	easing: true,
        activeClass: 'option-active',
        outsideClick: true
    }

    //
    // Public APIs
    //

    return selectJs; // make accessible globally

});