var Pattern = require('./pattern');
var IngredientLinePresenter = require('./ingredient_line_presenter');

var IngredientParser = function(text) {
  this.text = text;

  this.matchingPattern = Pattern.allPatterns.find(function(pattern) {
    return pattern.matches(text);
  });

  this.ingredientLine = this.matchingPattern.parse(this.text);

  this.scale = function(scalingFactor) {
    return new IngredientLinePresenter(this.matchingPattern, this.ingredientLine.ingredientLineByScaling(scalingFactor)).stringForDisplay;
  }.bind(this);

};

module.exports = IngredientParser;