var IngredientLine = function(quantity, unit, ingredientName) {

  this.parseQuantity = function(quantityAsString) {
    if (quantityAsString === "a" || quantityAsString === "an") {
      return 1;
    }
    if (quantityAsString.includes('/')) {
      var numeratorAndDenominator = quantityAsString.split('/').map(function(part) {
        return parseInt(part);
      });
      return numeratorAndDenominator[0] / numeratorAndDenominator[1];
    }
    return parseFloat(quantityAsString)
  }
  
  if (typeof quantity === 'string') {
    this.quantityAsString = quantity;
    this.quantity = this.parseQuantity(this.quantityAsString);
  } else {
    this.quantity = quantity;
  }

  this.unit = unit;
  this.ingredient = { name: ingredientName };


  this.amountByScaling = function(scalingFactor) {
    return new IngredientLine(this.quantity * scalingFactor, this.unit, this.ingredient.name);
  }.bind(this);
  
  this.isValid = (this.quantity >= this.unit.smallestMeasure);
};

module.exports = IngredientLine;