var IngredientParser = require('./domain/parser');
var Scrubbing2 = require('./scrubbing')

var IngredientBinder = function(lineItemNode) {
  this.lineItemNode = lineItemNode;
  this.textNode = lineItemNode.firstChild
  this.parser = new IngredientParser(this.textNode.textContent);

  this.scale = function(scalingFactor) {
    this.textNode.textContent = this.parser.scale(scalingFactor);
  }.bind(this);
};

var ingredientsElement = document.getElementById('ingredients');
var ingredientLineItems = ingredients.children[1].children;

var ingredientBinders = [];
for (var i = 0; i < ingredientLineItems.length; i++) {
  var ingredientLineItem = ingredientLineItems[i];
  ingredientBinders.push(new IngredientBinder(ingredientLineItem));
}

var scaleAllIngredientBinders = function(scalingFactor) {
  ingredientBinders.forEach(function(ingredientBinder) {
    ingredientBinder.scale(scalingFactor);
  });
};

scaleAllIngredientBinders(1)

var scalingAdapter = {
  init: function(element) {
    element.node.dataset.value = 1
  },
  start: function(element) {
    return parseInt(element.node.dataset.value, 10);
  },
  change: function(element, value) {
    element.node.textContent = value;
    scaleAllIngredientBinders(value);
  },
  end: function() {}
};

new Scrubbing(document.querySelector('#scaler'), {
  resolver: Scrubbing.resolver.HorizontalProvider(20),
  adapter: scalingAdapter
});
