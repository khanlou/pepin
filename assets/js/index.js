var IngredientBinder = require('./ingredient_binder');
var ServingBinder = require('./serving_binder');
var QuantityPresenter = require('./domain/quantity_presenter');
var Scrubbing = require('./scrubbing');

var ingredientLineItems = document.getElementById('ingredients').children;


var scalableBinders = [];
for (var i = 0; i < ingredientLineItems.length; i++) {
  var ingredientLineItem = ingredientLineItems[i];
  scalableBinders.push(new IngredientBinder(ingredientLineItem));
}
scalableBinders.push(new ServingBinder(document.getElementById('serving-amount')));

var scaleAllBinders = function(scalingFactor) {
  scalableBinders.forEach(function(binder) {
    binder.scale(scalingFactor);
  });
};

scaleAllBinders(1)

var scalingAdapter = {
  _normalize: function(value) {
    value = value.clamp(-4, 10)
    if (value <= 0) {
      value = value - 2;
      value = Math.abs(value);
      value = 1/value;
    }
    return value;
  },
  init: function(element) {
    element.node.dataset.value = 1
  },
  start: function(element) {
    return parseInt(element.node.dataset.value, 10);
  },
  change: function(element, value) {
    var normalizedValue = this._normalize(value)
    element.node.innerHTML = new QuantityPresenter(normalizedValue).quantityForDisplay;
    scaleAllBinders(normalizedValue);
  },
  end: function() { }
};

new Scrubbing(document.querySelector('#scaler'), {
  resolver: Scrubbing.resolver.HorizontalProvider(20),
  adapter: scalingAdapter,
});
