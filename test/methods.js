/// <reference path="../libs/qunit-git.js" />
/// <reference path="../libs/knockout-2.0.0.js" />
/// <reference path="../build/output/knockout-validator-debug.js" />

module("Methods");

test("required", function () {
    var target = ko.observable(),
        method = ko.validator.methods.required;

    equal(ko.validator.messages.required, "This field is required.", "Verify default message");

    // undefined
    equal(method(target(), target), false, "Expects false when value is undefined");

    // null
    target(null);
    equal(method(target(), target), false, "Expects false when value is null");

    // Empty string
    target("");
    equal(method(target(), target), false, "Expects false when value is empty string");

    // Zero is falsy, but a valid value
    target(0);
    equal(method(target(), target), true, "Expects true if value is 0");

    // False
    target(false);
    equal(method(target(), target), true, "Expects true when value is false");

    // Non-zero length string
    target("a");
    equal(method(target(), target), true, "Expects true when string value is set");
});

test("number", function () {
    var target = ko.observable(),
        method = ko.validator.methods.number;

    equal(ko.validator.messages.number, "Please enter a valid number.", "Verify default message");
    equal(method(target(), target), true, "True if value is not set (optional)");

    // Zero
    target(0);
    equal(method(target(), target), true, "True is returned if value is 0");

    // String
    target("foobar");
    equal(method(target(), target), false, "False if value not convertable to number");

    // String decimals
    target("0.1");
    equal(method(target(), target), true, "True if decimal value")
    target("0,1");
    equal(method(target(), target), false, "False if invalid decimal format");
});

test("min", function () {
    var target = ko.observable(),
        method = ko.validator.methods.min;

    equal(ko.validator.messages.min, "Please enter a value greater than or equal to {0}.", "Verify default message");
    equal(method(target(), target), true, "True if value is not set (optional)");

    // String
    target("foobar");
    equal(method(target(), target, 1), false, "False if value not convertable to number");
    target("10");
    equal(method(target(), target, 5), true, "True if value convertable to number and greater than min");

    target(0);
    equal(method(target(), target, 1), false, "False if value less than min");
    equal(method(target(), target, 0), true, "True if value equal to min");
    equal(method(target(), target, -1), true, "True if value greater than min");
});

test("max", function () {
    var target = ko.observable(),
        method = ko.validator.methods.max;

    equal(ko.validator.messages.max, "Please enter a value less than or equal to {0}.", "Verify default message");
    equal(method(target(), target), true, "True if value is not set (optional)");

    // String
    target("foobar");
    equal(method(target(), target, 1), false, "False if value not convertable to number");
    target("5");
    equal(method(target(), target, 10), true, "True if value convertable to number and less than max");

    target(0);
    equal(method(target(), target, 1), true, "True if value less than max");
    equal(method(target(), target, 0), true, "True if value equal to max");
    equal(method(target(), target, -1), false, "False if value greater than max");
});

test("digits", function () {
    var target = ko.observable(),
        method = ko.validator.methods.digits;

    equal(ko.validator.messages.digits, "Please enter only digits.", "Verify default message");
    equal(method(target(), target), true, "True if value is not set (optional)");

    // Zero
    target(0);
    equal(method(target(), target), true, "True if integer");

    // String
    target("foobar");
    equal(method(target(), target), false, "False if value not convertable to number");

    target("0.1");
    equal(method(target(), target), false, "False if decimal value")
    target(0.1);
    equal(method(target(), target), false, "False if decimal value")
    target("0,1");
    equal(method(target(), target), false, "False if invalid decimal separator (parseInt would parse this to a valid digit number)");
});

test("range", function () {
    var target = ko.observable(),
        method = ko.validator.methods.range;

    // Insert param values to test default values since function is used
    equal(ko.validator.messages.range({ min: 1, max: 2 }), "Please enter a value between 1 and 2.", "Verify default message");
    equal(method(target(), target), true, "True if value is not set (optional)");

    target(1);
    equal(method(target(), target, { min: 1, max: 2 }), true, "True if value equal to min");
    target(2);
    equal(method(target(), target, { min: 1, max: 2 }), true, "True if value equal to max");
    target(2);
    equal(method(target(), target, { min: 2, max: 2 }), true, "True if value equal to min and max");

    target(0);
    equal(method(target(), target, { min: 1, max: 2 }), false, "False if value less than min");
    target(3);
    equal(method(target(), target, { min: 1, max: 2 }), false, "False if value greater than max");

    target("foobar");
    equal(method(target(), target, { min: 1, max: 2 }), false, "False if value not number");
});

test("date", function () {
    var target = ko.observable(),
        method = ko.validator.methods.date;

    equal(ko.validator.messages.date, "Please enter a valid date.", "Verify default message");
    equal(method(target(), target), true, "True if value is not set (optional)");

    target(new Date());
    equal(method(target(), target), true, "True if date object");

    target(0);
    equal(method(target(), target), true, "True if 0");

    target("");
    equal(method(target(), target), true, "True if empty string (optional)");

    target("2011-01-01");
    equal(method(target(), target), true, "True if ISO format");

    target("July 27, 2005 12:22:00");
    equal(method(target(), target), true, "True if correct string format for Date constructor");

    target("foobar");
    equal(method(target(), target), false, "False if non date string");
});

test("dateISO", function () {
    var target = ko.observable(),
        method = ko.validator.methods.dateISO;

    equal(ko.validator.messages.dateISO, "Please enter a valid date (ISO).", "Verify default message");
    equal(method(target(), target), true, "True if value is not set (optional)");

    target("2000-01-01");
    equal(method(target(), target), true, "True if yyyy-MM-dd");

    target("0000-01-01");
    equal(method(target(), target), true, "True if year 0");

    equal(method(target(), target), true, "True if year -1");

    target("20000101");
    equal(method(target(), target), false, "False if dashes omitted");

    target("90-01-01");
    equal(method(target(), target), false, "False if year only is 2 characters");

    target("2000-1-01");
    equal(method(target(), target), false, "False if no leading 0 in month");

    target("2000-01-1");
    equal(method(target(), target), false, "False if no leading 0 in day");
});

test("url", function () {
    var target = ko.observable(),
        method = ko.validator.methods.url;

    equal(ko.validator.messages.url, "Please enter a valid URL.", "Verify default message");
    equal(method(target(), target), true, "True if value is not set (optional)");

    target("foobar");
    equal(method(target(), target), false, "False if foobar");

    target(true);
    equal(method(target(), target), false, "False if boolean");
    target(false);
    equal(method(target(), target), false, "False if boolean");

    target(0);
    equal(method(target(), target), false, "False if number");
    target(1.1);
    equal(method(target(), target), false, "False if number");

    target("http");
    equal(method(target(), target), false, "False if only protocol");

    target("http://");
    equal(method(target(), target), false, "False if only protocol");

    target("http://google");
    equal(method(target(), target), false, "False if TLD missing");

    target("http://google.com");
    equal(method(target(), target), true, "True if no trailing slash");

    target("http://google.com/");
    equal(method(target(), target), true, "True if trailing slash");

    target("https://google.com/");
    equal(method(target(), target), true, "True if https protocl");

    target("ftp://google.com/");
    equal(method(target(), target), true, "True if ftp protocol");
});

test("email", function () {
    var target = ko.observable(),
        method = ko.validator.methods.email;

    equal(ko.validator.messages.email, "Please enter a valid email address.", "Verify default message");
    equal(method(target(), target), true, "True if value is not set (optional)");

    target("foobar");
    equal(method(target(), target), false, "False if foobar");

    target(true);
    equal(method(target(), target), false, "False if boolean");
    target(false);
    equal(method(target(), target), false, "False if boolean");

    target(0);
    equal(method(target(), target), false, "False if number");
    target(1.1);
    equal(method(target(), target), false, "False if number");

    target("user@");
    equal(method(target(), target), false, "False if domain is missing");

    target("user@domain");
    equal(method(target(), target), false, "False if TLD is missing");

    target("user@domain.com");
    equal(method(target(), target), true, "True if simple email");

    target("u-s.er@domain.com");
    equal(method(target(), target), true, "True if address contains hyphen and dot");
});