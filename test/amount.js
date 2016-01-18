var Unit = require('../domain/unit');
var Amount = require('../domain/amount');
var assert = require('assert');

describe("ingredient line", function() {

  it("amount should be constructed", function() {
    var amount = new Amount(1, Unit.unitFromName('cup'));

    assert.equal(amount.quantity, 1);
    assert.equal(amount.unit.name, 'cup');
  });
  
  
  it("should scale amounts", function() {
    var amount = new Amount(1, Unit.unitFromName('cup'))
    var scaled = amount.amountByScaling(3);
    
    assert.equal(scaled.quantity, 3);
    assert.equal(scaled.unit.name, 'cup');
  });
  
  
  it("whole units should scale", function() {
    var amount = new Amount('2', undefined);
    var scaled = amount.amountByScaling(3);
    assert.equal(scaled.quantity, 6);
    assert.equal(scaled.unit.name, '');
  });

  it("amounts should parse 'a'", function() {
    var amount = new Amount('a', Unit.unitFromName('cup'));

    assert.equal(amount.quantity, 1);
    assert.equal(amount.unit.name, 'cup');
  });

  it("amounts should parse 'an'", function() {
    var amount = new Amount('an', Unit.unitFromName('ounce'));

    assert.equal(amount.quantity, 1);
    assert.equal(amount.unit.name, 'ounce');
  });

  it("amounts should parse fractions", function() {
    var amount = new Amount('3/4', Unit.unitFromName('cup'));

    assert.equal(amount.quantity, 0.75);
    assert.equal(amount.unit.name, 'cup');
  });

  it("amounts should parse decimals", function() {
    var amount = new Amount('0.25', Unit.unitFromName('cup'));

    assert.equal(amount.quantity, 0.25);
    assert.equal(amount.unit.name, 'cup');
  });
});
