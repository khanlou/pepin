var IngredientLinePresenter = require('../assets/js/domain/ingredient_line_presenter');
var Pattern = require('../assets/js/domain/pattern');
var IngredientLine = require('../assets/js/domain/ingredient_line');
var Amount = require('../assets/js/domain/amount');
var Unit = require('../assets/js/domain/unit');
var assert = require('assert');

describe("ingredient line presenter", function() {
  var pattern = new Pattern("{quantity} {unit} of {ingredient}")
  
  it("should present amounts", function() {
    var ingredientLine = new IngredientLine(new Amount(1, Unit.unitFromName('cup')), 'flour');
    var ingredientLinePresenter = new IngredientLinePresenter(pattern, ingredientLine);
    assert(ingredientLinePresenter.stringForDisplay = "1 cup of flour");
  });
  
  it("should pluralize amounts", function() {
    var ingredientLine = new IngredientLine(new Amount(2, Unit.unitFromName('cup')), 'flour');
    var ingredientLinePresenter = new IngredientLinePresenter(pattern, ingredientLine);
    assert(ingredientLinePresenter.stringForDisplay = "2 cups of flour");
  });
  
  it("should reduce amounts", function() {
    var ingredientLine = new IngredientLine(new Amount(3, Unit.unitFromName('teaspoons')), 'flour');
    var ingredientLinePresenter = new IngredientLinePresenter(pattern, ingredientLine);
    assert(ingredientLinePresenter.stringForDisplay = "1 tablespoon of flour");
  });
  
  it("should reduce and pluralize amounts", function() {
    var ingredientLine = new IngredientLine(new Amount(6, Unit.unitFromName('teaspoons')), 'flour');
    var ingredientLinePresenter = new IngredientLinePresenter(pattern, ingredientLine);
    assert(ingredientLinePresenter.stringForDisplay = "2 tablespoons of flour");
  });

});
