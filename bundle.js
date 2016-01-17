(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Amount = function(quantity, unit, ingredientName) {

  this.parseQuantity = function(quantityAsString) {
    if (quantityAsString === "a" || quantityAsString === "an") {
      return 1;
    }
    if (quantityAsString.includes('/')) {
      var numeratorAndDenominator = quantityAsString.split('/').map(function(part) {
        return parseInt(part);
      });
      return numeratorAndDenominator[0] / numeratorAndDenominator[1];
    }
    return parseFloat(quantityAsString)
  }
  
  if (typeof quantity === 'string') {
    this.quantityAsString = quantity;
    this.quantity = this.parseQuantity(this.quantityAsString);
  } else {
    this.quantity = quantity;
  }

  this.unit = unit;
  this.ingredientName = ingredientName;


  this.amountByScaling = function(scalingFactor) {
    return new Amount(this.quantity * scalingFactor, this.unit, this.ingredientName);
  }.bind(this);
  
  this.isValid = (this.quantity >= this.unit.smallestMeasure);
};

module.exports = Amount;
},{}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],3:[function(require,module,exports){
var Pattern = require('./pattern');
var AmountPresenter = require('./presenters').AmountPresenter;

var IngredientParser = function(text) {
  this.text = text;

  this.matchingPattern = Pattern.allPatterns.find(function(pattern) {
    return pattern.matches(text);
  });

  this.amount = this.matchingPattern.parse(this.text);

  this.scale = function(scalingFactor) {
    return new AmountPresenter(this.matchingPattern, this.amount.amountByScaling(scalingFactor)).stringForDisplay;
  }.bind(this);

};

module.exports = IngredientParser;
},{"./pattern":4,"./presenters":5}],4:[function(require,module,exports){
var Unit = require('./unit');
var Amount = require('./amount');

var allUnitRegex = '(' + Unit.allUnitNames().map(function(unitName) {
  return '\\b' + unitName + '\\b'
}).join('|') + ')';

var Pattern = function(template) {
  this.template = template;

  this.quantityRegexes = [
    '\\ba\\b', //the word a
    '\\ban\\b', //the word an
    '\\d+/\\d+', //any fraction
    '\\d*\\.\\d+', //any decimal
    '\\d+' //any number
    //whole word numbers
    //ranges
  ];

  this.quantityRegex = '(' + this.quantityRegexes.join('|') + ')';
  this.ingredientRegex = '(.+)';
  this.allUnitRegex = allUnitRegex;

  this.preparedTemplate = function() {
    var preparedTemplate = this.template;

    preparedTemplate = preparedTemplate.replace(/\s+/g, '\\s+');
    preparedTemplate = preparedTemplate.replace('{quantity}', this.quantityRegex);
    preparedTemplate = preparedTemplate.replace('{unit}', this.allUnitRegex);
    preparedTemplate = preparedTemplate.replace('{ingredient}', this.ingredientRegex);

    return preparedTemplate;
  }.bind(this)();

  this.regex = new RegExp(this.preparedTemplate);

  this.matches = function(against) {
    return this.regex.test(against);
  }.bind(this);

  this.parse = function(against) {
    var results = this.regex.exec(against);
    results.shift();
    var quantity, unit, ingredientName;
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      if (new RegExp(this.quantityRegex).test(result)) {
        quantity = result;
      } else if (new RegExp(this.allUnitRegex).test(result)) {
        unit = Unit.unitFromName(result);
      } else if (new RegExp(this.ingredientRegex).test(result)) {
        ingredientName = result;
      }
    }
    return new Amount(quantity, unit, ingredientName);
  }.bind(this);

  this.inject = function(quantity, unit, ingredientName) {
    var injected = this.template;
    injected = injected.replace('{quantity}', quantity);
    injected = injected.replace('{unit}', unit);
    injected = injected.replace('{ingredient}', ingredientName);
    return injected;
  }.bind(this);
};


Pattern.allPatterns = [
  new Pattern("{ingredient} to taste"),
  new Pattern("{ingredient} as desired"),
  new Pattern("{quantity} {unit} of {ingredient}"), // 2 sticks of butter, 2-3 tablespoons of sugar
  new Pattern("{quantity} {unit} {ingredient}"), //1 cup flour
  new Pattern("{quantity} {ingredient}"), //an egg, 
  //{quantity} {unit} plus {quantity} {unit} {ingredient} 
];

module.exports = Pattern;
},{"./amount":2,"./unit":6}],5:[function(require,module,exports){
var UnitReducer = require('./unit_reducer');
var pluralizer = new Inflector();

var AmountPresenter = function(pattern, amount) {
  this.pattern = pattern;
  this.amount = amount;
  this.unitReducer = new UnitReducer(this.amount);
  this.reducedAmount = this.unitReducer.reducedAmount;
  
  this.stringForDisplay = this.pattern.inject(
    new QuantityPresenter(this.reducedAmount.quantity).quantityForDisplay,
    pluralizer.pluralizeWithCount(this.reducedAmount.unit.name, this.reducedAmount.quantity),
    this.reducedAmount.ingredientName
  );
};

var QuantityPresenter = function(quantity) {
  this.quantity = quantity;
  
  this.integer = Math.floor(this.quantity);
  this.remainder = quantity - this.integer;
  
  this.fractions = {
    0: "",
    0.25: "\u00BC",
    0.5: "\u00BD",
    0.75: "\u00BE",
    0.142: "\u2150",
    0.111: "\u2151",
    0.1: "\u2152",
    0.333: "\u2153",
    0.667: "\u2154",
    0.2: "\u2155",
    0.4: "\u2156",
    0.6: "\u2157",
    0.8: "\u2158",
    0.167: "\u2159",
    0.833: "\u215A",
    0.125: "\u215B",
    0.375: "\u215C",
    0.625: "\u215D",
    0.875: "\u215E",
  };
  
    
  this.closestFraction = Object.keys(this.fractions).find(function(fraction) {
    return Math.abs(this.remainder - parseFloat(fraction)) < 0.01;
  }.bind(this))
  
  if (this.closestFraction) {
    this.integerAsString = this.integer == 0 ? '' : '' + this.integer
    this.quantityForDisplay = this.integerAsString + this.fractions[this.closestFraction];
  } else {
    this.quantityForDisplay = '' + this.quantity;
  }
};

module.exports.AmountPresenter = AmountPresenter;
module.exports.QuantityPresenter = QuantityPresenter;
},{"./unit_reducer":7}],6:[function(require,module,exports){
var pluralizer = new Inflector();

var Imperial = 'imperial';
var Metric = 'metric';
var Both = 'both';
var Wet = 'wet';
var Dry = 'dry';

var Unit = function(properties) {
  this.name = properties.name;
  this.alternateNames = properties.alternateNames || [];
  this.plural = properties.plural || pluralizer.plural(this.name)
  this.system = properties.system;
  this.measure = properties.measure;
  this.smallestMeasure = properties.smallestMeasure || 1;

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

module.exports = Unit;
},{}],7:[function(require,module,exports){
var Unit = require('./unit');
var Amount = require('./Amount');

var Conversion = function(unitName, scaleToAnchor) { //add wet or dry, imperial or metric, and the name of the anchor measurement
  this.unitName = unitName;
  this.unit = Unit.unitFromName(this.unitName);
  this.scaleToAnchor = scaleToAnchor;

  this.convert = function(amount, relatedConversion) {
    var quantityAtAnchor = amount.quantity * relatedConversion.scaleToAnchor;
    return new Amount(quantityAtAnchor / this.scaleToAnchor, this.unit, amount.ingredientName);
  }.bind(this);
};


//https://www.exploratorium.edu/cooking/convert/measurements.html useful conversions
var conversionTables = [
  {
    measure: 'dry',
    standard: 'imperial',
    conversions: [
      new Conversion('cup', 48),
      new Conversion('tablespoon', 3),
      new Conversion('teaspoon', 1),
      new Conversion('pinch', 1.0 / 16),
      new Conversion('dash', 1.0 / 8),
    ],
  },
  {
    measure: 'wet',
    standard: 'imperial',
    conversions: [
      new Conversion('gallon', 768),
      new Conversion('quart', 192),
      new Conversion('pint', 96),
      new Conversion('cup', 48),
      new Conversion('fluid ounce', 6),
      new Conversion('tablespoon', 3),
      new Conversion('teaspoon', 1),
      new Conversion('dash', 1.0 / 8),
    ],
  },
  {
    measure: 'wet',
    standard: 'metric',
    conversions: [
      new Conversion('liter', 1000),
      new Conversion('milliliter', 1),
    ],
  },
  {
    measure: 'dry',
    standard: 'metric',
    conversions: [
      new Conversion('kilogram', 1000),
      new Conversion('gram', 1),
    ],
  }
];

var UnitReducer = function(amount) {
  this.amount = amount;

  this.conversionTable = conversionTables.find(function(conversionTable) {
    return conversionTable.conversions.some(function(conversion) {
      return conversion.unitName === this.amount.unit.name;
    }.bind(this));
  }.bind(this));
  
  this.conversions = this.conversionTable.conversions;

  this.conversion = this.conversions.find(function(conversion) {
    return conversion.unitName === this.amount.unit.name;
  }.bind(this))

  this.convertedAmounts = this.conversions.map(function(conversion) {
    return conversion.convert(this.amount, this.conversion);
  }.bind(this));

  this.reducedAmount = this.convertedAmounts.reduce(function(bestConvertedAmount, convertedAmount) {
    if (convertedAmount.isValid && convertedAmount.quantity < bestConvertedAmount.quantity) {
      return convertedAmount;
    } else {
      return bestConvertedAmount;
    }
  }, this.amount);
};

module.exports = UnitReducer;

},{"./Amount":1,"./unit":6}],8:[function(require,module,exports){

var IngredientParser = require('./domain/parser');

var IngredientBinder = function(lineItemNode) {
  this.lineItemNode = lineItemNode;
  this.textNode = lineItemNode.firstChild
  this.parser = new IngredientParser(this.textNode.textContent);
  
  this.scale = function(scalingFactor) {
    this.textNode.textContent = this.parser.scale(scalingFactor);
  }.bind(this);
};

var ingredientsElement = document.getElementById('ingredients');
var ingredientLineItems = ingredients.children[0].children;

var ingredientBinders = [];
for (var i = 0; i < ingredientLineItems.length; i++) {
  var ingredientLineItem = ingredientLineItems[i];
  ingredientBinders.push(new IngredientBinder(ingredientLineItem));
}

var tangle = new Tangle(document.getElementById('scaler'), {
  initialize: function() { this.scalingFactor = 1; },
  update: function() {
    ingredientBinders.forEach(function(ingredientBinder) {
      ingredientBinder.scale(this.scalingFactor);
    }.bind(this))
  },
});

},{"./domain/parser":3}]},{},[8]);
