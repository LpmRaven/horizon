'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _requestAnimationFrame = require('./helpers/request-animation-frame');

var _requestAnimationFrame2 = _interopRequireDefault(_requestAnimationFrame);

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getIntersectionObserverConfig = function getIntersectionObserverConfig() {
    var customConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return _extends({
        root: null,
        rootMargin: '35%',
        threshold: 0
    }, customConfig);
};

var intersectionObserverExists = function intersectionObserverExists() {
    return 'IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype;
};

var getRootElement = function getRootElement(rootElement) {
    if (rootElement) {
        return rootElement;
    }

    return document.documentElement;
};

var isElementVisible = function isElementVisible(rootElement, elementToObserve) {
    var rect = elementToObserve.getBoundingClientRect();

    return rect.bottom > 0 && rect.right > 0 && rect.left < getRootElement(rootElement).clientWidth && rect.top < getRootElement(rootElement).clientHeight;
};

var legacyIntersectAPI = function legacyIntersectAPI(config) {
    var intersectionConfig = getIntersectionObserverConfig(config.intersectionObserverConfig);
    var elementToObserve = config.toObserve;
    var rootElement = intersectionConfig.root;

    var eventHandler = (0, _lodash2.default)(function (triggerOnce) {
        (0, _requestAnimationFrame2.default)(function () {
            if (isElementVisible(rootElement, elementToObserve)) {
                config.onEntry();
                if (triggerOnce) {
                    window.removeEventListener('scroll', eventHandler);
                    window.removeEventListener('resize', eventHandler);
                }
            } else {
                config.onExit();
                if (triggerOnce) {
                    window.removeEventListener('scroll', eventHandler);
                    window.removeEventListener('resize', eventHandler);
                }
            }
        });
    }, 16);

    eventHandler(false);

    window.addEventListener('scroll', function () {
        eventHandler(config.triggerOnce);
    });

    window.addEventListener('resize', function () {
        eventHandler(config.triggerOnce);
    });
};

exports.default = function (config) {
    var intersectionObserverConfig = _extends({}, getIntersectionObserverConfig(config.intersectionObserverConfig));

    if (intersectionObserverExists()) {
        var observer = new IntersectionObserver(function (elements, observerInstance) {
            elements.forEach(function (entry) {
                if (entry.isIntersecting) {
                    config.onEntry(entry);

                    if (config.triggerOnce) {
                        observerInstance.unobserve(config.toObserve);
                    }
                } else {
                    config.onExit(entry);
                }
            });
        }, intersectionObserverConfig);

        observer.observe(config.toObserve);

        return;
    }

    legacyIntersectAPI(config);
};

module.exports = exports['default'];