var IngredientParser = require('../assets/js/domain/parser');
var assert = require('assert');

describe("parser", function() {
  it("should parse simple ingredient lines", function() {
    var parser = new IngredientParser("1 cup flour");
    var ingredientLine = parser.ingredientLine;
    assert.equal(ingredientLine.amount.quantity, 1)
    assert.equal(ingredientLine.amount.unit.name, 'cup')
    assert.equal(ingredientLine.ingredient.name, 'flour')
  });
  
  it("should parse ingredients with no unit", function() {
    var parser = new IngredientParser("an egg");
    var ingredientLine = parser.ingredientLine;
    assert.equal(ingredientLine.amount.quantity, 1)
    assert.equal(ingredientLine.amount.unit.name, '')
    assert.equal(ingredientLine.ingredient.name, 'egg')
  });
  

  it("should parse ingredient lines with 'of'", function() {
    var parser = new IngredientParser("1 cup of flour");
    var ingredientLine = parser.ingredientLine;
    assert.equal(ingredientLine.amount.quantity, 1)
    assert.equal(ingredientLine.amount.unit.name, 'cup')
    assert.equal(ingredientLine.ingredient.name, 'flour')
  });

  it("should scale ingredient lines", function() {
    var parser = new IngredientParser("1 cup of flour");
    var ingredientLine = parser.ingredientLine
    var scaled = ingredientLine.ingredientLineByScaling(3)
    
    assert.equal(scaled.amount.quantity, 3)
    assert.equal(scaled.amount.unit.name, 'cup')
    assert.equal(scaled.ingredient.name, 'flour')
  });
  
  it("should reduce amounts", function() {
    var parser = new IngredientParser("1 teaspoon of kosher salt");
    var amountString = parser.scale(3)
    assert.equal(amountString, '1 tablespoon of kosher salt')
  });
  
  it("reducing amounts should maintain the structure", function() {
    var parser = new IngredientParser("1 teaspoon kosher salt");
    var amountString = parser.scale(3)
    assert.equal(amountString, '1 tablespoon kosher salt')
  });
  
  
});