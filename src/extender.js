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
