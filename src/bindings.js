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

    ko.bindingHandlers.validate = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var target = valueAccessor(),
                allBindings = allBindingsAccessor(),
                rules = koUtils.extend({ messages: {} }, allBindings.rules || {});

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

            target.extend({
                rules: rules
            });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var target = valueAccessor(),
                isValid = target.validator.valid();

            koUtils.toggleDomNodeCssClass(element, validator.options.validClass, isValid);
            koUtils.toggleDomNodeCssClass(element, validator.options.errorClass, !isValid);
        }
    };

    ko.bindingHandlers.validationMessage = {
        init: function (element) {
            koUtils.toggleDomNodeCssClass(element, validator.options.errorClass, true);
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var target = valueAccessor(),
                isValid = target.validator.valid();

            if (isValid) {
                koUtils.setHtml(element, "");
            } else {
                koUtils.setHtml(element, target.validator.message());
            }
        }
    };
}(ko));
