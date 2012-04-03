(function (ko) {
    "use strict";

    var validator = ko.validator,
        validateArray,
        validateObject,
        isRuleEnabled,
        validateObservable,
        isValidatable,
        isArray;

    isArray = Array.isArray || function (obj) {
        /// <summary>Checks if the object is an array.</summary>
        /// <param name="obj">The object to check if it is an array.</param>
        /// <returns>True if obj is an array, otherwise false.</returns>
        return Object.prototype.toString.call(obj) === "[object Array]";
    };

    isValidatable = function (element) {
        /// <summary>Checks if the element is validatable.</summary>
        return element.validator !== undefined;
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
            prop;

        if (typeof obj !== "boolean" && typeof obj !== "number") {
            if (ko.isWriteableObservable(obj)) {
                result = validateObservable(obj);
            } else if (isArray(obj)) {
                result = validateArray(obj);
            } else {
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

                    val.errors.push(errorMessage);
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
        isRuleEnabled: isRuleEnabled,
        isValidatable: isValidatable,
        validateArray: validateArray,
        validateObject: validateObject,
        validateObservable: validateObservable
    };
}(ko));
