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
  

});
