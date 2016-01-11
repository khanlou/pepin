var IngredientBinder = function(lineItemNode) {
  this.lineItemNode = lineItemNode;
  this.parser = new IngredientParser(lineItemNode.firstChild.textContent);
};

var ingredientsElement = document.getElementById('ingredients');

var ingredientLineItems = ingredients.children[0].children;

var ingredientParsers = [];
for (var i = 0; i < ingredientLineItems.length; i++) {
  var ingredientLineItem = ingredientLineItems[i];
  ingredientParsers.push(new IngredientBinder(ingredientLineItem));
}


var tangle = new Tangle(document.getElementById('scaler'), {
  initialize: function() { this.scalingFactor = 1; },
  update: function() { console.log(this.scalingFactor); },
});
