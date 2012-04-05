(function (ko) {
    "use strict";

    var validator = ko.validator;

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
                        return validator.utils.validateObservable(target);
                    }
                };

            target.validator = val;

            // Validate when value is changed
            target.subscribe(function () {
                val.validate();
            });
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

            return target;
        };
    }());
}(ko));
