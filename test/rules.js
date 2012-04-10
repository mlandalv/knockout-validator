/// <reference path="../libs/qunit-git.js" />
/// <reference path="../libs/knockout-2.0.0.js" />
/// <reference path="../build/output/knockout-validate-debug.js" />

module("Rules");

test("Required", function () {
    var target = ko.observable(),
        rule = ko.validator.methods.required;

    equal(ko.validator.messages.required, "This field is required.", "Verify default message");

    // undefined
    equal(rule(target(), target), false, "Expects false when value is undefined");

    // null
    target(null);
    equal(rule(target(), target), false, "Expects false when value is null");

    // Empty string
    target("");
    equal(rule(target(), target), false, "Expects false when value is empty string");

    // Zero is falsy, but a valid value
    target(0);
    equal(rule(target(), target), true, "Expects true if value is 0");

    // False
    target(false);
    equal(rule(target(), target), true, "Expects true when value is false");

    // Non-zero length string
    target("a");
    equal(rule(target(), target), true, "Expects true when string value is set");
});

test("Number", function () {
    var target = ko.observable(),
        rule = ko.validator.methods.number;

    equal(ko.validator.messages.number, "Please enter a valid number.", "Verify default message");
    equal(rule(target(), target), true, "True if value is not set (optional)");

    // Zero
    target(0);
    equal(rule(target(), target), true, "True is returned if value is 0");

    // String
    target("foobar");
    equal(rule(target(), target), false, "False if value not convertable to number");

    // String decimals
    target("0.1");
    equal(rule(target(), target), true, "True if decimal value")
    target("0,1");
    equal(rule(target(), target), false, "False if invalid decimal format");
});

test("Min", function () {
    var target = ko.observable(),
        rule = ko.validator.methods.min;

    equal(ko.validator.messages.min, "Please enter a value greater than or equal to {0}.", "Verify default message");
    equal(rule(target(), target), true, "True if value is not set (optional)");

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
    equal(rule(target(), target), true, "True if value is not set (optional)");

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

test("Digits", function () {
    var target = ko.observable(),
        rule = ko.validator.methods.digits;

    equal(ko.validator.messages.digits, "Please enter only digits.", "Verify default message");
    equal(rule(target(), target), true, "True if value is not set (optional)");

    // Zero
    target(0);
    equal(rule(target(), target), true, "True if integer");

    // String
    target("foobar");
    equal(rule(target(), target), false, "False if value not convertable to number");

    target("0.1");
    equal(rule(target(), target), false, "False if decimal value")
    target(0.1);
    equal(rule(target(), target), false, "False if decimal value")
    target("0,1");
    equal(rule(target(), target), false, "False if invalid decimal separator (parseInt would parse this to a valid digit number)");
});

test("Range", function () {
    var target = ko.observable(),
        rule = ko.validator.methods.range;

    // Insert param values to test default values since function is used
    equal(ko.validator.messages.range({ min: 1, max: 2 }), "Please enter a value between 1 and 2.", "Verify default message");
    equal(rule(target(), target), true, "True if value is not set (optional)");

    target(1);
    equal(rule(target(), target, { min: 1, max: 2 }), true, "True if value equal to min");
    target(2);
    equal(rule(target(), target, { min: 1, max: 2 }), true, "True if value equal to max");
    target(2);
    equal(rule(target(), target, { min: 2, max: 2 }), true, "True if value equal to min and max");

    target(0);
    equal(rule(target(), target, { min: 1, max: 2 }), false, "False if value less than min");
    target(3);
    equal(rule(target(), target, { min: 1, max: 2 }), false, "False if value greater than max");

    target("foobar");
    equal(rule(target(), target, { min: 1, max: 2 }), false, "False if value not number");
});