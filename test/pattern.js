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
    var amount = pattern.parse("1 cup of flour");
    
    assert.equal(amount.quantity, 1);
    assert.equal(amount.unit.name, 'cup');
    assert.equal(amount.ingredientName, 'flour');
  });
  
  it("should inject", function() {
    var injected = pattern.inject("bingo", "bango", "bongo")
    
    assert.equal(injected, "bingo bango of bongo");
  });
  

});
