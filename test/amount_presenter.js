var AmountPresenter = require('../assets/js/domain/amount_presenter');
var Amount = require('../assets/js/domain/amount');
var UnitReducer = require('../assets/js/domain/unit_reducer');
var Unit = require('../assets/js/domain/unit');
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
    
    assert.equal(amountPresenter.amountForDisplay, "¼ cup + 2 tablespoons");
    
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
    
    assert.equal(amountPresenter.amountForDisplay, "1 tablespoon + 2 teaspoons");
    
  });
  
  it("should present amounts with two components with crazy cup size", function() {
    var amount = new Amount(13, Unit.unitFromName('teaspoons'));
    var amountPresenter = new AmountPresenter(amount);
    var amounts = amountPresenter.amounts;
    
    assert.equal(amounts.length, 2);
    
    var firstAmount = amounts[0];
    assert.equal(firstAmount.quantity, 0.25);
    assert.equal(firstAmount.unit.name, 'cup');
    
    var secondAmount = amounts[1];
    assert.equal(secondAmount.quantity, 1);
    assert.equal(secondAmount.unit.name, 'teaspoon');
        
    assert.equal(amountPresenter.amountForDisplay, "¼ cup + 1 teaspoon");
    
  });
    
  
  it("should present whole amounts", function() {
    var amount = new Amount(2, null);
    var amountPresenter = new AmountPresenter(amount);
    var amounts = amountPresenter.amounts;
    
    assert.equal(amounts.length, 1);
    
    var firstAmount = amounts[0];
    assert.equal(firstAmount.quantity, 2);
    assert.equal(firstAmount.unit.name, '');
    
    assert.equal(amountPresenter.amountForDisplay, "2");
  });
  
  it("should work when scaling stuff down 1", function() {
    var amount = new Amount(1/5, Unit.unitFromName('teaspoon'));
    var amountPresenter = new AmountPresenter(amount);
    var amounts = amountPresenter.amounts;
    assert.equal(amounts.length, 1);
    
  }); 
  it("should work when scaling stuff down 2", function() {
    var amount = new Amount(2/5, Unit.unitFromName('cup'));
    var amountPresenter = new AmountPresenter(amount);
    var amounts = amountPresenter.amounts;
    assert.equal(amounts.length, 3);
    
  }); 
  it("should work when scaling stuff down 3", function() {
    var amount = new Amount(0.25/5, Unit.unitFromName('cup'));
    var amountPresenter = new AmountPresenter(amount);
    var amounts = amountPresenter.amounts;
    assert.equal(amounts.length, 1);
    
  }); 
  it("should work when scaling stuff down 4", function() {
    var amount = new Amount(0.75/5, Unit.unitFromName('cup'));
    var amountPresenter = new AmountPresenter(amount);
    var amounts = amountPresenter.amounts;
    assert.equal(amounts.length,  2);
    
  }); 

});