var Unit = require('../domain/unit');
var IngredientLine = require('../domain/ingredient_line');
var Amount = require('../domain/amount');
var assert = require('assert');

describe("ingredient line", function() {
  
  it("should scale ingredient lines", function() {
    var ingredientLine = new IngredientLine(new Amount(1, Unit.unitFromName('cup')), 'flour');
    var scaled = ingredientLine.ingredientLineByScaling(3);
    
    assert.equal(scaled.amount.quantity, 3);
    assert.equal(scaled.amount.unit.name, 'cup');
    assert.equal(scaled.ingredient.name, 'flour');
  });
  
  
});
