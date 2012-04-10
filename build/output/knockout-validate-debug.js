// Knockout Validate v0.1-pre
// (c) Martin Landälv - http://mlandalv.github.com/knockout-validate/
// License: MIT (http://www.opensource.org/licenses/mit-license.php)
(function (ko) {
    "use strict";

    var validator = {
        methods: {},
        messages: {},
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

            // Make sure the validator object is bound to 'this' when the callback is invoked
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
            /// <summary>Checks if the element is validatable.</summary>
            return element.validator !== undefined;
        },
        isArray = Array.isArray || function (obj) {
            /// <summary>Checks if the object is an array.</summary>
            /// <param name="obj">The object to check if it is an array.</param>
            /// <returns>True if obj is an array, otherwise false.</returns>
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

    validateArray = function (array) {
        /// <summary>Validate all objects in the array.</summary>
        /// <param name="array">The array whose objects should be validated.</param>
        /// <returns>True if all objects passed validation, otherwise false.</returns>
        var result = true, // Default to true if the array if empty
            tempResult,
            i;

        for (i = 0; i < array.length; i += 1) {
            tempResult = validateObject(array[i]);

            if (!tempResult) {
                result = tempResult;
            }
        }

        return result;
    };

    validateObject = function (obj) {
        /// <summary>Validates the specified object.</summary>
        /// <param name="obj">The object to validate.</param>
        /// <returns>True if the object passed validation, otherwise false.</returns>
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

    unwrap = function (value) {
        /// <summary>Unwraps the value, whether it's a plan js object, observable or function.</summary>
        /// <param name="value">The value to unwrap.</param>
        var result;

        if (ko.isObservable(value)) {
            result = ko.utils.unwrapObservable(value);
        } else if (typeof value === "function") {
            result = value();
        } else {
            result = value;
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
            /// <summary>Validate the specific rule against the target observable. If validation failed, the error messeage
            /// will be added to the errors collection.</summary>
            /// <param name="target">Observable to validate.</param>
            /// <param name="target">Observable to validate.</param>
            var method = validator.methods[ruleName],
                val = target.validator,
                param = val.rules[ruleName],
                messages,
                errorMessage,
                isValid,
                paramValue;

            // The messages property contains overridden default error messages and is not a rule
            if (ruleName === "messages") {
                return;
            }

            paramValue = unwrap(param);

            // Check if the rule should be run, e.g. if you have number: false, that rule should not be run.
            if (paramValue !== false) {
                isValid = method(target(), target, paramValue) !== false;

                // Get overridden or default error message.
                if (!isValid) {
                    messages = val.rules.messages || {};
                    errorMessage = messages[ruleName] || validator.messages[ruleName];

                    val.errors.push(formatMessage(errorMessage, paramValue));
                }
            }
        }

        return function (target) {
            /// <summary>Validates the target observable based on its rules from the extender.</summary>
            /// <param name="target">Observable to validate.</param>
            /// <returns>True if validation passed, otherwise false.</returns>
            var ruleName,
                rules,
                value,
                val,
                isValid = true;

            if (isValidatable(target)) {
                val = target.validator;
                rules = val.rules;
                val.errors.removeAll();

                for (ruleName in rules) {
                    if (rules.hasOwnProperty(ruleName)) {
                        validateRule(target, ruleName);
                    }
                }

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
                val = {
                    rules: {
                        messages: {}
                    },
                    errors: errors,
                    valid: ko.computed(function () {
                        return errors().length === 0;
                    }),
                    message: ko.computed(function () {
                        return errors()[0] || undefined;
                    }),
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
                utils.validateObservable(target);
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
            if (target.validator === undefined) {
                initialize(target);
            }

            ko.utils.extend(target.validator.rules, option);
            subscribeToDependencies(target, option);

            return target;
        };
    }());
}(ko));
