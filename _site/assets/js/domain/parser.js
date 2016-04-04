var Pattern = require('./pattern');
var IngredientLinePresenter = require('./ingredient_line_presenter');

var IngredientParser = function(text) {
  this.text = text;

  this.matchingPattern = Pattern.allPatterns.find(function(pattern) {
    return pattern.matches(text);
  })

  if (this.matchingPattern) {
    this.ingredientLine = this.matchingPattern.parse(this.text);
    this.scale = function(scalingFactor) {
      var scaledIngredientLine = this.ingredientLine.ingredientLineByScaling(scalingFactor);
      console.log(scaledIngredientLine)
      return new IngredientLinePresenter(this.matchingPattern, scaledIngredientLine).stringForDisplay;
    }.bind(this);
  } else {
    this.scale = function() {
      return this.text;
    }.bind(this)
  }
};

module.exports = IngredientParser;