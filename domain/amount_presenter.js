var Amount = require('./amount');
var UnitReducer = require('./unit_reducer');

var AmountPresenter = function(unreducedAmount) {
  this.amount = new UnitReducer(unreducedAmount).reducedAmount;

  this.quantity = this.amount.quantity;
  this.unit = this.amount.unit;

  this.amounts = function() {
    if (this.unit.isWhole) {
      return [this.amount];
    }

    var mutipleOfSmallestAcceptableUnit = this.quantity / this.unit.smallestMeasure;
    if (Number.isInteger(mutipleOfSmallestAcceptableUnit)) {
      return [this.amount];
    }

    var integerMutipleOfSmallestAcceptableUnit = Math.floor(mutipleOfSmallestAcceptableUnit);
    var acceptableQuantityInCurrentUnit = integerMutipleOfSmallestAcceptableUnit * this.unit.smallestMeasure;
    var remainderForUseInSmallerUnit = this.quantity - acceptableQuantityInCurrentUnit
    var amountRemaining = new Amount(remainderForUseInSmallerUnit, this.unit)

    return [new Amount(acceptableQuantityInCurrentUnit, this.unit)]
      .concat(new AmountPresenter(amountRemaining).amounts)
  }.bind(this)()
};

module.exports = AmountPresenter;
