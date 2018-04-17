(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["AutoSuggestVanilla"] = factory();
	else
		root["AutoSuggestVanilla"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var KC_UP = 38;
var KC_DOWN = 40;
var KC_ENTER = 13;
var KC_ESCAPE = 27;
var KC_BACKSPACE = 8;

function AutoSuggestVanilla(container, dataProvider, maxItems) {
	if (!container || !container instanceof HTMLElement) {
		throw new Error('Container is not DOM element');
	}

	this.input = container.querySelectorAll('.autosuggest__input')[0];

	if (!this.input) {
		throw new Error('No input element found in the container');
	}

    this.dropdown = container.querySelectorAll('.autosuggest__dropdown')[0];

    if (!this.dropdown) {
        throw new Error('No dropdown element found in the container');
    }

    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onSearchSuccess = this.onSearchSuccess.bind(this);
    this.onSearchError = this.onSearchError.bind(this);

    this.input.addEventListener('change', this.onChange);
    this.input.addEventListener('keydown', this.onKeyDown);
    this.input.addEventListener('blur', this.onBlur);
	
    this.input.setAttribute('autocomplete', 'off');

    this.onDropdownMousedown = this.onDropdownMousedown.bind(this);

    this.dropdown.addEventListener('mousedown', this.onDropdownMousedown);

    this._maxItems = maxItems;

    this._value = '';
    this._dropdownItems = [],
    this._dropdownShown = false;
    this._itemSelected = undefined;
    this._cachedSearches = {};
    this._loading = false;

    this._dataProvider = dataProvider;

    this.hideDropdown();
}

AutoSuggestVanilla.prototype.onChange = function(eventOrValue) {
    if (eventOrValue instanceof Event) {
        var value = eventOrValue.target.value;
        if (value === this._value) {
            return false;
        }
    } else if (typeof eventOrValue == 'string') {
        var value = eventOrValue;
    } else {
        return false;
    }

	this._value = value;

	if (!this._value.trim() && this._dropdownShown) {
		this.hideDropdown();
		return;
	}

    if (this._cachedSearches[this._value]) {
    	this._dropdownItems = this._cachedSearches[this._value];
    	this._dropdownShown = this._cachedSearches[this._value].length > 0;

    	this.renderDropdown();

	    return;
	}

	this._dropdownShown = true;
	this._loading = true;

    this.renderDropdown();

    this._dataProvider.search(this._value, this._maxItems, this.onSearchSuccess, this.onSearchError);
}

AutoSuggestVanilla.prototype.onSearchSuccess = function(value, items) {
    this._dropdownItems = items;
    this._cachedSearches[value] = items;
    this._dropdownShown = items.length > 0;
    this._loading = false;

    this.renderDropdown();
}

AutoSuggestVanilla.prototype.onSearchError = function(error) {
    this._error = error;
    this._loading = false;
    this._dropdownShown = false;
}

AutoSuggestVanilla.prototype.selectItem = function(name) {
    this._value = name;

    this.input.removeEventListener('change', this.onChange);
    this.input.value = name;
    this.input.addEventListener('change', this.onChange);

    this.hideDropdown();
}

AutoSuggestVanilla.prototype.hideDropdown = function() {
    this._dropdownShown = false;
    this._itemSelected = undefined;

    this.dropdown.style.display = 'none';
}

AutoSuggestVanilla.prototype.onKeyDown = function(event) {
    if (typeof event.key == 'string' && event.key.length === 1) {
        this.onChange(event.target.value + event.key);
        return;
    }

    var keyCode = event.keyCode;
    if (keyCode == KC_BACKSPACE) {
        if (event.target.selectionStart && event.target.value.length === event.target.selectionStart)
        this.onChange(event.target.value.substring(0, event.target.selectionStart-1));
    }

    switch(keyCode) {
        case KC_DOWN:
        case KC_UP:
            if (!this._dropdownItems.length) return;

            var newItemSelected = typeof this._itemSelected != 'undefined' ? this._itemSelected : -1;

            if (keyCode === KC_DOWN) {
                if (newItemSelected + 1 < this._dropdownItems.length) newItemSelected++;
                else newItemSelected = 0;
            } else if (keyCode === KC_UP) {
                if (newItemSelected > 0) newItemSelected--;
                else newItemSelected = this._dropdownItems.length - 1;
            }

            this._itemSelected = newItemSelected;
            this.renderDropdown();

            break;
        case KC_ENTER:
            if (this._dropdownShown && this._dropdownItems && this._dropdownItems[this._itemSelected]) {
                this.selectItem(this._dropdownItems[this._itemSelected]);
            }
            break;
        case KC_ESCAPE:
            if (this._dropdownShown) {
                this.hideDropdown();
            }
            break;
    }
}

AutoSuggestVanilla.prototype.onBlur = function() {
    this.hideDropdown();
}

AutoSuggestVanilla.prototype.onDropdownMousedown = function(event) {
    var item = event.target.__item;

    if (!item) return false;

    this.selectItem(item);
}

AutoSuggestVanilla.prototype.renderDropdown = function() {
    this.dropdown.style.display = 'block';
    this.dropdown.innerHTML = '';

    this.dropdown.className = 'autosuggest__dropdown' + (this._loading ? ' loading' : '');

    for (index in this._dropdownItems) {
        var item = this._dropdownItems[index];
        var isSelected = this._itemSelected === parseInt(index);

        var element = document.createElement('div');

        element.setAttribute('class', 'autosuggest__item' + (isSelected ? ' selected' : ''));
        element.innerHTML = item;
        element.__item = item;

        this.dropdown.appendChild(element);
    }
}

AutoSuggestVanilla.prototype.destroy = function() {
    this.input.removeEventListener('change', this.onChange);
    this.input.removeEventListener('keydown', this.onKeyDown);
    this.input.removeEventListener('blur', this.onBlur);

    this.dropdown.removeEventListener('mousedown', this.onDropdownMousedown);
}

module.exports = AutoSuggestVanilla;

/***/ })
/******/ ]);
});