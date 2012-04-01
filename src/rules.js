(function (ko) {
    "use strict";

    ko.validator.addMethod("required",
        function (value, target, param) {
            var targetValue = target();

            return targetValue !== undefined && targetValue !== null && targetValue !== "";
        }, "This field is required.");

    ko.validator.addMethod("number",
        function (value, target, param) {
            return this.optional(target) || !isNaN(+(target()));
        }, "Please enter a valid number.");
}(ko));
