var AmountPresenter = require('../domain/presenters').AmountPresenter;
var Pattern = require('../domain/pattern');
var IngredientLine = require('../domain/ingredient_line');
var Unit = require('../domain/unit');
var assert = require('assert');

describe("amount presenter", function() {
  var pattern = new Pattern("{quantity} {unit} of {ingredient}")
  
  it("should present amounts", function() {
    var amount = new IngredientLine(1, Unit.unitFromName('cup'), 'flour');
    var amountPresenter = new AmountPresenter(pattern, amount);
    assert(amountPresenter.stringForDisplay = "1 cup of flour");
  });
  
  it("should pluralize amounts", function() {
    var amount = new IngredientLine(2, Unit.unitFromName('cup'), 'flour');
    var amountPresenter = new AmountPresenter(pattern, amount);
    assert(amountPresenter.stringForDisplay = "2 cups of flour");
  });
  
  it("should reduce amounts", function() {
    var amount = new IngredientLine(3, Unit.unitFromName('teaspoons'), 'flour');
    var amountPresenter = new AmountPresenter(pattern, amount);
    assert(amountPresenter.stringForDisplay = "1 tablespoon of flour");
  });
  
  it("should reduce and pluralize amounts", function() {
    var amount = new IngredientLine(6, Unit.unitFromName('teaspoons'), 'flour');
    var amountPresenter = new AmountPresenter(pattern, amount);
    assert(amountPresenter.stringForDisplay = "2 tablespoons of flour");
  });

});