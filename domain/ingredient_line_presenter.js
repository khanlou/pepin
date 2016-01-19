var UnitReducer = require('./unit_reducer');
var AmountPresenter = require('./amount_presenter');

var Inflector = require('./inflector');
var inflector = new Inflector();

var IngredientLinePresenter = function(pattern, ingredientLine) {
  this.pattern = pattern;
  this.ingredientLine = ingredientLine;
  this.amountPresenter = new AmountPresenter(this.ingredientLine.amount);
  
  this.stringForDisplay = this.pattern.inject({
    "{quantity} {unit}": this.amountPresenter.amountForDisplay,
    "{quantity}": this.amountPresenter.amountForDisplay,
    "{ingredient}": this.ingredientLine.ingredient.name,
  });
};

module.exports = IngredientLinePresenter;
