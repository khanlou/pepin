var Unit = require('../domain/unit');
var Amount = require('../domain/amount');
var assert = require('assert');

describe("amount", function() {
  it("amounts should be constructed", function() {
    var amount = new Amount(1, Unit.unitFromName('cup'), 'flour');
    
    assert.equal(amount.quantity, 1);
    assert.equal(amount.unit.name, 'cup');
    assert.equal(amount.ingredientName, 'flour');
  });
  
  it("amounts should parse 'a'", function() {
    var amount = new Amount('a', Unit.unitFromName('cup'), 'flour');
    
    assert.equal(amount.quantity, 1);
    assert.equal(amount.unit.name, 'cup');
    assert.equal(amount.ingredientName, 'flour');
  });

  it("amounts should parse 'an'", function() {
    var amount = new Amount('an', Unit.unitFromName('ounce'), 'flour');
    
    assert.equal(amount.quantity, 1);
    assert.equal(amount.unit.name, 'ounce');
    assert.equal(amount.ingredientName, 'flour');
  });
  
  it("amounts should parse fractions", function() {
    var amount = new Amount('3/4', Unit.unitFromName('cup'), 'flour');
    
    assert.equal(amount.quantity, 0.75);
    assert.equal(amount.unit.name, 'cup');
    assert.equal(amount.ingredientName, 'flour');
  });
  
  it("amounts should parse decimals", function() {
    var amount = new Amount('0.25', Unit.unitFromName('cup'), 'flour');
    
    assert.equal(amount.quantity, 0.25);
    assert.equal(amount.unit.name, 'cup');
    assert.equal(amount.ingredientName, 'flour');
  });
  
  it("should scale amounts", function() {
    var amount = new Amount(1, Unit.unitFromName('cup'), 'flour');
    var scaled = amount.amountByScaling(3)
    
    assert.equal(scaled.quantity, 3)
    assert.equal(scaled.unit.name, 'cup')
    assert.equal(scaled.ingredientName, 'flour')
  });
  
  
});
