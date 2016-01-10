var pluralizer = new Inflector();

var Amount = function(quantity, unit, ingredientName) {
  this.quantity = quantity;
  this.unit = unit;
  this.ingredientName = ingredientName;
};

var Unit = function(name, alternateNames) {
  this.name = name;
  this.alternateNames = alternateNames;
  
  this.allPossibleNames = [name, pluralizer.plural(name)].concat(alternateNames);
  console.log(this.allPossibleNames)
}

Unit.unitFromName = function(name) {
  var units = [
    //fluid
    new Unit('tablespoon', ['T', 'Tbs', 'tbs']),
    new Unit('teaspoon', ['t', 'Tsp', 'tsp']),
    new Unit('cup', ['C', 'c']),
    new Unit('pint', ['pt', 'PT', 'Pt']),
    new Unit('quart', ['QT', 'Qt', 'qt']),
    new Unit('gallon', ['Gal', 'GAL', 'gal']),
    new Unit('liter', ['L', 'l']),
    //extra
    new Unit('pinch', []),
    new Unit('little', []),
    new Unit('dash', []),
    //weight
    new Unit('ounce', ['oz', 'Oz', 'OZ']),
    new Unit('pound', ['lb', 'Lb', 'LB']),
    new Unit('gram', ['g']),
    //length
    new Unit('milliliter', ['ml']),
    new Unit('inch', ['"', 'in', 'In', 'IN']),
    new Unit('millimeter', ['mm']),
    new Unit('centimeter', ['cm']),
    //whole units
    new Unit('whole', []),
    new Unit('half', []),
    //containers
    new Unit('can', []),
    new Unit('bottle', []),
    new Unit('large', ['lg', 'LG', 'Lg']),
    new Unit('package', ['pkg', 'Pkg', 'PKG']),
    new Unit('stick', []),
  ];
  for (var i = 0; i < units.length; i++) {
    var unit = units[i];
    if (unit.name === name || unit.alternateNames.indexOf(name) !== -1) {
      return unit
    }
  }
  return null
};



var IngredientParser = function(text) {
  this.text = text;

  this.parts = this.text.split(/\s+/);

  this.quantity = this.parts.find(function(element) {
    return element.match(/\d+/)
  });

  this.unit = this.parts.find(function(element) {
    return Unit.unitFromName(element)
  });
  
  console.log(this.quantity, this.unit)

  var ingredientName = function() {
    this.parts
  }.bind(this);
}

var IngredientBinder = function(lineItemNode) {
  this.lineItemNode = lineItemNode;
  this.parser = new IngredientParser(lineItemNode.firstChild.textContent)

};

var ingredientsElement = document.getElementById('ingredients');

var ingredientLineItems = ingredients.children[0].children;

var ingredientParsers = [];
for (var i = 0; i < ingredientLineItems.length; i++) {
  var ingredientLineItem = ingredientLineItems[i]
  ingredientParsers.push(new IngredientBinder(ingredientLineItem))
}
