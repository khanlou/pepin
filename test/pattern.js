var Pattern = require('../domain/pattern');
var assert = require('assert');

describe("pattern", function() {
  var pattern = new Pattern("{quantity} {unit} of {ingredient}")
  
  it("should match patterns correctly", function() {
    var matches = pattern.matches("1 cup of flour");
    assert(matches);
  });
  
  it("shouldn't match other patterns", function() {
    var matches = pattern.matches("1 cup flour");
    assert(!matches);
  });
  
  it("should parse", function() {
    var ingredientLine = pattern.parse("1 cup of flour");
    
    assert.equal(ingredientLine.amount.quantity, 1);
    assert.equal(ingredientLine.amount.unit.name, 'cup');
    assert.equal(ingredientLine.ingredient.name, 'flour');
  });
  
  it("should parse mixed fractions", function() {
    var ingredientLine = pattern.parse("1 3/4 cup of flour");
    
    assert.equal(ingredientLine.amount.quantity, 1.75);
    assert.equal(ingredientLine.amount.unit.name, 'cup');
    assert.equal(ingredientLine.ingredient.name, 'flour');
  });
  
  
  it("should inject", function() {
    var injected = pattern.inject({
      "{quantity}": "bingo",
      "{unit}": "bango",
      "{ingredient}": "bongo",
    });
    
    assert.equal(injected, "bingo bango of bongo");
  });
  

});
