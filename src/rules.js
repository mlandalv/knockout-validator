(function (ko) {
    "use strict";

    ko.validator.addMethod("required",
        function (value) {
            return value !== undefined && value !== null && value !== "";
        }, "This field is required.");

    ko.validator.addMethod("number",
        function (value, target) {
            return this.optional(target) || !isNaN(+(value));
        }, "Please enter a valid number.");

    ko.validator.addMethod("min",
        function (value, target, param) {
            return this.optional(target) || value >= param;
        }, "Please enter a value greater than or equal to {0}.");

    ko.validator.addMethod("max",
        function (value, target, param) {
            return this.optional(target) || value <= param;
        }, "Please enter a value less than or equal to {0}.");

    ko.validator.addMethod("digits",
        function (value, target) {
            return this.optional(target) || /^\d+$/.test(value);
        }, "Please enter only digits.");
}(ko));
