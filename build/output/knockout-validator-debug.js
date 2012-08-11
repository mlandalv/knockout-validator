// Knockout Validate v0.1-pre
// (c) Martin Landälv - http://mlandalv.github.com/knockout-validate/
// License: MIT (http://www.opensource.org/licenses/mit-license.php)
(function (ko) {
    "use strict";

    var validator = {
        version: "0.1-pre",
        methods: {},
        messages: {},
        options: {
            validClass: "valid",
            errorClass: "error"
        },
        optional: function (target) {
            /// <summary>Checks if the target observable doesn't require a value.</summary>
            /// <param name="target">The target observable.</param>
            /// <returns>True if no value is required, otherwise false.</returns>
            return !this.methods.required(target(), target, true); // When methods are added the validator object is bound to 'this'
        },
        addMethod: function (name, callback, message) {
            /// <summary>Adds a new validation method.</summary>
            /// <param name="name">Name of the validation method.</param>
            /// <param name="callback">Callback to run on validate.</param>
            /// <param name="message">Default error message.</param>

            // Make sure the validator object is bound to 'this' when the callback is invoked.
            // Knockout provides a polyfill for the bind function if not natively supported.
            this.methods[name] = callback.bind(this);
            this.messages[name] = message;
        },
        validate: function (viewModel) {
            /// <summary>Validates a viewmodel; all observables and observables in arrays etc.</summary>
            /// <param name="viewModel">The viewmodel to validate.</param>
            /// <returns>True if all objects on the viewmodel passed validation, otherwise false.</returns>
            return this.utils.validateObject(viewModel);
        }
    };

    ko.validator = validator;
}(ko));
(function (ko) {
    "use strict";

    var validator = ko.validator,
        validateArray,
        validateObject,
        unwrap,
        validateObservable,
        isValidatable = function (element) {
            return element.validator !== undefined;
        },
        isArray = Array.isArray || function (obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },
        isFunction = function (obj) {
            return typeof obj === "function";
        },
        format = function (input) {
            var args = Array.prototype.slice.call(arguments, 1);

            return input.replace(/\{(\d+)\}/g, function (match, number) {
                return args[number] !== undefined ? args[number] : match;
            });
        };

    validateArray = function (obj) {
        // Validate all objects in the array. Returns false if any object fails validation.
        var result = true, // Default to true if the array if empty
            tempResult,
            i;

        if (!isArray(obj)) {
            throw new TypeError("Object is not an array");
        }

        for (i = 0; i < obj.length; i += 1) {
            // Call validateObject since we don't know the type of the actual object;
            // it could be another array, play js object, observable etc.
            tempResult = validateObject(obj[i]);

            if (!tempResult) {
                result = tempResult;
            }
        }

        return result;
    };

    validateObject = function (obj) {
        // Validates the specified object. Returns true if object passed validation, otherwise false.
        var result = true,
            prop,
            value;

        if (ko.isWriteableObservable(obj)) {
            result = validateObservable(obj);
        } else {
            value = ko.utils.unwrapObservable(obj);

            if (isArray(value)) {
                result = validateArray(obj);
            } else if (typeof value === "object") {
                for (prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        if (!validateObject(obj[prop])) {
                            result = false;
                        }
                    }
                }
            }
        }

        return result;
    };

    unwrap = function (obj) {
        // Unwraps the object, whether it's a plain js object, observable or function. So unlike ko.utils.unwrapObservable
        // this method also unwraps functions and return their values.
        var result = ko.utils.unwrapObservable(obj);

        if (typeof result === "function") {
            result = result();
        }

        return result;
    };

    validateObservable = (function () {
        function formatMessage(input, param) {
            var result;

            if (isFunction(input)) {
                result = input(param);
            } else {
                result = format(input, param);
            }

            return result;
        }

        function validateRule(target, ruleName) {
            /// <summary>Validate the specific rule against the target observable. If validation failed, the error message is returned.</summary>
            /// <param name="target">Observable to validate.</param>
            /// <param name="ruleName">Name of the rule.</param>
            /// <returns>Error message if rule fails, otherwise undefined.</returns>
            var method = validator.methods[ruleName],
                targetValidator = target.validator,
                param = targetValidator.rules[ruleName],
                messages,
                errorMessage,
                isValid,
                paramValue,
                result;

            // The messages property contains overridden default error messages and is not a rule
            if (ruleName !== "messages") {
                paramValue = unwrap(param);

                // Check if the rule should be run, e.g. if you have number: false, that rule should not be run.
                if (paramValue !== false) {
                    isValid = method(target(), target, paramValue) !== false;

                    // Get overridden or default error message.
                    if (!isValid) {
                        messages = targetValidator.rules.messages;
                        errorMessage = messages[ruleName] || validator.messages[ruleName];

                        result = formatMessage(errorMessage, paramValue);
                    }
                }
            }

            return result;
        }

        return function (target) {
            /// <summary>Validates the target observable based on its rules from the extender.</summary>
            /// <param name="target">Observable to validate.</param>
            /// <returns>True if validation passed, otherwise false.</returns>
            var ruleName,
                rules,
                value,
                val,
                isValid = true,
                errors = [],
                ruleResult;

            if (isValidatable(target)) {
                val = target.validator;
                rules = val.rules;

                for (ruleName in rules) {
                    if (rules.hasOwnProperty(ruleName)) {
                        ruleResult = validateRule(target, ruleName);

                        // If the rule fails validation then the error message is returned
                        if (ruleResult !== undefined) {
                            errors.push(ruleResult);
                        }
                    }
                }

                val.errors(errors);

                isValid = val.valid();
            } else {
                value = ko.utils.unwrapObservable(target);

                if (isArray(value)) {
                    isValid = validateArray(value);
                }
            }

            return isValid;
        };
    }());

    validator.utils = {
        format: format,
        isValidatable: isValidatable,
        unwrap: unwrap,
        validateArray: validateArray,
        validateObject: validateObject,
        validateObservable: validateObservable
    };
}(ko));
(function (ko) {
    "use strict";

    var utils = ko.validator.utils;

    ko.validator.addMethod("required",
        function (value) {
            return value !== undefined && value !== null && value !== "";
        }, "This field is required.");

    ko.validator.addMethod("number",
        function (value, target) {
            return this.optional(target) || !isNaN(+(value));
        }, "Please enter a valid number.");

    ko.validator.addMethod("min",
        function (value, target, param) {
            return this.optional(target) || value >= param;
        }, "Please enter a value greater than or equal to {0}.");

    ko.validator.addMethod("max",
        function (value, target, param) {
            return this.optional(target) || value <= param;
        }, "Please enter a value less than or equal to {0}.");

    ko.validator.addMethod("digits",
        function (value, target) {
            return this.optional(target) || /^\d+$/.test(value);
        }, "Please enter only digits.");

    ko.validator.addMethod("range",
        function (value, target, param) {
            return this.optional(target) || (value >= param.min && value <= param.max);
        }, function (param) {
            return utils.format("Please enter a value between {0} and {1}.", param.min, param.max);
        });

    ko.validator.addMethod("date",
        function (value, target) {
            // From jQuery Validation
            return this.optional(target) || !/Invalid|NaN/.test(new Date(value));
        }, "Please enter a valid date.");

    ko.validator.addMethod("dateISO",
        function (value, target) {
            return this.optional(target) || /^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/.test(value);
        }, "Please enter a valid date (ISO).");

    ko.validator.addMethod("url",
        function (value, target) {
            // From jQuery Validation
            return this.optional(target) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
        }, "Please enter a valid URL.");

    ko.validator.addMethod("email",
        function (value, target) {
            // From jQuery Validation
            return this.optional(target) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
        }, "Please enter a valid email address.");

    ko.validator.addMethod("minlength",
        function (value, target, param) {
            return this.optional(target) || (typeof value === "string" && value.length >= param);
        }, "Please enter at least {0} characters.");

    ko.validator.addMethod("maxlength",
        function (value, target, param) {
            return this.optional(target) || (typeof value === "string" && value.length <= param);
        }, "Please enter no more than {0} characters.");

    ko.validator.addMethod("rangelength",
        function (value, target, param) {
            return this.optional(target) || (typeof value === "string" && value.length >= param.min && value.length <= param.max);
        }, function (param) {
            return utils.format("Please enter a value between {0} and {1} characters long.", param.min, param.max);
        });
}(ko));
(function (ko) {
    "use strict";

    var validator = ko.validator,
        utils = validator.utils;

    ko.extenders.rules = (function () {
        function initialize(target) {
            /// <summary>Initialize the target with validator data.</summary>
            /// <param name="target">Target element, e.g. ko.observable.</param>
            var errors = ko.observableArray(),
                message = ko.computed(function () {
                    return errors()[0];
                }),
                val = {
                    rules: {
                        messages: {}
                    },
                    errors: errors,
                    valid: ko.computed(function () {
                        return message() === undefined;
                    }),
                    message: message,
                    validate: function () {
                        return utils.validateObservable(target);
                    }
                };

            target.validator = val;

            // Validate when value is changed
            target.subscribe(function () {
                val.validate();
            });
        }

        function createSubscribeCallback(target) {
            /// <summary>Creates a callback that validates the target when run.</summary>
            /// <param name="target">Target to validate.</param>
            return function () {
                if (!target.validator.valid() || !validator.optional(target)) {
                    utils.validateObservable(target);
                }
            };
        }

        function subscribeToDependencies(target, option) {
            /// <summary>Subscribes to rule dependencies and revalidates the target when dependencies change.</summary>
            /// <param name="target">Target to revalidate when rule dependencies change.</param>
            /// <param name="option">Extender option; rules and eventual overridden messages.</param>
            var prop, element;

            for (prop in option) {
                if (option.hasOwnProperty(prop) && prop !== "messages") {
                    element = option[prop];

                    if (ko.isSubscribable(element)) {
                        element.subscribe(createSubscribeCallback(target));
                    }
                }
            }
        }

        return function (target, option) {
            /// <summary>Rules extender used to specificy rules for the observable. the option
            /// parameter takes an object containing the rules and also optionally an object
            /// for overridden rule messages.</summary>
            /// <param name="target">Observable to Extend.</param>
            /// <param name="option">Rules and eventual overridden messages.</param>
            if (!utils.isValidatable(target)) {
                initialize(target);
            }

            ko.utils.extend(target.validator.rules, option);
            subscribeToDependencies(target, option);

            return target;
        };
    }());
}(ko));
(function (ko) {
    "use strict";

    var validator = ko.validator,
        utils = validator.utils,
        koUtils = ko.utils,
        validationAttributes = [
            { attr: "required", method: "required", message: "data-val-required" },
            { attr: "min", method: "min", message: "data-val-min" },
            { attr: "max", method: "max", message: "data-val-max" },
            { attr: "maxlength", method: "maxlength", message: "data-val-maxlength" }
        ];

    ko.bindingHandlers.validate = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var target = valueAccessor(),
                allBindings = allBindingsAccessor(),
                rules = koUtils.extend({ messages: {} }, allBindings.rules || {});

            // Extract validation property add to the rules object.
            koUtils.arrayForEach(validationAttributes, function (item) {
                if (element.attributes[item.attr]) {
                    rules[item.method] = element.attributes[item.attr].value;

                    // If default error message should be overridden
                    if (element.attributes[item.message]) {
                        rules.messages[item.method] = element.attributes[item.message].value;
                    }
                }
            });

            target.extend({
                rules: rules
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var target = valueAccessor(),
                isValid = target.validator.valid();

            koUtils.toggleDomNodeCssClass(element, validator.options.validClass, isValid);
            koUtils.toggleDomNodeCssClass(element, validator.options.errorClass, !isValid);
        }
    };

    ko.bindingHandlers.validationMessage = {
        init: function (element) {
            koUtils.toggleDomNodeCssClass(element, validator.options.errorClass, true);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var target = valueAccessor(),
                isValid = target.validator.valid();

            if (isValid) {
                koUtils.setHtml(element, "");
            } else {
                koUtils.setHtml(element, target.validator.message());
            }
        }
    };
}(ko));
