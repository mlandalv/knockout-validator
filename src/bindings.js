(function (ko) {
    "use strict";

    var validator = ko.validator,
        utils = validator.utils,
        koUtils = ko.utils,
        validationAttributes = [
            { attr: "required", method: "required", message: "data-val-required" },
            { attr: "min", method: "min", message: "data-val-min" },
            { attr: "max", method: "max", message: "data-val-max" },
            { attr: "maxlength", method: "maxlength", message: "data-val-maxlength" }
        ];

    ko.bindingHandlers.validatable = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var target = valueAccessor(),
                rules = {
                    messages: {}
                };

            // Extract validation property add to the rules object.
            koUtils.arrayForEach(validationAttributes, function (item) {
                if (element.attributes[item.attr]) {
                    rules[item.method] = element.attributes[item.attr].value;

                    // If default error message should be overridden
                    if (element.attributes[item.message]) {
                        rules.messages[item.method] = element.attributes[item.message].value;
                    }
                }
            });

            // TODO: If both min and max are specified, convert to the range rule?
            // If so data-val-range should be used to override the default message.

            target.extend({
                rules: rules
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var target = valueAccessor(),
                isValid = target.validator.valid();

            koUtils.toggleDomNodeCssClass(element, validator.options.validClass, isValid);
            koUtils.toggleDomNodeCssClass(element, validator.options.invalidClass, !isValid);
        }
    };
}(ko));
