var ServingBinder = function(scalingNode) {
  this.scalingNode = scalingNode;
  this.textNode = this.scalingNode.firstChild
  this.value = parseInt(this.textNode.textContent)

  this.scale = function(scalingFactor) {
    this.textNode.textContent = '' + this.value * scalingFactor
  }.bind(this);
};

module.exports = ServingBinder;