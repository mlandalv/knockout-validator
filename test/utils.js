/// <reference path="../libs/qunit-git.js" />
/// <reference path="../libs/knockout-2.0.0.js" />
/// <reference path="../build/output/knockout-validate-debug.js" />

module("Validator Utils");

/*
    ko.validator.utils.isRuleEnabled
*/
test("isRuleEnabled", function () {
    var utils = ko.validator.utils;

    equal(utils.isRuleEnabled(true), true, "Enabled if param is true");
    equal(utils.isRuleEnabled(false), false, "Disabled if param is false");
    equal(utils.isRuleEnabled(function () { return true; }), true, "Enabled if param is function returning true");
    equal(utils.isRuleEnabled(function () { return false; }), false, "Disabled if param is function returning false");
    equal(utils.isRuleEnabled({}), true, "Enabled if param is object");

    // ko.observable
    equal(utils.isRuleEnabled(ko.observable(true)), true, "Enabled if param is observable with value true");
    equal(utils.isRuleEnabled(ko.observable(false)), false, "Disabled if param is observable with value false");

    // ko.computed
    equal(utils.isRuleEnabled(ko.computed(function () { return true; })), true, "Enabled if param is computed returning true");
    equal(utils.isRuleEnabled(ko.computed(function () { return false; })), false, "Disabled if param is computed returning false");
});

/*
    ko.validator.utils.isValidatable
*/
test("isValidatable", function () {
    var utils = ko.validator.utils,
        target;

    target = {};
    equal(utils.isValidatable(target), false, "False if no validate method exists");

    target.validate = function () { };
    equal(utils.isValidatable(target), true, "True if a validate method exits");
});

/*
    ko.validator.utils.validateObservable
*/
test("validateObservable", function () {
    var utils = ko.validator.utils,
        target;

    target = ko.observable("foobar").extend({ rules: {} });
    equal(utils.validateObservable(target), true, "True if no rules were specified");

    target = ko.observable("foobar").extend({
        rules: {
            required: true,
            number: true
        }
    });
    equal(utils.validateObservable(target), false, "False if any rule fails validation");
});

/*
    ko.validator.utils.validateObject
*/
test("validateObject", function () {
    var utils = ko.validator.utils,
        target;

    target = {};
    equal(utils.validateObject(target), true, "True if object contains no properties");

    target = true;
    equal(utils.validateObject(target), true, "True if object is boolean");

    target = 1;
    equal(utils.validateObject(target), true, "True if object is number");

    target = ko.observable();
    equal(utils.validateObject(target), true, "True if observable is not extended with rules");

    target = ko.observable().extend({ rules: { required: true } });
    equal(utils.validateObject(target), false, "False if any rule fails");

    target = [];
    equal(utils.validateObject(target), true, "True if object is empty array");

    target = ko.observableArray();
    equal(utils.validateObject(target), true, "True if object is empty observableArray");

    target = [
        ko.observable().extend({ rules: { required: true } }),
        ko.observable()
    ];
    equal(utils.validateObject(target), false, "False if array contains at least one element failing validation");

    target = ko.observableArray([
        ko.observable().extend({ rules: { required: true } }),
        ko.observable()
    ]);
    equal(utils.validateObject(target), false, "False if observableArray contains at least one element failing validation");
});

/*
    ko.validator.utils.validateArray
    Does only validate native arrays, not ko.observableArray
*/
test("validateArray", function () {
    var utils = ko.validator.utils,
        target;

    target = [];
    equal(utils.validateObject(target), true, "True if empty array");

    target = [true, false, 1, {}, ko.observable(), [], ko.observableArray()];
    equal(utils.validateObject(target), true, "True if array only contains non-validatable objects");

    target = [{
        prop1: true,
        prop2: ko.observable().extend({ rules: { required: true } })
    },
    1];
    equal(utils.validateObject(target), false, "False if any object is validatable and fails validation");
});
