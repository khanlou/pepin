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

module.exports = QuantityParser;