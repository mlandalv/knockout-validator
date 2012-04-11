/// <reference path="../libs/qunit-git.js" />
/// <reference path="../libs/knockout-2.0.0.js" />
/// <reference path="../build/output/knockout-validate-debug.js" />

module("Rules extender");

test("validator.valid", function () {
    var target = ko.observable().extend({
        rules: {
            required: true,
            number: true
        }
    });

    equal(target.validator.valid(), true, "Always true as default, before the value has changed");

    // Changing value triggers revalidation
    target(1);
    equal(target.validator.valid(), true, "True if all rules passes");
    target("foobar");
    equal(target.validator.valid(), false, "False if any rule fails");

    // True if no rules at all are specified
    target = ko.observable().extend({ rules: {} });
    equal(target.validator.valid(), true, "True if no rules at all are specified");
});

test("validator.validate", function () {
    var target = ko.observable().extend({
        rules: {
            required: true,
            number: true
        }
    });

    equal(target.validator.validate(), false, "False if any rule fails");
});

test("validator.errors", function () {
    var target = ko.observable().extend({
        rules: {
            required: true,
            number: true
        }
    });

    target.validator.validate();

    // Note that the number rule isn't run because of this.optional (see the number implementation)
    equal(target.validator.errors().length, 1, "Contains one error message (required)");

    target("foobar");
    equal(target.validator.errors().length, 1, "Contains one error message (number)");
});

test("validator.message", function () {
    var target = ko.observable().extend({
        rules: {
            required: true,
            number: true
        }
    });

    target.validator.validate();

    equal(target.validator.message(), ko.validator.messages.required, "Message contains the first error in the errors array (required)");

    target("foobar");
    equal(target.validator.message(), ko.validator.messages.number, "Message contains the first error in the errors array (number)");

    // When valid is false, message must be readable
    target.validator.valid.subscribe(function (newValue) {
        // If valid, then the message should be undefined
        if (newValue) {
            equal(target.validator.message(), undefined, "When valid is true, message is undefined");
        } else { // If not valid, then the message shouldn't be undefined
            equal(typeof target.validator.message(), "string", "If not valid, then the message is of type string");
        }
    });

    target("foo");
});

test("Extending rules", function () {
    var target = ko.observable().extend({
        rules: {
            required: true
        }
    });

    // Add the number rules with custom message, but also change the required message
    target.extend({
        rules: {
            number: true,
            messages: {
                required: "required",
                number: "number"
            }
        }
    });

    target.validator.validate();

    equal(target.validator.valid(), false, "False since no value is specified");
    equal(target.validator.message(), "required", "Required message was overridden on second extend call");

    target("foobar");
    equal(target.validator.valid(), false, "False since value is not a number");
    equal(target.validator.message(), "number", "Using overridden error message");
});

test("Rule dependencies", function () {
    var requireNumber = ko.observable(false),
        target = ko.observable().extend({
            rules: {
                required: ko.computed(function () {
                    return requireNumber();
                }),
                number: requireNumber
            }
        });

    target.validator.validate();
    equal(target.validator.valid(), true, "True since the dependency doesn't require a numeric value");

    requireNumber(true);
    equal(target.validator.valid(), true, "True since the observable doesn't have a value (is optional)");
    target("foobar");
    equal(target.validator.valid(), false, "False since the value is not numeric");
    requireNumber(false);
    equal(target.validator.valid(), true, "True since required dependency is removed");

    requireNumber = ko.observable(true);
    target = ko.observable("foobar").extend({
        rules: {
            number: requireNumber
        }
    });
    equal(target.validator.valid(), true, "Default true since the rules extender doesn't force a validation");
    requireNumber(false);
    requireNumber(true);
    equal(target.validator.valid(), false, "False since changing a dependency causes validation if the element isn't optional");
});
