
var IngredientParser = function(text) {
  this.text = text;

  this.patterns = [
    new Pattern("{ingredient} to taste"),
    new Pattern("{ingredient} as desired"),
    new Pattern("{quantity} {unit} of {ingredient}"), // 2 sticks of butter, 2-3 tablespoons of sugar
    new Pattern("{quantity} {unit} {ingredient}"), //1 cup flour
    new Pattern("{quantity} {ingredient}"), //an egg, 
  ];

  this.matchingPattern = this.patterns
    .find(function(pattern) {
      return pattern.matches(text);
    });

  this.amount = this.matchingPattern.parse(this.text);

  this.scale = function(scalingFactor) {
    return new AmountPresenter(this.matchingPattern, this.amount.amountByScaling(scalingFactor)).stringForDisplay;
  }.bind(this);

};
