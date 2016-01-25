var IngredientParser = require('./domain/parser');

var IngredientBinder = function(lineItemNode) {
  this.lineItemNode = lineItemNode;
  this.textNode = lineItemNode.firstChild;
  this.parser = new IngredientParser(this.textNode.textContent);

  this.scale = function(scalingFactor) {
    this.lineItemNode.innerHTML = this.parser.scale(scalingFactor);
  }.bind(this);
};

module.exports = IngredientBinder;