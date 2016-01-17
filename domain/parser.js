var Pattern = require('./pattern');
var AmountPresenter = require('./presenters').AmountPresenter;

var IngredientParser = function(text) {
  this.text = text;

  this.matchingPattern = Pattern.allPatterns.find(function(pattern) {
    return pattern.matches(text);
  });

  this.amount = this.matchingPattern.parse(this.text);

  this.scale = function(scalingFactor) {
    return new AmountPresenter(this.matchingPattern, this.amount.amountByScaling(scalingFactor)).stringForDisplay;
  }.bind(this);

};

module.exports = IngredientParser;