/// <reference path="../libs/qunit-git.js" />
/// <reference path="../libs/knockout-2.0.0.js" />
/// <reference path="../build/output/knockout-validate-debug.js" />

module("Validator Utils");

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
