/* !
* scrollJs.js
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
        root.scrollJs = factory(root);
    }

})(typeof global !== 'undefined' ? global : this.window || this.global, function(root) {
    'use strict';

    /**
     * @author Davyd Benidze
    */

    /**
     * Create constructor
     * @constructor
     * @this  {scrollJs}
     * @public
     * @param {Object} options User settings
     */

    var scrollJs = function(opts) { // constructor function
        var objs = [scrollJs.defaults, opts];

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
        var idle = 0,
            doc = document,
            body = doc.body,
            scroll = document.querySelector('.scroll_js'),
            scrollTop = 0,
            loadedHeight = document.documentElement.offsetHeight,
            self = this;
            this.flag = true;

        this.isScroll(scroll);
        this.trackDom();
        this.onDrug(scroll);

        function MouseWheelHandler(e) {
            var e = window.event || e; // old IE support
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))); // cross-browser wheel delta

            self.isMoving();

            if (delta > 0) {
                self.moveScroll(scroll, 'up', '0'); // scroll up
            } else {
                self.moveScroll(scroll, 'down'); //scroll down
            }

            self.setStorage(scroll);

            return false;
        }

        function onResize(e) {
            var newHeight = document.documentElement.offsetHeight;

            if (loadedHeight !== newHeight) {
                loadedHeight = newHeight;

                self.checkSizes();
                self.isScroll(scroll);
            }

            toggleStyle();
        }

        function toggleStyle() {
            var breakpoint = 'breakpoint';

            if (self.options.destroy && window.innerWidth > self.options.destroyOn) {
                scroll.parentElement.classList.remove(breakpoint);
                body.classList.remove(breakpoint);
            } else if (self.options.destroy && window.innerWidth < self.options.destroyOn) {

                if (body.classList.contains(breakpoint)) {
                    return;
                }

                // onDestroy callback
                if (typeof self.options.onDestroy === 'function') {
                    self.options.onDestroy.call(self);
                }

                scroll.parentElement.classList.add(breakpoint);
                body.classList.add(breakpoint);
                body.classList.remove('attachedEv');
            }
        }

        function checkMobile() {
            if (window.innerWidth > self.options.destroyOn) {

                if (document.body.classList.contains('attachedEv')) {
                    return;
                } else {
                    body.addEventListener("mousewheel", MouseWheelHandler, false); // IE9, Chrome, Safari, Opera
                    body.addEventListener("DOMMouseScroll", MouseWheelHandler, false); // Firefox
                    body.classList.add('attachedEv');
                }

            } else if (window.innerWidth < self.options.destroyOn) {
                document.body.removeEventListener("mousewheel", MouseWheelHandler, false); // IE9, Chrome, Safari, Opera
                document.body.removeEventListener("DOMMouseScroll", MouseWheelHandler, false); // Firefox
                body.classList.remove('attachedEv');
            }
        }

        // Listeners for different events
        window.addEventListener('load', function() {
            onResize()
            checkMobile();
        }, false);

        window.addEventListener('resize', function() {
            self.setStorage(scroll);
            checkMobile();
            onResize();
            self.checkSizes();
        }, false);

        window.addEventListener('orientationchange', function() {
            self.setStorage(scroll);
            checkMobile();
            onResize();
            self.checkSizes();
        }, false);
    }

    scrollJs.prototype = {

        /**
         * Initialize Plugin
         * @public
         */

        init: function() {
            if (document.querySelector('.scroll_wrap_js') || document.querySelector('.scroll_js')) {
                return;
            }

            this.createScroll();
            this.checkSizes();
            this.hideOnInactive();
            this.flag = false;
            this.timeoutID = undefined;
            this.isMobile();
            addEvents.call(this);

            // onInit callback
            if (typeof this.options.onInit === 'function') {
                this.options.onInit.call(this)
            }
        },

        createScroll: function() {
            if (document.querySelector('.scroll_wrap_js') || document.querySelector('.scroll_js')) {
                return;
            }

            var body = document.body,
                wrap = document.createElement('div'),
                scroll = document.createElement('span');

            wrap.className = 'scroll_wrap_js';
            scroll.className = 'scroll_js';
            scroll.setAttribute('draggable', true);

            wrap.appendChild(scroll);
            body.appendChild(wrap);
        },

        trackDom: function() {
            var el = document.querySelector('.scroll_js'),
                MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
                self = this;

            var createObserver = function() {
                var target = document;
                
                var _config = { // config object
                    characterData: true,
                    characterDataOldValue: true,
                    childList: true,
                    subtree: true
                };

                function subscriber(mutations) { // subscriber function
                    mutations.forEach(function(mutation) {
                        self.checkSizes();
                        self.isScroll(el);
                    });
                }

                var _observer = new MutationObserver(subscriber); // instantiating observer

                _observer.observe(target, _config); // observing target
            }

            if (MutationObserver) {
                createObserver();
            } else {
                document.addEventListener('DOMSubtreeModified', function() {
                    self.checkSizes();
                    self.isScroll(el);
                }, false);
            }
        },

        /**
         * Set local storage.
         * @public
         * @param {Element} el - Dom element
         */

        setStorage: function(el) {
            var dc = window.pageYOffset || document.documentElement.scrollTop,
                sc = this.getStyle(el).top;

            if (typeof(Storage) !== "undefined" && typeof(window.sessionStorage) !== "undefined") {

                if (this.options.destroy && window.innerWidth > this.options.destroyOn) {
                    sessionStorage.clear();

                    if (!sessionStorage.docPos) {
                        sessionStorage.setItem('docPos', dc);
                    }

                    if (!sessionStorage.scrollPos) {
                        sessionStorage.setItem('scrollPos', sc);
                    }

                }

            }
        },

        getStorage: function() {
            if (typeof(Storage) !== "undefined" && typeof(window.sessionStorage) !== "undefined") {
                var doc = sessionStorage.getItem("docPos") || 0,
                    scroll = sessionStorage.getItem("scrollPos") || 0;
            }

            return {
                docPos: doc || 0,
                scrollPos: scroll || 0
            }
        },

        isMoving: function() {
            this.showOnActive();

            if (this.flag === true) {
                window.clearTimeout(this.timeoutID);
                
                this.hideOnInactive(this.flag);
            }
        },

        /**
         * Return style of the element.
         * @public
         * @param {Element} el - Dom element
         * @returns {(String|Array)}
         */

        getStyle: function(el)  { //cross-browser solution
            return window.getComputedStyle ? getComputedStyle(el, "") : el.currentStyle;
        },

        /**
         * Return coordinates of the element.
         * @public
         * @param {Element} el - Dom element
         * @returns {Object}.
         */

        getCoords: function(el) { // except IE8-
            var box = el.getBoundingClientRect();

            return {
                top: box.top + pageYOffset,
                left: box.left + pageXOffset
            };
        },

        checkSizes: function() {
            var elWrap = document.querySelector('.scroll_wrap_js'),
                el = elWrap.querySelector('.scroll_js'),
                elWrapWidth = parseInt(this.getStyle(elWrap).width.slice(0, -2)),
                elWidth = parseInt(this.getStyle(el).width.slice(0, -2));

                if (elWrapWidth < 4) {
                    elWrap.setAttribute('style', 'width: 4px !important');
                    el.setAttribute('style', 'width: 2px !important');
                } else if (elWrapWidth > 26) {
                    elWrap.setAttribute('style', 'width: 26px !important');
                    el.setAttribute('style', 'width: 24px !important');
                }

                if (elWrapWidth - elWidth != 2) {
                    el.setAttribute('style', 'width: ' + (elWrapWidth - 2) + 'px !important');
                }

                el.setAttribute('style', ' top:' + this.getStorage().scrollPos + '; height: ' + this.setScrollHeight(el).newHeight + 'px !important;'); //set scroll position
                
                document.documentElement.scrollTop = (this.getStorage().docPos); //set document position
        },

        /**
         * Set local storage.
         * @public
         * @param {Element} el - Dom element
         */

        isScroll: function(el) {
            document.documentElement.offsetHeight <= document.documentElement.clientHeight ? el.parentElement.setAttribute('style', 'display: none;') : el.parentElement.setAttribute('style', 'display: block;');
        },

        /**
         * Return old and new height of document.
         * @public
         * @param {Element} el - Dom element
         * @returns {Object}
         */

        setScrollHeight: function(el) {
            var newScHeight = document.documentElement.clientHeight / document.documentElement.offsetHeight * 100;
            var height = document.documentElement.clientHeight * newScHeight / 100;

            return {
                newHeight: parseInt(height - 2),
                docHeight: document.documentElement.offsetHeight - (document.documentElement.clientHeight)
            };
        },

        /**
         * Return difference between scroll and document position.
         * @public
         * @param {Element} el - Dom element
         * @returns {Number}
         */

        getDifferenceScroll: function(el) {
            return document.documentElement.clientHeight - el.offsetHeight - 2;
        },

        /**
         * Return scroll and document position.
         * @public
         * @param {Element} el - Dom element
         * @returns {Object}
         */

        calculateScroll: function(el) {
            var scrollPos = parseInt((this.getStyle(el).top.slice(0, -2) / this.getDifferenceScroll(el)) * 100);
            var docPos = parseInt(this.setScrollHeight(el).docHeight * (scrollPos * .01));

            return {
                scroll: scrollPos,
                doc: docPos
            };
        },

        /**
         * Scroll to the top.
         * @public
         * @param {Element} el - Dom element
         * @param {Number} [initial = 0]
         */

        scrollIt: function(el, initial) {
            var intl = initial || 0;

            window.scrollTo(intl, el);
        },

        /**
         * Moving the scroll.
         * @public
         * @param {Element} el - Dom element
         * @param {String} direction
         * @param {(String|Number)} [scrollTop]
         */

        moveScroll: function(el, direction, scrollTop) {

            if (el.length || typeof(el) != 'undefined') {
                var count = parseInt(document.documentElement.clientHeight * 1.8 / 100); //this value equal to 1.8 equal to 1.8vh
                var sliderElem = document.querySelector('.scroll_wrap_js');

                if (direction === 'up') {
                    el.style.top = (parseInt(el.style.top) - count + 'px');
                    
                    setTimeout(function() {
                        this.scrollIt(this.calculateScroll(el).doc);
                    }.bind(this), 30);
                        
                } else {
                    var topEdge = sliderElem.offsetHeight - el.offsetHeight;

                    el.style.top = (parseInt(el.style.top) + count) + 'px';

                    if (el.style.top.slice(0, -2) >= topEdge - 2) {
                        el.style.top = (topEdge - 2) + 'px';
                        this.scrollIt(document.documentElement.offsetHeight - 2);

                        return;
                    }

                    setTimeout(function() {
                        this.scrollIt(this.calculateScroll(el).doc);
                    }.bind(this), 30);
                }

                if (el.style.top.slice(0, -2) <= 0) {
                    el.style.top = 0;

                    this.scrollIt(0);

                    return;
                }

                // onScroll callback
                if (typeof this.options.onScroll === 'function') {
                    this.options.onScroll.call(this)
                }
                
            }
        },

        /**
         * Drug the scroll.
         * @public
         * @param {Element} el - Dom element
         */

        onDrug: function(el) {
            var sliderElem = document.querySelector('.scroll_wrap_js'),
                thumbElem = sliderElem.children[0],
                self = this;
                self.flag = true;

            thumbElem.onmousedown = function(e) {
                var thumbCoords = self.getCoords(thumbElem),
                    shiftY = e.clientY - thumbCoords.top, //only horizonatal mode
                    sliderCoords = self.getCoords(sliderElem);

                document.onmousemove = function(e) {
                    var newTop = e.clientY - shiftY - sliderCoords.top; //  substract parent coordinate, т.к. position: relative

                    self.isMoving();
                    
                    if (newTop < 0) { // cursor goes beyond slider
                      newTop = 0;
                    }

                    var topEdge = sliderElem.offsetHeight - thumbElem.offsetHeight;

                     if (newTop > 0 && newTop < topEdge) {  
                        // onDrug callback
                        if (typeof self.options.onDrug === 'function') {
                            self.options.onDrug.call(self)
                        }
                    }

                    if (newTop > topEdge) {
                      newTop = topEdge - 2;
                    }

                    thumbElem.style.top = newTop + 'px';

                    self.scrollIt(self.calculateScroll(el).doc);
                    self.setStorage(el);

                };

                document.onmouseup = function() {
                    document.onmousemove = document.onmouseup = null;
                };

                return false; // disable selection start (cursor change)
            };

            thumbElem.ondragstart = function() {
                return false;
            };
        },

        hideOnInactive: function() {
            if (this.options.hideSlider && this.options.hideSlider === true) {
                var scrollBar = document.querySelector('.scroll_wrap_js');

                this.timeoutID = window.setTimeout(function() {
                    if (!~scrollBar.className.indexOf('hide')) {
                        scrollBar.classList.add('hide');
                        this.flag = true;
                    }
                }, this.options.duration);
            }
        },

        showOnActive: function() {
            if (this.options.hideSlider && this.options.hideSlider === true) {
                var scrollBar = document.querySelector('.scroll_wrap_js');

                if (~scrollBar.className.indexOf('hide')) {
                    scrollBar.className = scrollBar.className.replace(/\bhide\b/g, "");
                }
            }
        },

        isMobile: function() {
            if (this.options.mobile && this.options.mobile === false) {
                if (this.detectMobDevices()) {
                    var scrollBar = document.querySelector('.scroll_wrap_js');

                    document.body.style.overflow = 'visible';
                    scrollBar.style.display = 'none';
                } 
            }
        },

        detectMobDevices: function() { 
            if( navigator.userAgent.match(/Android/i)
                || navigator.userAgent.match(/webOS/i)
                || navigator.userAgent.match(/iPhone/i)
                || navigator.userAgent.match(/iPad/i)
                || navigator.userAgent.match(/iPod/i)
                || navigator.userAgent.match(/BlackBerry/i)
                || navigator.userAgent.match(/Windows Phone/i)) {
                return true;
            } else {
                return false;
            }
        }
    }

    scrollJs.defaults = { // Attach our defaults for plugin to the plugin itself
        hideSlider: false,
        duration: 5000,
        mobile: false,
        destroy: false,
        destroyOn: 768,
        onInit: null,
        onDrug: null,
        onScroll: null,
        onDestroy: null
    }

    //
    // Public APIs
    //

    return scrollJs;

});