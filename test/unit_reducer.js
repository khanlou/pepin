var UnitReducer = require('../domain/unit_reducer');
var Amount = require('../domain/amount');
var Unit = require('../domain/unit');
var assert = require('assert');

describe("unit reducer", function() {
  
  it("should reduce units", function() {
    var amount = new Amount(3, Unit.unitFromName('teaspoons'));
    var unitReducer = new UnitReducer(amount);
    var reducedAmount = unitReducer.reducedAmount;
    assert.equal(reducedAmount.quantity, 1);
    assert.equal(reducedAmount.unit.name, 'tablespoon');
  });
  
  it("shouldn't reduce irreducable units", function() {
    var amount = new Amount(3, Unit.unitFromName('cups'));
    var unitReducer = new UnitReducer(amount);
    var reducedAmount = unitReducer.reducedAmount;
    assert.equal(reducedAmount.quantity, 3);
    assert.equal(reducedAmount.unit.name, 'cup');
  });
  
  it("shouldn't reduce whole units", function() {
    var amount = new Amount(3, null);
    var unitReducer = new UnitReducer(amount);
    var reducedAmount = unitReducer.reducedAmount;
    assert.equal(reducedAmount.quantity, 3);
    assert.equal(reducedAmount.unit.name, '');
  });
  
  it("should scale down as well as up", function() {
    var amount = new Amount(0.125, Unit.unitFromName('cups'));
    var unitReducer = new UnitReducer(amount);
    var reducedAmount = unitReducer.reducedAmount;
    assert.equal(reducedAmount.quantity, 2);
    assert.equal(reducedAmount.unit.name, 'tablespoon');
  });
  

});
