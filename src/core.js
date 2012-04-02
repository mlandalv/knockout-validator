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
