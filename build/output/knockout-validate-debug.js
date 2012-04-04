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
        isRuleEnabled,
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

    isRuleEnabled = function (value) {
        /// <summary>Whether or not the rule should be run. Value can be any object: true, false, function, ko.computable etc.
        /// If the value (or return value) isn't explicitly false then this will return true.</summary>
        /// <param name="value">The rule's option value.</param>
        var isEnabled;

        if (ko.isObservable(value)) {
            isEnabled = ko.utils.unwrapObservable(value) !== false;
        } else if (typeof value === "function") {
            isEnabled = value() !== false;
        } else {
            isEnabled = value !== false;
        }

        return isEnabled;
    };

    validateObservable = (function () {
        function formatMessage(input, params) {
            return format(input, params);
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
                isValid;

            // The messages property contains overridden default error messages and is not a rule
            if (ruleName === "messages") {
                return;
            }

            // Check if the rule should be run, e.g. if you have number: false, that rule should not be run.
            if (isRuleEnabled(param)) {
                isValid = method(target(), target, param) !== false;

                // Get overridden or default error message.
                if (!isValid) {
                    messages = val.rules.messages || {};
                    errorMessage = messages[ruleName] || validator.messages[ruleName];

                    val.errors.push(formatMessage(errorMessage));
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
                        // The property is the name of a rule
                        if (ruleName !== "messages") {
                            validateRule(target, ruleName);
                        }
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
        isRuleEnabled: isRuleEnabled,
        isValidatable: isValidatable,
        validateArray: validateArray,
        validateObject: validateObject,
        validateObservable: validateObservable
    };
}(ko));
(function (ko) {
    "use strict";

    ko.validator.addMethod("required",
        function (value, target, param) {
            return value !== undefined && value !== null && value !== "";
        }, "This field is required.");

    ko.validator.addMethod("number",
        function (value, target, param) {
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
}(ko));
(function (ko) {
    "use strict";

    var validator = ko.validator;

    ko.extenders.rules = function (target, option) {
        /// <summary>Rules extender used to specificy rules for the observable. the option
        /// parameter takes an object containing the rules and also optionally an object
        /// for overridden rule messages.</summary>
        /// <param name="target">Observable to Extend.</param>
        /// <param name="option">Rules and eventual overridden messages.</param>
        var rules = option,
            errors = ko.observableArray(),
            valid = ko.computed(function () {
                return errors().length === 0;
            }),
            message = ko.computed(function () {
                return errors()[0] || undefined;
            }),
            validate = function () {
                return validator.utils.validateObservable(target);
            };

        target.validator = {
            rules: rules,
            errors: errors,
            valid: valid,
            message: message,
            validate: validate
        };

        // Validate when value is changed
        target.subscribe(function () {
            validate();
        });

        return target;
    };
}(ko));
