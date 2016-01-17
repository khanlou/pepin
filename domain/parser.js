var Pattern = require('./pattern');
var AmountPresenter = require('./presenters').AmountPresenter;

var IngredientParser = function(text) {
  this.text = text;

  this.matchingPattern = Pattern.allPatterns.find(function(pattern) {
    return pattern.matches(text);
  });

  this.ingredientLine = this.matchingPattern.parse(this.text);

  this.scale = function(scalingFactor) {
    return new AmountPresenter(this.matchingPattern, this.ingredientLine.ingredientLineByScaling(scalingFactor)).stringForDisplay;
  }.bind(this);

};

module.exports = IngredientParser;