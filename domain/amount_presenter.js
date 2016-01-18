var Amount = require('./amount');
var UnitReducer = require('./unit_reducer');

var AmountPresenter = function(unreducedAmount) {
  this.amount = new UnitReducer(unreducedAmount).reducedAmount;  
  
  this.quantity = this.amount.quantity;
  this.unit = this.amount.unit
  
  this.amounts = function() {
    if (this.unit.isWhole) {
      return [this.amount];
    }

    var division = this.quantity / this.unit.smallestMeasure;
    if (Number.isInteger(division)) {
      return [this.amount];
    }
    var floor = Math.floor(division);
    var remainder = this.quantity - floor * this.unit.smallestMeasure
    var amounts = [new Amount(floor * this.unit.smallestMeasure, this.unit)];
    return amounts.concat(new AmountPresenter(new Amount(remainder, this.unit)).amounts)
  }.bind(this)()
};

module.exports = AmountPresenter;