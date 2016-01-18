var UnitReducer = require('./unit_reducer');
var QuantityPresenter = require('./quantity_presenter');

var Inflector = require('./inflector');
var inflector = new Inflector();

var AmountPresenter = function(pattern, ingredientLine) {
  this.pattern = pattern;
  this.ingredientLine = ingredientLine;
  this.unitReducer = new UnitReducer(this.ingredientLine.amount);
  this.reducedAmount = this.unitReducer.reducedAmount;
  
  this.stringForDisplay = this.pattern.inject(
    new QuantityPresenter(this.reducedAmount.quantity).quantityForDisplay,
    inflector.pluralizeWithCount(this.reducedAmount.unit.name, this.reducedAmount.quantity),
    this.ingredientLine.ingredient.name
  );
};

module.exports = AmountPresenter;