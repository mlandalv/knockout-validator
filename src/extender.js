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

        // Validate when value is changed
        target.subscribe(function () {
            target.validate();
        });

        return target;
    };
}(ko));
