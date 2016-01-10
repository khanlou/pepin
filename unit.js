var pluralizer = new Inflector();

var Unit = function(name, alternateNames) {
  this.name = name;
  this.alternateNames = alternateNames;
  
  this.allPossibleNames = [this.name, pluralizer.plural(this.name)].concat(alternateNames);
  
  this.canBeCalled = function(name) {
    return this.allPossibleNames.indexOf(name) !== -1
  }.bind(this);
};

var allUnits = [
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


Unit.unitFromName = function(name) {
  return allUnits.find(function(unit) {
      return unit.canBeCalled(name)
  });
};

Unit.allUnitNames = function() {
  return allUnits.reduce(function(allUnitNames, unit) {
    return allUnitNames.concat(unit.allPossibleNames);
  }, []);
};
