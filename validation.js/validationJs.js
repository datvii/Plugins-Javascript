/* !
* validationJs.js
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
        root.validationJs = factory(root);
    }

})(typeof global !== 'undefined' ? global : this.window || this.global, function(root) {
    'use strict';

    /**
     * @author Davyd Benidze
    */

    /**
     * Create constructor
     * @constructor
     * @this  {validationJs}
     * @public
     * @param {Object} options User settings
     */

    var validationJs = function(opts) { // constructor function
    	var objs = [validationJs.defaults, opts];

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
    	if (!Element.prototype.matches) { //cross-browser solution

    		Element.prototype.matches = Element.prototype.matchesSelector ||
    		Element.prototype.webkitMatchesSelector ||
    		Element.prototype.mozMatchesSelector ||
    		Element.prototype.msMatchesSelector;

    	}

        var self = this;

    	function validate(e) {
    		var target = e ? e.target : window.event.srcElement, //cross-browser solution
    			el = self.findForms(),
    			form = document.querySelectorAll(self.options.element),
    			fields = self.options.element + ' input:not([type="submit"]):not([type="button"]), textarea, select' || 'form input:not([type="submit"]):not([type="button"]), textarea, select',
    			submit = self.options.element + ' input[type="submit"], input[type="button"], button' || 'form input[type="submit"], input[type="button"], button',
    			inps = self.options.element + ' input:not([type="submit"]):not([type="button"]), textarea' || 'form input:not([type="submit"]):not([type="button"]), textarea';

    		if (e.type === 'click' && target.matches(submit)) {

    			try {
    				self.validateFieldsOnSubmit(target, e);
    			} catch(err) {
    				throw err;
    			}

    		}

    		if ((e.type === 'input') || (e.type === 'change') && target.matches(inps)) {
    			self.validateFieldsOnKeyPress(target, e);
    		}

    	}

        // Listeners for different events
		if (self.options.keypress) {
			document.addEventListener('input', validate, false);
			document.addEventListener('change', validate, false);
		}

		document.addEventListener('click', validate, false);

    }

    validationJs.prototype = {

        /**
         * Initialize Plugin
         * @public
         */

    	init: function() {
    		addEvents.call(this);
    	},

    	findForms: function() {
    		var forms = document.querySelectorAll(this.options.element).length ? document.querySelectorAll(this.options.element) : document.querySelectorAll('form');

    		return forms;
    	},

        /**
        * Validating of fields on submit event.
        * @public
        * @param {Element} forms - DOM element
        */

    	validateFieldsOnSubmit: function(forms, e) {

    		if (forms) {
    			var parent = (this.getParents(forms)),
    				form,
    				result,
    				arr = [];

    			form = parent.filter(function(_) {
    				return _.nodeName.toLowerCase() === 'form';
    			});

    			var fields = form[0].querySelectorAll(' input:not([type="submit"]):not([type="button"]), textarea, select');

    			if (form[0].classList.contains('valid')) {
    				form[0].classList.remove('valid');
    			}

    			this.checkForms(fields, form);

    			[].forEach.call(fields, function(el) {

    				if (el.className.match('invalid') !== null) {
    					arr.push(el.className.match('invalid')[0]);
    				}

    			}.bind(this));

    			function valid(el) {
    				return el === 'invalid';
    			};

    			result = arr.some(valid);
    			
    			if (!result) {
    				this.submitForm(e, true, form[0]);
    			} else {
    				this.submitForm(e, false, form[0]);
    			}

    		}

    	},

        /**
        * Validating of fields on key press event.
        * @public
        * @param {Element} forms - DOM element
        */

    	validateFieldsOnKeyPress: function(forms, e) {
    		var parent = (this.getParents(forms)),
				form;

			form = parent.filter(function(_) {
				return _.nodeName.toLowerCase() === 'form';
			});

    		if (this.options.keypress) {

    			try {
    				form[0].classList.add('keypress');
    				this.checkForms(e.target, form[0]);
    			} catch(err) {}
    			
    		} else {

    			try {
    				form[0].classList.remove('keypress');
    			} catch(err) {}

    		}

    	},

        /**
        * Setting type of validation.
        * @public
        * @param {String} type
        * @param {Element} el - DOM element
        */

    	setValidationType: function(type, el) {

    		if (this.options.showErrors) {

	    		switch(type) {
	    			case 'required':
		    			this.setErrors(0, el);
		    			break;

	    			case 'number':
		    			this.setErrors(1, el);
		    			break;

	    			case 'email':
		    			this.setErrors(2, el);
		    			break;

	    			case 'checkbox':
		    			this.setErrors(3, el);
		    			break;

	    			case 'radio':
		    			this.setErrors(4, el);
		    			break;

	    			case 'select':
		    			this.setErrors(5, el);
		    			break;

	    			case 'equal':
		    			this.setErrors(6, el);
		    			break;

	    			case 'minLen':
		    			this.setErrors(7, el);
		    			break;

	    			case 'maxLen':
		    			this.setErrors(8, el);
		    			break;

		    		default:
	    				console.warn('Something goes wrong!');
	    		}

	    	}

    	},

        /**
        * Validation fields of form.
        * @public
        * @param {Boolean} valid
        * @param {Element} el - DOM element
        */

    	isValid: function(valid, el) {
    		
    		if (valid) {
    			el.classList.remove('invalid');
    			el.classList.add('valid');

    			if (this.options.parent) {
    				el.parentElement.classList.remove('invalid');
    				el.parentElement.classList.add('valid');
    			}

    		} else {
    			el.classList.remove('valid');
    			el.classList.add('invalid');

    			if (this.options.parent) {
    				el.parentElement.classList.remove('valid');
    				el.parentElement.classList.add('invalid');
    			}

    		}

    	},

        /**
        * Return string of email.
        * @public
        * @param {String} email
        * @returns {string}
        */

    	isEmail: function(email) {
    		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    		return re.test(String(email.value).toLowerCase());
    	},

        /**
        * Return string of number.
        * @public
        * @param {String} numbers
        * @returns {string}
        */

    	isNumber: function(numbers) {
    		var re = /^\d+$/;

    		return re.test(numbers.value);
    	},

        /**
        * Return true if fields are equal.
        * @public
        * @param {Boolean} valid
        * @param {Element} fileds - DOM element
        * @returns {Boolean}
        */

    	isEqual: function(fields) {

    		if (fields.length) {	
    			var arr = [].slice.call(fields);

    			return arr.every(function(_) {
    				return _.value === arr[0].value;
    			});
    		}

    	},

        /**
        * Return true if condition matched.
        * @public
        * @param {Element} el - DOM element
        * @returns {Boolean}
        */

    	isMin: function(el) {
    		var min = parseInt(el.getAttribute('data-min')) || 5;

    		return el.value.length < min;
    	},

        /**
        * Return true if condition matched.
        * @public
        * @param {Element} el - DOM element
        * @returns {Boolean}
        */

    	isMax: function(el) {
    		var max = parseInt(el.getAttribute('data-max')) || 15;

    		return el.value.length > max;
    	},

        /**
        * Return true if condition matched.
        * @public
        * @param {Element} el - DOM element
        * @returns {Boolean}
        */

    	isChecked: function(el) {

    		if (el.checked) {
    			return true;
    		} else {
    			return false;
    		}

    	},

        /**
        * Return true if condition matched.
        * @public
        * @param {Element} el - DOM element
        * @returns {Boolean}
        */

    	isSelected: function(el) {

    		if (el.selectedIndex === 0) {
    			return true;
    		} else {
    			return false;
    		}

    	},

        /**
        * Removing error from the form.
        * @public
        * @param {Element} el - DOM element
        */

    	removeError: function(el) {
    		var err = el.querySelector('.msg-err');

    		if (err) {
    			err.parentElement.removeChild(err);
    		}

    	},

    	getParents: function(el, parentSelector) {
    		// If no parentSelector defined will bubble up all the way to *document*
		    if (parentSelector === undefined) {
		        parentSelector = document;
		    }

		    var parents = [];
		    var p = el.parentNode;

		    while (p !== parentSelector) {

		    	try {
		    		var o = p;

		    		parents.push(o);
		    		p = o.parentNode;
		    	} catch(err) {
		    		throw err;
		    	}

		    }

		    parents.push(parentSelector); // Push that parentSelector you wanted to stop at

		    return parents;
    	},

        /**
        * Checking the form.
        * @public
        * @param {Array} fields - array of DOM elements
        * @param {Element} form - DOM element
        */

    	checkForms: function(fields, form) {
    		var i = 0,
    			self = this;

    		try {

				if (form.classList.contains('keypress')) {

					if (fields.getAttribute('data-validate') !== null) {
						var data = fields.getAttribute('data-validate'),
							inpType = fields.getAttribute('type'),
							nodes = fields.nodeName.toLowerCase(),
	    					el = fields;
						
    					var isReq = data.indexOf('required') !== -1,
    						isMin = data.indexOf('minLen') !== -1,
    						isMax = data.indexOf('maxLen') !== -1,
    						isEqual = data.indexOf('equal') !== -1,
    						isEmail = data.indexOf('email') !== -1,
    						isNum = data.indexOf('number') !== -1,
    						isCheckbox = data.indexOf('checkbox') !== -1,
    						isRadio = data.indexOf('radio') !== -1,
    						isSelect = data.indexOf('select') !== -1,
	    					equalFields = form.querySelectorAll('[data-validate *= equal]');

	    				validate(inpType, nodes, el); //Validate fields
					}
				}

    		} catch(err) {}

    		if (fields.length) {

    			for (; i < fields.length; i++) {
    				var data = fields[i].getAttribute('data-validate'),
    					inpType = fields[i].getAttribute('type'),
    					nodes = fields[i].nodeName.toLowerCase(),
    					el = fields[i];

    					if (data === null) {
    						continue;
    					}

					var isReq = data.indexOf('required') !== -1,
						isMin = data.indexOf('minLen') !== -1,
						isMax = data.indexOf('maxLen') !== -1,
						isEqual = data.indexOf('equal') !== -1,
						isEmail = data.indexOf('email') !== -1,
						isNum = data.indexOf('number') !== -1,
						isCheckbox = data.indexOf('checkbox') !== -1,
						isRadio = data.indexOf('radio') !== -1,
						isSelect = data.indexOf('select') !== -1,
    					equalFields = form[0].querySelectorAll('[data-validate *= equal]');

    				validate(inpType, nodes, el); //Validate fields
    			}
    			
    		}

    		function validate(inpType, nodes, el) {

				if (inpType !== null && inpType !== 'radio' && inpType !== 'checkbox') { //Inputs

					if (el.value.length <= 0 && isReq) {//Check on empty
						self.isValid(false, el);
						self.setValidationType('required', el);
					} else {
						self.isValid(true, el);
						self.removeError(el.parentElement);
					}

					if (isMin) {

						if (self.isMin(el)) {//Check on minimum length
							self.isValid(false, el);
							self.setValidationType('minLen', el);
						} else {
							self.isValid(true, el);
							self.removeError(el.parentElement);
						}

					}
					
					if (isMax) {
						
						if (self.isMax(el)) {//Check on maximum length
							self.isValid(false, el);
							self.setValidationType('maxLen', el);
						}

					}

					if (isEqual) {

						if (el.value.length <= 0 && isReq) {//Check on empty
							self.isValid(false, el);
							self.setValidationType('required', el);
						} else {
							self.isValid(true, el);
							self.removeError(el.parentElement);

							if (self.isEqual(equalFields)) {//Check on equal
								
								for (var i = 0; i < equalFields.length; i++) {
									self.isValid(true, equalFields[i]);
									self.removeError(equalFields[i].parentElement);
								}

							} else {
								self.isValid(false, el);
								self.setValidationType('equal', el);
							}

						}

					}

					if (isEmail) {

						if (self.isEmail(el)) { //Check on email
							self.isValid(true, el);
							self.removeError(el.parentElement);
						} else {
							self.isValid(false, el);
							self.setValidationType('email', el);
						}

					}

					if (isNum) {

						if (!self.isNumber(el)) {//Check on numbers
							self.isValid(false, el);
							self.setValidationType('number', el);
						}

					}

				}

				if (isRadio) {

    				if (inpType === 'radio') { //Radio

    					if (self.isChecked(el)) {//Check on tick
    						self.isValid(true, el);
    						self.removeError(el.parentElement);
    					} else {
    						self.isValid(false, el);
    						self.setValidationType('radio', el);
    					}

    				}

				}

				if (isCheckbox) {

					if (inpType === 'checkbox') { //Checkbox

    					if (self.isChecked(el)) {//Check on tick
    						self.isValid(true, el);
    						self.removeError(el.parentElement);
    					} else {
    						self.isValid(false, el);
    						self.setValidationType('checkbox', el);
    					}

					}

				}

				if (isSelect) {

					if (nodes === 'select') { //Select

    					if (self.isSelected(el)) {//Check on select
    						self.isValid(false, el);
    						self.setValidationType('select', el);
    					} else {
    						self.isValid(true, el);
    						self.removeError(el.parentElement);
    					}

    				}

				}

				if (nodes === 'textarea') { //Textarea
					
					if (isReq) {

						if (parseInt(el.value.length) <= 0) {//check on empty
							self.isValid(false, el);
							self.setValidationType('required', el);
						} else {
							self.isValid(true, el);
							self.removeError(el.parentElement);
						}

					}

					if (isMin) {

						if (self.isMin(el)) {//Check on minimum length
							self.isValid(false, el);
							self.setValidationType('minLen', el);
						} else {
							self.isValid(true, el);
							self.removeError(el.parentElement);
						}

					}
					
					if (isMax) {
						
						if (self.isMax(el)) {//Check on maximum length
							self.isValid(false, el);
							self.setValidationType('maxLen', el);
						}

					}

					if (isNum) {

						if (!self.isNumber(el)) {//Check on numbers
							self.isValid(false, el);
							self.setValidationType('number', el);
						}

					}

				}
		
    		}

    	},

        /**
        * Setting up the errors of fields.
        * @public
        * @param {String} type
        * @param {Element} el - DOM element
        */

    	setErrors: function(type, el) {
    		var errors = this.options.errors[type],
    			key,
    			msg = '';

    			if (el.parentElement.querySelector('.msg-err')) {
    				return;
    			}

    			for (key in errors) {
    				msg = errors[key];
    			}

    			try {
    				var errWrap = document.createElement('span');

    				errWrap.classList.add('msg-err');
    				errWrap.innerText = msg;
    				el.parentElement.appendChild(errWrap);

    			} catch(err) {
    				throw err;
    			}
    	},

        /**
        * Reset fields of form to default.
        * @public
        * @param {Boolean} reset
        * @param {Element} form - DOM element
        */

    	resetForms: function(reset, form) {

    		if (reset) {
    			form.classList.remove('valid');
    			form.reset();
    		}

    	},

        /**
        * Setting success message.
        * @public
        * @param {String} message
        * @param {Boolean} valid
        * @param {Element} form - DOM element
        */

    	setSuccessMsg: function(valid, message, form) {
    		var msg = message || '',
    			div = document.createElement('div'),
    			p = document.createElement('p'),
    			span = document.createElement('span'),
    			isMsg = document.querySelectorAll('.successMsg'),
    			closeTxt = this.options.closeText || '&cross;';

    		div.classList.add('successMsg');
    		span.classList.add('close');
    		p.innerText = msg;
    		span.innerHTML = closeTxt;

    		if (isMsg.length) {
    			[].forEach.call(isMsg, function(_) {
    				_.parentElement.removeChild(_);
    			});
    		}

    		if (valid && this.options.successMsg) {
    			p.appendChild(span);
    			div.appendChild(p)
    			form.appendChild(div);
    		}

    	},

        /**
        * Checking fields of form.
        * @public
        * @param {Element} form - DOM element
        */

    	checkFields: function(form) {
    		var result = false,
    			inps = form.querySelectorAll('input, textarea, select'),
    			arr = [];

			[].forEach.call(inps, function(el) {
				arr.push(el.classList.value);
			});

			function valid(el) {
				return el === 'invalid';
			};

			result = arr.some(valid);

			return result === true ? false : true;
    	},

        /**
        * Submiting form.
        * @public
        * @param {Boolean} valid
        * @param {Element} form - DOM element
        */

    	submitForm: function(e, valid, form) {
    		e.preventDefault();

    		if (valid && this.checkFields(form)) {

    			if (this.options.submit) {

    				if (this.options.submitDelay) {
    					setTimeout(function() {
    						form.submit();
    					}, this.options.delay);

    				} else {
    					form.submit();
    				}

    			}

    			this.resetForms(true, form);
    			form.classList.add('valid');
    			this.setSuccessMsg(valid, this.options.msg, form);

    			if (this.options.redirect[0]) {
    				window.location.href = (this.options.redirect[1]) || '/';
    			}
    		}

    	}
    }

    validationJs.defaults = { // Attach our defaults for plugin to the plugin itself
    	element: '.validation',
    	parent: false,
    	keypress: false,
    	resetForm: false,
    	successMsg: false,
    	submit: true,
    	submitDelay: true,
    	delay: 3000,
    	redirect: [false, '/'],
    	closeText: '&cross;',
    	msg: 'Form has been successfully sent!',
    	showErrors: false,
    	errors: [
    		{'required': 'Field is required'},
    		{'number': 'Only numbers'},
    		{'email': 'Incorrect email'},
    		{'checkbox': 'Field(s) not checked'},
    		{'radio': 'Field(s) not checked'},
    		{'select': 'Please select something'},
    		{'equal': "Fields aren't equal"},
    		{'minLen': 'Min length is 5 symbols'},
    		{'maxLen': 'Max length is 15 symbols'},
    	],
    }

    //
    // Public APIs
    //

    return validationJs; // make accessible globally

});