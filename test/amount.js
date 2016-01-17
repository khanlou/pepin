var IngredientParser = require('../domain/parser');
var assert = require('assert');

describe("parser", function() {
  it("should parse simple ingredient lines", function() {
    var parser = new IngredientParser("1 cup flour");
    var amount = parser.amount;
    assert.equal(amount.quantity, 1)
    assert.equal(amount.unit.name, 'cup')
    assert.equal(amount.ingredientName, 'flour')
  });

  it("should parse ingredient lines with 'of'", function() {
    var parser = new IngredientParser("1 cup of flour");
    var amount = parser.amount;
    assert.equal(amount.quantity, 1)
    assert.equal(amount.unit.name, 'cup')
    assert.equal(amount.ingredientName, 'flour')
  });
  
});

//test plurals
//test reducing
//test scaling
//test different patterns
