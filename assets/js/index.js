var IngredientBinder = require('./ingredient_binder');
var Scrubbing = require('./scrubbing');

var ingredientLineItems = document.getElementById('ingredients').children;


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
  end: function() { }
};

new Scrubbing(document.querySelector('#scaler'), {
  resolver: Scrubbing.resolver.HorizontalProvider(20),
  adapter: scalingAdapter
});
