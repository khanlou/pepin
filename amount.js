var Amount = function(quantity, unit, ingredientName) {
  if (typeof quantity === 'string') {
    this.quantityAsString = quantity;
    this.quantity = function() {
      if (this.quantityAsString === "a" || this.quantityAsString === "an") {
        return 1;
      }
      if (this.quantityAsString.includes('/')) {
        var numeratorAndDenominator = this.quantityAsString.split('/').map(function(part) { return parseInt(part); });
        return numeratorAndDenominator[0] / numeratorAndDenominator[1];
      }
      return parseFloat(this.quantityAsString)
    }.bind(this)()
  } else {
    this.quantity = quantity;
  }

  this.unit = unit;
  this.ingredientName = ingredientName;
  
  this.amountByScaling = function(scalingFactor) {
    return new Amount(this.quantity * scalingFactor, this.unit, this.ingredientName);
  }.bind(this);
};
