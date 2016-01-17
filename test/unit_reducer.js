var UnitReducer = require('../domain/unit_reducer');
var IngredientLine = require('../domain/ingredient_line');
var Unit = require('../domain/unit');
var assert = require('assert');

describe("unit reducer", function() {
  
  it("should reduce units", function() {
    var amount = new IngredientLine(3, Unit.unitFromName('teaspoons'), 'flour');
    var unitReducer = new UnitReducer(amount);
    var reducedAmount = unitReducer.reducedAmount;
    assert.equal(reducedAmount.quantity, 1);
    assert.equal(reducedAmount.unit.name, 'tablespoon');
    assert.equal(reducedAmount.ingredient.name, 'flour');
  });
  
  it("shouldn't reduce irreducable units", function() {
    var amount = new IngredientLine(3, Unit.unitFromName('cups'), 'flour');
    var unitReducer = new UnitReducer(amount);
    var reducedAmount = unitReducer.reducedAmount;
    assert.equal(reducedAmount.quantity, 3);
    assert.equal(reducedAmount.unit.name, 'cup');
    assert.equal(reducedAmount.ingredient.name, 'flour');
  });
  

});
