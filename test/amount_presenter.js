var AmountPresenter = require('../domain/amount_presenter');
var Amount = require('../domain/amount');
var UnitReducer = require('../domain/unit_reducer');
var Unit = require('../domain/unit');
var assert = require('assert');

describe("amount presenter", function() {

  it("should present basic amounts", function() {
    var amount = new Amount(1, Unit.unitFromName('cup'));
    var amountPresenter = new AmountPresenter(amount);
    var amounts = amountPresenter.amounts;
    assert.equal(amounts.length, 1);
    var firstAmount = amounts[0];
    assert.equal(firstAmount.quantity, 1);
    assert.equal(firstAmount.unit.name, 'cup');
  });

  it("should present amounts with two components with cups", function() {
    var amount = new Amount(6, Unit.unitFromName('tablespoons'));

    var amountPresenter = new AmountPresenter(amount);
    var amounts = amountPresenter.amounts;
    assert.equal(amounts.length, 2);
    
    var firstAmount = amounts[0];
    assert.equal(firstAmount.quantity, 0.25);
    assert.equal(firstAmount.unit.name, 'cup');
    
    var secondAmount = amounts[1];
    assert.equal(secondAmount.quantity, 2);
    assert.equal(secondAmount.unit.name, 'tablespoon');
  });
  
  it("should present amounts with two components with teaspoons", function() {
    var amount = new Amount(5, Unit.unitFromName('teaspoons'));
    var amountPresenter = new AmountPresenter(amount);
    var amounts = amountPresenter.amounts;
    
    assert.equal(amounts.length, 2);
    
    var firstAmount = amounts[0];
    assert.equal(firstAmount.quantity, 1);
    assert.equal(firstAmount.unit.name, 'tablespoon');
    
    var secondAmount = amounts[1];
    assert.equal(secondAmount.quantity, 2);
    assert.equal(secondAmount.unit.name, 'teaspoon');
  });

});

// test whole amounts