var WholeUnit = require('./whole_unit');

var QuantityParser = function(quantityAsString) {
  if (quantityAsString === "a" || quantityAsString === "an") {
    this.quantity = 1;
  } else if (quantityAsString.includes('/') && /\s+/.test(quantityAsString)) {
    var components = quantityAsString.split(/\s+/)
    this.quantity = components
      .map(function(component) {
        return new QuantityParser(component).quantity;
      })
      .reduce(function(sum, current) {
        return sum + current
      }, 0);
  } else if (quantityAsString.includes('/')) {
    var numeratorAndDenominator = quantityAsString.split('/').map(function(part) {
      return parseInt(part);
    });
    this.quantity = numeratorAndDenominator[0] / numeratorAndDenominator[1];
  } else {
    this.quantity = parseFloat(quantityAsString)
  }
};

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
