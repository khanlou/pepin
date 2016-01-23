var Unit = require('../assets/js/domain/unit');
var IngredientLine = require('../assets/js/domain/ingredient_line');
var Amount = require('../assets/js/domain/amount');
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
