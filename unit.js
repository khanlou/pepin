var pluralizer = new Inflector();

var Imperial = 'imperial';
var Metric = 'metric';
var Both = 'both';
var Wet = 'wet';
var Dry = 'dry';

var Unit = function(data) {
  this.name = data.name;
  this.alternateNames = data.alternateNames || [];
  this.plural = data.plural || pluralizer.plural(this.name)
  this.system = data.system;
  this.measure = data.measure;
  this.smallestMeasure = data.smallestMeasure;

  this.allPossibleNames = [this.name, this.plural].concat(this.alternateNames);

  this.canBeCalled = function(name) {
    return this.allPossibleNames.indexOf(name) !== -1
  }.bind(this);
};

var allUnits = [
  //volume
  new Unit({
    name: 'tablespoon',
    alternateNames: ['T', 'Tbs', 'tbs'],
    system: Both,
    measure: Both,
  }),
  new Unit({
    name: 'teaspoon',
    alternateNames: ['t', 'Tsp', 'tsp'],
    system: Both,
    measure: Both,
    smallestMeasure: 1.0 / 8,
  }),
  new Unit({
    name: 'cup',
    alternateNames: ['C', 'c'],
    system: Both,
    measure: Both,
    smallestMeasure: 1.0 / 4
  }),
  new Unit({
    name: 'pint',
    alternateNames: ['pt', 'PT', 'Pt'],
    system: Imperial,
    measure: Wet,
  }),
  new Unit({
    name: 'quart',
    alternateNames: ['QT', 'Qt', 'qt'],
    system: Imperial,
    measure: Wet,
  }),
  new Unit({
    name: 'gallon',
    alternateNames: ['Gal', 'GAL', 'gal'],
    system: Imperial,
    measure: Wet,
  }),
  new Unit({
    name: 'liter',
    alternateNames: ['L', 'l'],
    system: Metric,
    measure: Wet,
  }),
  new Unit({
    name: 'pinch',
    alternateNames: ['little'],
    system: Metric,
    measure: Dry,
  }),
  new Unit({
    name: 'dash',
    system: Both,
    measure: Both,
  }),
  new Unit({
    name: 'fluid ounce',
    alternateNames: ['fl oz'],
    system: Both,
    measure: Wet,
  }),
  //weight
  new Unit({
    name: 'ounce',
    alternateNames: ['oz', 'Oz', 'OZ'],
    system: Both,
    measure: Dry,
  }),
  new Unit({
    name: 'pound',
    alternateNames: ['lb', 'Lb', 'LB'],
    smallestMeasure: 1.0/8,
  }),
  new Unit({
    name: 'gram',
    alternateNames: ['g'],
    system: Metric,
    measure: Both,
  }),
  new Unit({
    name: 'kilogram',
    alternateNames: ['g'],
    system: Metric,
    measure: Both,
  }),
  //length
  new Unit({
    name: 'milliliter',
    alternateNames: ['ml'],
    system: Metric,
  }),
  new Unit({
    name: 'inch',
    alternateNames: ['"', 'in', 'In', 'IN'],
    smallestMeasure: 1.0/8,
    system: Imperial,
  }),
  new Unit({
    name: 'millimeter',
    alternateNames: ['mm'],
    system: Metric,
  }),
  new Unit({
    name: 'centimeter',
    alternateNames: ['cm'],
    system: Metric,
  }),
  //whole units
  new Unit({
    name: 'whole',
  }),
  new Unit({
    name: 'half',
  }),
  //containers
  new Unit({
    name: 'can',
  }),
  new Unit({
    name: 'bottle',
  }),
  new Unit({
    name: 'package',
    alternateNames: ['pkg', 'Pkg', 'PKG'],
  }),
  new Unit({
    name: 'stick',
  }),
  new Unit({
    name: 'pat',
  }),
  new Unit({
    name: 'knob',
  }),
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
