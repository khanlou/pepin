var Amount = require('./amount');

var IngredientLine = function(amount, ingredient) {
  this.amount = amount;
  
  if (typeof ingredient === 'string') {
    this.ingredient = { name: ingredient };
  } else {
    this.ingredient = ingredient;
  }
  
  this.ingredientLineByScaling = function(scalingFactor) {
    return new IngredientLine(this.amount.amountByScaling(scalingFactor), this.ingredient);
  }.bind(this);
};

module.exports = IngredientLine;