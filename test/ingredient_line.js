var Unit = require('../domain/unit');
var IngredientLine = require('../domain/ingredient_line');
var Amount = require('../domain/amount');
var assert = require('assert');

describe("ingredient line", function() {
  it("amounts should be constructed", function() {
    var ingredientLine = new IngredientLine(new Amount(1, Unit.unitFromName('cup')), 'flour');
    
    assert.equal(ingredientLine.amount.quantity, 1);
    assert.equal(ingredientLine.amount.unit.name, 'cup');
    assert.equal(ingredientLine.ingredient.name, 'flour');
  });
  
  it("amounts should parse 'a'", function() {
    var ingredientLine = new IngredientLine(new Amount('a', Unit.unitFromName('cup')), 'flour');
    
    assert.equal(ingredientLine.amount.quantity, 1);
    assert.equal(ingredientLine.amount.unit.name, 'cup');
    assert.equal(ingredientLine.ingredient.name, 'flour');
  });

  it("amounts should parse 'an'", function() {
    var ingredientLine = new IngredientLine(new Amount('an', Unit.unitFromName('ounce')), 'flour');
    
    assert.equal(ingredientLine.amount.quantity, 1);
    assert.equal(ingredientLine.amount.unit.name, 'ounce');
    assert.equal(ingredientLine.ingredient.name, 'flour');
  });
  
  it("amounts should parse fractions", function() {
    var ingredientLine = new IngredientLine(new Amount('3/4', Unit.unitFromName('cup')), 'flour');
    
    assert.equal(ingredientLine.amount.quantity, 0.75);
    assert.equal(ingredientLine.amount.unit.name, 'cup');
    assert.equal(ingredientLine.ingredient.name, 'flour');
  });
  
  it("amounts should parse decimals", function() {
    var ingredientLine = new IngredientLine(new Amount('0.25', Unit.unitFromName('cup')), 'flour');
    
    assert.equal(ingredientLine.amount.quantity, 0.25);
    assert.equal(ingredientLine.amount.unit.name, 'cup');
    assert.equal(ingredientLine.ingredient.name, 'flour');
  });
  
  it("should scale amounts", function() {
    var ingredientLine = new IngredientLine(new Amount(1, Unit.unitFromName('cup')), 'flour');
    var scaled = ingredientLine.ingredientLineByScaling(3)
    
    assert.equal(scaled.amount.quantity, 3)
    assert.equal(scaled.amount.unit.name, 'cup')
    assert.equal(scaled.ingredient.name, 'flour')
  });
  
  
});
