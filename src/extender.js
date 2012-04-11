(function (ko) {
    "use strict";

    var validator = ko.validator,
        utils = validator.utils;

    ko.extenders.rules = (function () {
        function initialize(target) {
            /// <summary>Initialize the target with validator data.</summary>
            /// <param name="target">Target element, e.g. ko.observable.</param>
            var errors = ko.observableArray(),
                message = ko.computed(function () {
                    return errors()[0];
                }),
                val = {
                    rules: {
                        messages: {}
                    },
                    errors: errors,
                    valid: ko.computed(function () {
                        return message() === undefined;
                    }),
                    message: message,
                    validate: function () {
                        return utils.validateObservable(target);
                    }
                };

            target.validator = val;

            // Validate when value is changed
            target.subscribe(function () {
                val.validate();
            });
        }

        function createSubscribeCallback(target) {
            /// <summary>Creates a callback that validates the target when run.</summary>
            /// <param name="target">Target to validate.</param>
            return function () {
                if (!target.validator.valid() || !validator.optional(target)) {
                    utils.validateObservable(target);
                }
            };
        }

        function subscribeToDependencies(target, option) {
            /// <summary>Subscribes to rule dependencies and revalidates the target when dependencies change.</summary>
            /// <param name="target">Target to revalidate when rule dependencies change.</param>
            /// <param name="option">Extender option; rules and eventual overridden messages.</param>
            var prop, element;

            for (prop in option) {
                if (option.hasOwnProperty(prop) && prop !== "messages") {
                    element = option[prop];

                    if (ko.isSubscribable(element)) {
                        element.subscribe(createSubscribeCallback(target));
                    }
                }
            }
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
            subscribeToDependencies(target, option);

            return target;
        };
    }());
}(ko));
