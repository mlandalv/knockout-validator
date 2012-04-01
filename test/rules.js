/// <reference path="../libs/qunit-git.js" />
/// <reference path="../libs/knockout-2.0.0.js" />

module("Rules");

test("Required", function () {
    var observable = ko.observable(),
        rule = ko.validator.methods.required;

    equal(ko.validator.messages.required, "This field is required.", "Verify default message");

    // undefined
    equal(rule(observable), false, "Expects false when value is undefined");

    // null
    observable(null);
    equal(rule(observable), false, "Expects false when value is null");

    // Empty string
    observable("");
    equal(rule(observable), false, "Expects false when value is empty string");

    // Zero is considered a falsy value, but can be a valid value; ensure it returns true
    observable(0);
    equal(rule(observable), true, "Expects true if value is 0");

    // False
    observable(false);
    equal(rule(observable), true, "Expects true when value is false");

    // Non-zero length string
    observable("a");
    equal(rule(observable), true, "Expects true when string value is set");
});

test("Number", function () {
    var observable = ko.observable(),
        rule = ko.validator.methods.number;

    equal(ko.validator.messages.number, "Please enter a valid number.", "Verify default message");

    // Zero
    observable(0);
    equal(rule(observable), true, "True is returned if value is 0")

    // String
    observable("foobar");
    equal(rule(observable), false, "False if value not convertable to number")

    // String decimals
    observable("0.1");
    equal(rule(observable), true, "True if decimal value")
    observable("0,1");
    equal(rule(observable), false, "False if invalid decimal format")
});
