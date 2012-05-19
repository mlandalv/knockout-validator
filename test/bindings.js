/// <reference path="../libs/qunit-git.js" />
/// <reference path="../libs/knockout-2.0.0.js" />
/// <reference path="../build/output/knockout-validator-debug.js" />

/*
Tests in the file maps against predefined html elements in test-suite.html.
All tests are made on input elements although they also work on select and textarea,
and other elements.
*/

module("Validatable Binding Handler");

test("required attribute", function () {
    var target = ko.observable(),
        viewModel = {
            required: ko.observable(),
            requiredCustom: ko.observable()
        };

    ko.applyBindings(viewModel, document.getElementById("RequiredAttributeContext"));

    ok(viewModel.required.validator.rules.required, "Required method added");
    equal(viewModel.required.validator.rules.messages.required, undefined, "No custom required message");

    ok(viewModel.requiredCustom.validator.rules.required, "Required method added");
    equal(viewModel.requiredCustom.validator.rules.messages.required, "Required message", "Custom required message");
});

test("min attribute", function () {
    var target = ko.observable(),
        viewModel = {
            min: ko.observable(),
            minCustom: ko.observable()
        };

    ko.applyBindings(viewModel, document.getElementById("MinAttributeContext"));

    equal(viewModel.min.validator.rules.min, 1, "Min rule added");
    equal(viewModel.min.validator.rules.messages.min, undefined, "No custom min message");

    equal(viewModel.minCustom.validator.rules.min, 1, "Min rule added");
    equal(viewModel.minCustom.validator.rules.messages.min, "Min: {0}", "Custom min message");
});

test("max attribute", function () {
    var target = ko.observable(),
        viewModel = {
            max: ko.observable(),
            maxCustom: ko.observable()
        };

    ko.applyBindings(viewModel, document.getElementById("MaxAttributeContext"));

    equal(viewModel.max.validator.rules.max, 10, "Max rule added");
    equal(viewModel.max.validator.rules.messages.max, undefined, "No custom max message");

    equal(viewModel.maxCustom.validator.rules.max, 10, "Max rule added");
    equal(viewModel.maxCustom.validator.rules.messages.max, "Max: {0}", "Custom max message");
});

test("maxlength attribute", function () {
    var target = ko.observable(),
        viewModel = {
            maxLength: ko.observable(),
            maxLengthCustom: ko.observable()
        };

    ko.applyBindings(viewModel, document.getElementById("MaxLengthAttributeContext"));

    equal(viewModel.maxLength.validator.rules.maxlength, 20, "Maxlength rule added");
    equal(viewModel.maxLength.validator.rules.messages.maxlength, undefined, "No custom maxlength message");

    equal(viewModel.maxLengthCustom.validator.rules.maxlength, 20, "Maxlength rule added");
    equal(viewModel.maxLengthCustom.validator.rules.messages.maxlength, "MaxLength: {0}", "Custom maxlength message");
});

test("Validation classes applied correctly", function () {
    var target = ko.observable(),
        viewModel = {
            required: ko.observable()
        },
        domElement = document.getElementById("reqTest");

    ko.applyBindings(viewModel, document.getElementById("ValidationClassTest"));

    equal(domElement.className, "valid", "Valid by default");

    viewModel.required(null);
    equal(domElement.className, "invalid", "Invalid if any rule fail");

    viewModel.required("foobar");
    equal(domElement.className, "valid", "Valid if all rules pass");
});
