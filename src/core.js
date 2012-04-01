(function (ko) {
    "use strict";

    var validator = {
        methods: {},
        messages: {},
        optional: function (target) {
            /// <summary>Checks if the target passes validation due to being "empty".</summary>
            /// <param name="target">The target observable.</param>
            /// <returns>True if the value doesn't have a value, otherwise false.</returns>

            return !this.methods.required(target(), target, true); // When methods are added the validator object is bound to 'this'
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
