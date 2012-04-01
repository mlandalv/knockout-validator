// Knockout Validate v0.1-pre
// (c) Martin Landälv - http://mlandalv.github.com/knockout-validate/
// License: MIT (http://www.opensource.org/licenses/mit-license.php)
(function (ko) {
    "use strict";

    var validator = {
        methods: {},
        messages: {},
        optional: function (target) {
            /// <summary>Checks if the target passes validation due to being "empty".</summary>
            /// <param name="target">The target observable.</param>
            /// <returns>True if the value doesn't have a value, otherwise false.</returns>

            return !this.methods.required(target); // When methods are added the validator object is bound to 'this'
        },
        addMethod: function (name, callback, message) {
            /// <summary>Adds a new validation method.</summary>
            /// <param name="name">Name of the validation method.</param>
            /// <param name="callback">Callback to run on validate.</param>
            /// <param name="message">Default error message.</param>

            // Make sure the validator object is bound to 'this'
            this.methods[name] = callback.bind(this);
            this.messages[name] = message;
        },
        validate: (function () {
            function validateArray(array) {
                /// <summary>Validate all observables in the array (recursive in other arrays if needed).</summary>
                /// <param name="array">The array whose object should be validated.</param>
                /// <returns>True if all objects passed validation, otherwise false.</returns>
                var i, result = true, tempResult;

                for (i = 0; i < array.length; i += 1) {
                    tempResult = validateObject(array[i]);

                    if (!tempResult) {
                        result = tempResult;
                    }
                }

                return result;
            }

            function validateObject(obj) {
                /// <summary>Validates the specified object.</summary>
                /// <param name="obj">The object to validate, this object can be of unkwnown type.</param>
                /// <returns>True if all objects passed validation, otherwise false.</returns>
                var result = true, value;

                if (ko.isWriteableObservable(obj)) {
                    value = ko.utils.unwrapObservable(obj);

                    if (value instanceof Array) {
                        result = validateArray(value);
                    } else if (typeof obj.validate === "function") {
                        result = obj.validate();
                    }
                }

                return result;
            }

            return function (viewModel) {
                /// <summary>Validates a viewmodel; all observables and observables in arrays etc.</summary>
                /// <param name="viewModel">The viewmodel to validate.</param>
                /// <returns>True if all objects on the viewmodel passed validation, otherwise false.</returns>
                var prop, result = true, tempResult;

                for (prop in viewModel) {
                    if (viewModel.hasOwnProperty(prop)) {
                        tempResult = validateObject(viewModel[prop]);

                        if (!tempResult) {
                            result = tempResult;
                        }
                    }
                }

                return result;
            };
        }())
    };

    ko.validator = validator;
}(ko));
(function (ko) {
    "use strict";

    var validator = ko.validator,
        utils = validator.utils || {};

    utils.isRuleActive = function (value) {
        /// <summary>Whether or not the rule should be run. Value can be any object: true, false, function, ko.computable etc.
        /// If the value (or return value) isn't explicitly false then this will return true.</summary>
        /// <param name="value">The rule's option value.</param>
        var isActive;

        if (ko.isObservable(value)) {
            isActive = ko.utils.unwrapObservable(value) !== false;
        } else if (typeof value === "function") {
            isActive = value() !== false;
        } else {
            isActive = value !== false;
        }

        return isActive;
    };

    utils.validateObservable = function (target) {
        /// <summary>Validates the target observable based on its rules.
        /// This method assumes the observable already has been extended using extend({ rules: ... }).</summary>
        /// <param name="target">Observable to validate.</param>
        var ruleName, rules = target.rules, messages = rules.messages || {}, message, rule, isValid, value;

        target.errors.removeAll();

        for (ruleName in rules) {
            if (rules.hasOwnProperty(ruleName)) {
                // The property is the name of a rule
                if (ruleName !== "messages") {
                    value = rules[ruleName];

                    if (utils.isRuleActive(value)) {
                        rule = validator.methods[ruleName];

                        isValid = rule.validate(target);

                        // Get overridden or default error message.
                        if (!isValid) {
                            message = messages[ruleName] || rule.message;

                            target.errors.push(message);
                        }
                    }
                }
            }
        }

        return target.valid();
    };

    validator.utils = utils;
}(ko));
(function (ko) {
    "use strict";

    ko.validator.addMethod("required",
        function (target) {
            var targetValue = target();

            return targetValue !== undefined && targetValue !== null && targetValue !== "";
        }, "This field is required.");

    ko.validator.addMethod("number",
        function (target) {
            return this.optional(target) || !isNaN(+(target()));
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
