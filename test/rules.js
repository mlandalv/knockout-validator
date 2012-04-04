/// <reference path="../libs/qunit-git.js" />
/// <reference path="../libs/knockout-2.0.0.js" />
/// <reference path="../build/output/knockout-validate-debug.js" />

module("Rules");

test("Required", function () {
    var target = ko.observable(),
        rule = ko.validator.methods.required;

    equal(ko.validator.messages.required, "This field is required.", "Verify default message");

    // undefined
    equal(rule(target(), target, true), false, "Expects false when value is undefined");

    // null
    target(null);
    equal(rule(target(), target, true), false, "Expects false when value is null");

    // Empty string
    target("");
    equal(rule(target(), target, true), false, "Expects false when value is empty string");

    // Zero is falsy, but a valid value
    target(0);
    equal(rule(target(), target, true), true, "Expects true if value is 0");

    // False
    target(false);
    equal(rule(target(), target, true), true, "Expects true when value is false");

    // Non-zero length string
    target("a");
    equal(rule(target(), target, true), true, "Expects true when string value is set");
});

test("Number", function () {
    var target = ko.observable(),
        rule = ko.validator.methods.number;

    equal(ko.validator.messages.number, "Please enter a valid number.", "Verify default message");
    equal(rule(target(), target, true), true, "True if value is not set (optional)");

    // Zero
    target(0);
    equal(rule(target(), target, true), true, "True is returned if value is 0");

    // String
    target("foobar");
    equal(rule(target(), target, true), false, "False if value not convertable to number");

    // String decimals
    target("0.1");
    equal(rule(target(), target, true), true, "True if decimal value")
    target("0,1");
    equal(rule(target(), target, true), false, "False if invalid decimal format");
});

test("Min", function () {
    var target = ko.observable(),
        rule = ko.validator.methods.min;

    equal(ko.validator.messages.min, "Please enter a value greater than or equal to {0}.", "Verify default message");
    equal(rule(target(), target, true), true, "True if value is not set (optional)");

    // String
    target("foobar");
    equal(rule(target(), target, 1), false, "False if value not convertable to number");
    target("10");
    equal(rule(target(), target, 5), true, "True if value convertable to number and greater than min");

    target(0);
    equal(rule(target(), target, 1), false, "False if value less than min");
    equal(rule(target(), target, 0), true, "True if value equal to min");
    equal(rule(target(), target, -1), true, "True if value greater than min");
});

test("Max", function () {
    var target = ko.observable(),
        rule = ko.validator.methods.max;

    equal(ko.validator.messages.max, "Please enter a value less than or equal to {0}.", "Verify default message");
    equal(rule(target(), target, true), true, "True if value is not set (optional)");

    // String
    target("foobar");
    equal(rule(target(), target, 1), false, "False if value not convertable to number");
    target("5");
    equal(rule(target(), target, 10), true, "True if value convertable to number and less than max");

    target(0);
    equal(rule(target(), target, 1), true, "True if value less than max");
    equal(rule(target(), target, 0), true, "True if value equal to max");
    equal(rule(target(), target, -1), false, "False if value greater than max");
});
