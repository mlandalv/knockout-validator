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
