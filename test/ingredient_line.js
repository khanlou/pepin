var Unit = require('../domain/unit');
var IngredientLine = require('../domain/ingredient_line');
var assert = require('assert');

describe("amount", function() {
  it("amounts should be constructed", function() {
    var amount = new IngredientLine(1, Unit.unitFromName('cup'), 'flour');
    
    assert.equal(amount.quantity, 1);
    assert.equal(amount.unit.name, 'cup');
    assert.equal(amount.ingredient.name, 'flour');
  });
  
  it("amounts should parse 'a'", function() {
    var amount = new IngredientLine('a', Unit.unitFromName('cup'), 'flour');
    
    assert.equal(amount.quantity, 1);
    assert.equal(amount.unit.name, 'cup');
    assert.equal(amount.ingredient.name, 'flour');
  });

  it("amounts should parse 'an'", function() {
    var amount = new IngredientLine('an', Unit.unitFromName('ounce'), 'flour');
    
    assert.equal(amount.quantity, 1);
    assert.equal(amount.unit.name, 'ounce');
    assert.equal(amount.ingredient.name, 'flour');
  });
  
  it("amounts should parse fractions", function() {
    var amount = new IngredientLine('3/4', Unit.unitFromName('cup'), 'flour');
    
    assert.equal(amount.quantity, 0.75);
    assert.equal(amount.unit.name, 'cup');
    assert.equal(amount.ingredient.name, 'flour');
  });
  
  it("amounts should parse decimals", function() {
    var amount = new IngredientLine('0.25', Unit.unitFromName('cup'), 'flour');
    
    assert.equal(amount.quantity, 0.25);
    assert.equal(amount.unit.name, 'cup');
    assert.equal(amount.ingredient.name, 'flour');
  });
  
  it("should scale amounts", function() {
    var amount = new IngredientLine(1, Unit.unitFromName('cup'), 'flour');
    var scaled = amount.amountByScaling(3)
    
    assert.equal(scaled.quantity, 3)
    assert.equal(scaled.unit.name, 'cup')
    assert.equal(scaled.ingredient.name, 'flour')
  });
  
  
});
