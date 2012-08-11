/// <reference path="../libs/qunit-git.js" />
/// <reference path="../libs/knockout-2.0.0.js" />
/// <reference path="../build/output/knockout-validator-debug.js" />

module("Utils");

/*
    ko.validator.utils.format
*/
test("format", function () {
    var utils = ko.validator.utils;

    equal(utils.format("foo{0}", "bar"), "foobar", "String replacement");
    equal(utils.format("12{0}", 3), "123", "Number replacement");
    equal(utils.format("{0}{1}", "foo", "bar"), "foobar", "Replacements don't replace each other");
});

/*
    ko.validator.utils.unwrap
*/
test("unwrap", function () {
    var utils = ko.validator.utils, unwrap = utils.unwrap, res;

    equal(unwrap(true), true, "Enabled if param is true");
    equal(unwrap(function () { return true; }), true, "Enabled if param is function returning true");
    deepEqual(unwrap({ foo: "bar" }), { foo: "bar" }, "Object is returned");

    // ko.observable
    equal(unwrap(ko.observable(true)), true, "Enabled if param is observable with value true");
    deepEqual(unwrap(ko.observable({ foo: "bar" })), { foo: "bar" }, "Object is unwrapped from observable");
    equal(unwrap(ko.observable(function () { return true; })), true, "If the observable contains a function, the function's value is returned");

    // ko.computed
    equal(unwrap(ko.computed(function () { return true; })), true, "Returns computeds value");
    deepEqual(unwrap(ko.computed(function () { return { foo: "bar" }; })), { foo: "bar" }, "Object is unwrapped from computed");
    equal(unwrap(ko.computed(function () { return function () { return true; }; })), true, "If the computed returns a function, the function's value is returned");
});

/*
    ko.validator.utils.isValidatable
*/
test("isValidatable", function () {
    var utils = ko.validator.utils,
        target;

    target = {};
    equal(utils.isValidatable(target), false, "False if no validate method exists");

    target.validator = {};
    equal(utils.isValidatable(target), true, "True if a validator property exits");
});

/*
    ko.validator.utils.validateObservable
*/
test("validateObservable", function () {
    var utils = ko.validator.utils,
        target;

    target = ko.observable();
    equal(utils.validateObservable(target), true, "True observable isn't validatable");

    target = ko.observableArray([
        ko.observable("foo"),
        ko.observable("bar")
    ]);
    equal(utils.validateObservable(target), true, "True observable isn't validatableif observable array with non-validatable objects");

    target = ko.computed(function () { return "foobar"; });
    equal(utils.validateObservable(target), true, "True if computable");

    target = ko.computed({
        read: function () {
            return "foobar";
        },
        write: function (value) {}
    });
    equal(utils.validateObservable(target), true, "True if writable computable");

    target = ko.observable("foobar").extend({
        rules: {}
    });
    equal(utils.validateObservable(target), true, "True if no rule options were specified");

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

    equal(utils.validateObject({}), true, "True if object contains no properties");

    equal(utils.validateObject(true), true, "True if object is boolean");
    equal(utils.validateObject(false), true, "True if object is boolean");

    equal(utils.validateObject(0), true, "True if object is number");
    equal(utils.validateObject(1), true, "True if object is number");

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
    equal(utils.validateArray(target), true, "True if empty array");

    target = [true, false, 1, {}, ko.observable(), [], ko.observableArray()];
    equal(utils.validateArray(target), true, "True if array only contains non-validatable objects");

    target = [{
        prop1: true,
        prop2: ko.observable().extend({ rules: { required: true } })
    },
    1];
    equal(utils.validateArray(target), false, "False if any object is validatable and fails validation");

    raises(function () { utils.validateArray({}); }, "Error if input is object");
    raises(function () { utils.validateArray(); }, "Error if input is undefined");
    raises(function () { utils.validateArray(null); }, "Error if input is null");
    raises(function () { utils.validateArray(true); }, "Error if input is boolean");
    raises(function () { utils.validateArray(1); }, "Error if input is number");
    raises(function () { utils.validateArray(function () { }); }, "Error if function");
    raises(function () { utils.validateArray(ko.observable()); }, "Error if ko.observable");
    raises(function () { utils.validateArray(ko.observableArray()); }, "Error if ko.observableArray");
});
