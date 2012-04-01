(function (ko) {
    "use strict";

    ko.validator.addMethod("required",
        function (target) {
            var targetValue = target();

            return targetValue !== undefined && targetValue !== null && targetValue !== "";
        }, "This field is required.");

    ko.validator.addMethod("number",
        function (target) {
            return this.optional(target) || !isNaN(+(target()));
        }, "Please enter a valid number.");
}(ko));
