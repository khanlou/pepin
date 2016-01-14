var Ingredient = function(properties) {
  this.name = properties.name;
  
  if (properties.subtypes) {
    this.subtypes = properties.subtypes;
  } else {
    if (properties.density) {
      this.subtypes = [new Subtype('', properties.density)];
    }
  }

  this.preparations = properties.preparation;
  this.alternateNames = properties.alternateNames || [];
  this.dry = properties.dry;
};

var Subtype = function(properties) {
  this.name = properties.name;
  this.density = properties.density; //grams per teaspoon
}

var allIngredients = [
  new Ingredient({name: 'flour', density: 2.1, dry: true }),
  new Ingredient({name: 'flour', subtype: 'all-purpose', density: 2.1, dry: true }),
  new Ingredient({name: 'flour', subtype: 'self-r(a?)ising', density: 2.3, dry: true }),
  new Ingredient({name: 'flour', subtype: 'cake', density: 1.9, dry: true }),
  new Ingredient({name: 'flour', subtype: 'bread', density: 2.1, dry: true }),
  new Ingredient({name: 'flour', subtype: 'whole[- ]wheat', density: 2.1, dry: true }),
];

flour, U.S. all-purpose    2.1
flour, buckwheat           3.6
flour, legume              2.8
flour, potato              3.6
flour, rice                3.2
flour, rye                 1.9
flour, semolina            3.7
flour, wheat bread         2.1
flour, whole wheat         2.8


// ingredient patterns
// 3 cups of onions (chopped)
// 3 cups of chopped onions
// 3 cups of onions, chopped
// 3 cups of onions