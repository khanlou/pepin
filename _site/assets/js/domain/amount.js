var WholeUnit = require('./whole_unit');
var QuantityParser = require('./quantity_parser');

var Amount = function(quantity, unit) {

  this.parseQuantity = function(quantityAsString) {}.bind(this);

  if (typeof quantity === 'string') {
    this.quantityAsString = quantity;
    this.quantity = new QuantityParser(this.quantityAsString).quantity;
  } else {
    this.quantity = quantity;
  }

  this.unit = unit || new WholeUnit();

  this.amountByScaling = function(scalingFactor) {
    return new Amount(this.quantity * scalingFactor, this.unit);
  }.bind(this);

  this.isValid = this.unit.isValidQuantity(this.quantity);

  this.toString = function() {
    return '' + this.quantity + ' ' + this.unit.name;
  }
};

module.exports = Amount;
