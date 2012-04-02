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
            var result = true,
                prop,
                tempResult;

            for (prop in viewModel) {
                if (viewModel.hasOwnProperty(prop)) {
                    tempResult = validator.utils.validateObject(viewModel[prop]);

                    if (!tempResult) {
                        result = tempResult;
                    }
                }
            }

            return result;
        }
    };

    ko.validator = validator;
}(ko));
(function (ko) {
    "use strict";

    var validator = ko.validator;

    ko.validator.utils = (function () {
        var validateArray,
            validateProperty,
            validateObject,
            isRuleEnabled,
            validateObservable,
            isValidatable;

        isValidatable = function (element) {
            /// <summary>Checks if the element is validatable.</summary>
            return typeof element.validate === "function";
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

        validateProperty = function (property) {
            /// <summary>Validates the specified property. If the property is an object, its properties are validated.
            /// If the property is an array, all its items are validated, etc.</summary>
            /// <param name="property">The property to validate.</param>
            /// <returns>True if validation passed (or if not validatable), otherwise false.</returns>
            var result = true,
                value;

            if (ko.isWriteableObservable(property)) {
                value = ko.utils.unwrapObservable(property);

                if (value instanceof Array) {
                    result = validateArray(value);
                } else if (isValidatable(property)) {
                    result = property.validate();
                }
            }

            return result;
        };

        validateObject = function (obj) {
            /// <summary>Validates the specified object.</summary>
            /// <param name="obj">The object to validate.</param>
            /// <returns>True if the object passed validation, otherwise false.</returns>
            var result = true,
                prop;

            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (!this.validateProperty(obj[prop])) {
                        result = false;
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
            function validateRule(target, ruleName) {
                /// <summary>Validate the specific rule against the target observable. If validation failed, the error messeage
                /// will be added to the errors collection.</summary>
                /// <param name="target">Observable to validate.</param>
                /// <param name="target">Observable to validate.</param>
                var method = validator.methods[ruleName],
                    param = target.rules[ruleName],
                    messages,
                    errorMessage,
                    isValid;

                // The messages property contains overridden default error messages and is not a rule
                if (ruleName === "messages") {
                    return;
                }

                // Check if the rule should be run, e.g. if you have number: false, that rule should not be run.
                if (validator.utils.isRuleEnabled(param)) {
                    isValid = method(target(), target, param) !== false;

                    // Get overridden or default error message.
                    if (!isValid) {
                        messages = target.rules.messages || {};
                        errorMessage = messages[ruleName] || validator.messages[ruleName];

                        target.errors.push(errorMessage);
                    }
                }
            }

            return function (target) {
                /// <summary>Validates the target observable based on its rules from the extender.</summary>
                /// <param name="target">Observable to validate.</param>
                /// <returns>True if validation passed, otherwise false.</returns>
                var ruleName,
                    rules = target.rules;

                target.errors.removeAll();

                for (ruleName in rules) {
                    if (rules.hasOwnProperty(ruleName)) {
                        // The property is the name of a rule
                        if (ruleName !== "messages") {
                            validateRule(target, ruleName);
                        }
                    }
                }

                return target.valid();
            };
        }());

        return {
            isRuleEnabled: isRuleEnabled,
            isValidatable: isValidatable,
            validateArray: validateArray,
            validateObject: validateObject,
            validateObservable: validateObservable,
            validateProperty: validateProperty
        };
    }());
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
        target.rules = option;
        target.errors = ko.observableArray();
        target.valid = ko.computed(function () {
            return target.errors().length === 0;
        });
        target.message = ko.computed(function () {
            return target.errors()[0] || undefined;
        });

        target.validate = function () {
            return validator.utils.validateObservable(target);
        };

        return target;
    };
}(ko));
