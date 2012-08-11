/// <reference path="../libs/qunit-git.js" />
/// <reference path="../libs/knockout-2.1.0.js" />
/// <reference path="../build/output/knockout-validator-debug.js" />

module("validate");

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
    equal(domElement.className, "error", "Error if any rule fail");

    viewModel.required("foobar");
    equal(domElement.className, "valid", "Valid if all rules pass");
});

test("Rules binding", function () {
    var target = ko.observable(),
        viewModel = {
            requiredDefault: ko.observable(),
            requiredCustom: ko.observable(),
            requiredComputed: ko.observable(),
            isRequired: ko.computed(function () {
            })
        },
        domElement = document.getElementById("reqTest");

    ko.applyBindings(viewModel, document.getElementById("RulesBindingContext"));

    ok(viewModel.requiredDefault.validator.rules.required, "Required method added");
    equal(viewModel.requiredDefault.validator.rules.messages.required, undefined, "No custom required message");

    ok(viewModel.requiredCustom.validator.rules.required, "Required method added");
    equal(viewModel.requiredCustom.validator.rules.messages.required, "Required message", "Custom required message");

    equal(viewModel.requiredComputed.validator.rules.required, viewModel.isRequired, "Required method added");
    equal(viewModel.requiredComputed.validator.rules.messages.required, undefined, "No custom required message");
});

module("validationMessage");

test("errorClass applied", function () {
    var validationDomNode = document.getElementById("ValidationMessage"),
        viewModel = {
            required: ko.observable()
        };

    viewModel.required.extend({
        rules: { required: true }
    });

    ko.applyBindings(viewModel, validationDomNode);

    ok($(validationDomNode).hasClass(ko.validator.options.errorClass));
});

test("Error message updated", function () {
    var validationDomNode = document.getElementById("ValidationMessage"),
        viewModel = {
            required: ko.observable()
        };

    viewModel.required.extend({
        rules: { required: true }
    });

    ko.applyBindings(viewModel, validationDomNode);

    viewModel.required(""); // Force validation
    equal($(validationDomNode).text(), viewModel.required.validator.message(), "Node content set to error message");

    viewModel.required("foobar");
    equal($(validationDomNode).text(), "", "Error message cleared");
});
