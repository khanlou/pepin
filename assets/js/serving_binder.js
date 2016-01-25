var QuantityPresenter = require('./domain/quantity_presenter');

var ServingBinder = function(scalingNode) {
  this.scalingNode = scalingNode;
  this.textNode = this.scalingNode.firstChild
  this.value = parseInt(this.textNode.textContent)

  this.scale = function(scalingFactor) {
    this.scalingNode.innerHTML = '' + new QuantityPresenter(this.value * scalingFactor).quantityForDisplay;
  }.bind(this);
};

module.exports = ServingBinder;