var UnitReducer = require('./unit_reducer');
var QuantityPresenter = require('./quantity_presenter');

var Inflector = require('./inflector');
var inflector = new Inflector();

var IngredientLinePresenter = function(pattern, ingredientLine) {
  this.pattern = pattern;
  this.ingredientLine = ingredientLine;
  this.unitReducer = new UnitReducer(this.ingredientLine.amount);
  this.reducedAmount = this.unitReducer.reducedAmount;

  this.stringForDisplay = this.pattern.inject({
    "{quantity}": new QuantityPresenter(this.reducedAmount.quantity).quantityForDisplay,
    "{unit}": inflector.pluralizeWithCount(this.reducedAmount.unit.name, this.reducedAmount.quantity),
    "{ingredient}": this.ingredientLine.ingredient.name,
  });
};

module.exports = IngredientLinePresenter;
