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

    unwrap = function (obj) {
        /// <summary>Unwraps the object, whether it's a plan js object, observable or function. So unlike ko.utils.unwrapObservable
        /// this method also unwraps functions and return their values.</summary>
        /// <param name="obj">The object to unwrap.</param>
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
                val = target.validator,
                param = val.rules[ruleName],
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
                        messages = val.rules.messages || {};
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
