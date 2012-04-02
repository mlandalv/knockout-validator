(function (ko) {
    "use strict";

    var validator = ko.validator;

    validator.utils = {
        isRuleEnabled: function (value) {
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
        },
        validateObservable: (function () {
            function validateRule(target, ruleName) {
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
                /// <summary>Validates the target observable based on its rules.
                /// This method assumes the observable already has been extended using extend({ rules: ... }).</summary>
                /// <param name="target">Observable to validate.</param>
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
        }())
    };
}(ko));
