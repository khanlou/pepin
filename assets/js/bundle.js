(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var WholeUnit = require('./whole_unit');
var QuantityParser = require('./quantity_parser');

var Amount = function(quantity, unit) {

  this.parseQuantity = function(quantityAsString) {}.bind(this);

  if (typeof quantity === 'string') {
    this.quantityAsString = quantity;
    this.quantity = new QuantityParser(this.quantityAsString).quantity;
  } else {
    this.quantity = quantity;
  }

  this.unit = unit || new WholeUnit();

  this.amountByScaling = function(scalingFactor) {
    return new Amount(this.quantity * scalingFactor, this.unit);
  }.bind(this);

  this.isValid = this.unit.isValidQuantity(this.quantity);

  this.toString = function() {
    return '' + this.quantity + ' ' + this.unit.name;
  }
};

module.exports = Amount;

},{"./quantity_parser":7,"./whole_unit":11}],2:[function(require,module,exports){
var Amount = require('./amount');
var UnitReducer = require('./unit_reducer');
var QuantityPresenter = require('./quantity_presenter');

var Inflector = require('../inflector');
var inflector = new Inflector();

var AmountPresenter = function(unreducedAmount) {
  this.amount = new UnitReducer(unreducedAmount).reducedAmount;

  this.quantity = this.amount.quantity;
  this.unit = this.amount.unit;
  
  this.epsilon = 0.0001;
  
  this.amounts = function() {
    if (this.quantity < this.epsilon) {
      return [];
    }
    
    if (this.unit.isWhole) {
      return [this.amount];
    }

    var multipleOfSmallestAcceptableUnit = this.quantity / this.unit.smallestMeasure;
    if (Number.isInteger(multipleOfSmallestAcceptableUnit)) {
      return [this.amount];
    }
    
    var integerMultipleOfSmallestAcceptableUnit = Math.floor(multipleOfSmallestAcceptableUnit + this.epsilon);
    var acceptableQuantityInCurrentUnit = integerMultipleOfSmallestAcceptableUnit * this.unit.smallestMeasure;
    var remainderForUseInSmallerUnit = this.quantity - acceptableQuantityInCurrentUnit;
    var amountRemaining = new Amount(remainderForUseInSmallerUnit, this.unit);

    return [new Amount(acceptableQuantityInCurrentUnit, this.unit)].concat(new AmountPresenter(amountRemaining).amounts);
  }.bind(this)();
  
  this.amountForDisplay = this.amounts
    .map(function(amount) {
      var quantity = new QuantityPresenter(amount.quantity).quantityForDisplay;
      var unit = inflector.pluralizeWithCount(amount.unit.name, amount.quantity);
      return (quantity + ' ' + unit).trim();
    }.bind(this)).join(' + ');
};

module.exports = AmountPresenter;

},{"../inflector":13,"./amount":1,"./quantity_presenter":8,"./unit_reducer":10}],3:[function(require,module,exports){
var Amount = require('./amount');

var IngredientLine = function(amount, ingredient) {
  this.amount = amount;
  
  if (typeof ingredient === 'string') {
    this.ingredient = { name: ingredient };
  } else {
    this.ingredient = ingredient;
  }
  
  this.ingredientLineByScaling = function(scalingFactor) {
    return new IngredientLine(this.amount.amountByScaling(scalingFactor), this.ingredient);
  }.bind(this);
};

module.exports = IngredientLine;
},{"./amount":1}],4:[function(require,module,exports){
var UnitReducer = require('./unit_reducer');
var AmountPresenter = require('./amount_presenter');

var Inflector = require('../inflector');
var inflector = new Inflector();

var IngredientLinePresenter = function(pattern, ingredientLine) {
  this.pattern = pattern;
  this.ingredientLine = ingredientLine;
  this.amountPresenter = new AmountPresenter(this.ingredientLine.amount);
  
  this.stringForDisplay = this.pattern.inject({
    "{quantity} {unit}": this.amountPresenter.amountForDisplay,
    "{quantity}": this.amountPresenter.amountForDisplay,
    "{ingredient}": this.ingredientLine.ingredient.name,
  });
};

module.exports = IngredientLinePresenter;

},{"../inflector":13,"./amount_presenter":2,"./unit_reducer":10}],5:[function(require,module,exports){
var Pattern = require('./pattern');
var IngredientLinePresenter = require('./ingredient_line_presenter');

var IngredientParser = function(text) {
  this.text = text;

  this.matchingPattern = Pattern.allPatterns.find(function(pattern) {
    return pattern.matches(text);
  });

  this.ingredientLine = this.matchingPattern.parse(this.text);

  this.scale = function(scalingFactor) {
    return new IngredientLinePresenter(this.matchingPattern, this.ingredientLine.ingredientLineByScaling(scalingFactor)).stringForDisplay;
  }.bind(this);

};

module.exports = IngredientParser;
},{"./ingredient_line_presenter":4,"./pattern":6}],6:[function(require,module,exports){
var Unit = require('./unit');
var IngredientLine = require('./ingredient_line');
var Amount = require('./amount');
var QuantityParser = require('./quantity_parser');

var allUnitRegex = '(' + Unit.allUnitNames().map(function(unitName) {
  return '\\b' + unitName + '\\b'
}).join('|') + ')';

var Pattern = function(template) {
  this.template = template;

  this.quantityRegex = '(' + QuantityParser.quantityRegexes.join('|') + ')';
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
    return new IngredientLine(new Amount(quantity, unit), ingredientName);
  }.bind(this);

  this.inject = function(injectables) {
    var injected = this.template;
    for (var key in injectables) {
      var value = injectables[key];
      injected = injected.replace(key, value);
    }
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

},{"./amount":1,"./ingredient_line":3,"./quantity_parser":7,"./unit":9}],7:[function(require,module,exports){
var QuantityParser = function(quantityAsString) {
  if (quantityAsString === "a" || quantityAsString === "an") {
    this.quantity = 1;
  } else if (quantityAsString.includes('/') && /\s+/.test(quantityAsString)) {
    var components = quantityAsString.split(/\s+/)
    this.quantity = components
      .map(function(component) {
        return new QuantityParser(component).quantity;
      })
      .reduce(function(sum, current) {
        return sum + current
      }, 0);
  } else if (quantityAsString.includes('/')) {
    var numeratorAndDenominator = quantityAsString.split('/').map(function(part) {
      return parseInt(part);
    });
    this.quantity = numeratorAndDenominator[0] / numeratorAndDenominator[1];
  } else {
    this.quantity = parseFloat(quantityAsString)
  }
};

QuantityParser.quantityRegexes = [
  '\\ba\\b', //the word a
  '\\ban\\b', //the word an
  '\\d+/\\d+', //any fraction
  '\\d*\\.\\d+', //any decimal
  '\\d+', //any number
  '\\d+\\s+\\d+/\\d+' //1 3/4
  //whole word numbers
  //ranges
];


module.exports = QuantityParser;

},{}],8:[function(require,module,exports){

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

module.exports = QuantityPresenter;
},{}],9:[function(require,module,exports){
var polyfills = require('../polyfills');

var Inflector = require('../inflector');

var inflector = new Inflector();

var Imperial = 'imperial';
var Metric = 'metric';
var Both = 'both';
var Wet = 'wet';
var Dry = 'dry';

var Unit = function(properties) {
  this.name = properties.name;
  this.alternateNames = properties.alternateNames || [];
  this.plural = properties.plural || inflector.plural(this.name)
  this.system = properties.system;
  this.measure = properties.measure;
  this.smallestMeasure = properties.smallestMeasure || 1;
  this.isWhole = false;

  this.allPossibleNames = [this.name, this.plural].concat(this.alternateNames);

  this.canBeCalled = function(name) {
    return this.allPossibleNames.indexOf(name) !== -1
  }.bind(this);
  
  this.isValidQuantity = function(quantity) {
    return quantity >= this.smallestMeasure
  }.bind(this)
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
},{"../inflector":13,"../polyfills":15}],10:[function(require,module,exports){
var Unit = require('./unit');
var Amount = require('./amount');

var Conversion = function(unitName, scaleToAnchor) { //add wet or dry, imperial or metric, and the name of the anchor measurement
  this.unitName = unitName;
  this.unit = Unit.unitFromName(this.unitName);
  this.scaleToAnchor = scaleToAnchor;

  this.convert = function(amount, relatedConversion) {
    var quantityAtAnchor = amount.quantity * relatedConversion.scaleToAnchor;
    return new Amount(quantityAtAnchor / this.scaleToAnchor, this.unit);
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
  
  if (this.amount.unit.isWhole) {
    this.reducedAmount = this.amount;
    return;
  }

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
    if (!bestConvertedAmount.isValid) {
      return convertedAmount
    }
    if (convertedAmount.isValid && convertedAmount.quantity < bestConvertedAmount.quantity) {
      return convertedAmount;
    } else {
      return bestConvertedAmount;
    }
  }, this.amount);
};

module.exports = UnitReducer;

},{"./amount":1,"./unit":9}],11:[function(require,module,exports){
var WholeUnit = function() {
  this.name = '';
  this.alternateNames = []
  this.plural = '';
  this.system = 'both';
  this.isWhole = true;
  this.isValidQuantity = function(quantity) {
    return true;
  };
};

module.exports = WholeUnit;
},{}],12:[function(require,module,exports){
var IngredientBinder = require('./ingredient_binder');
var ServingBinder = require('./serving_binder');
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
  init: function(element) {
    element.node.dataset.value = 1
  },
  start: function(element) {
    return parseInt(element.node.dataset.value, 10);
  },
  change: function(element, value) {
    element.node.textContent = value;
    scaleAllBinders(value);
  },
  end: function() { }
};

new Scrubbing(document.querySelector('#scaler'), {
  resolver: Scrubbing.resolver.HorizontalProvider(20),
  adapter: scalingAdapter
});

},{"./ingredient_binder":14,"./scrubbing":16,"./serving_binder":17}],13:[function(require,module,exports){
var Inflector = function() {
  
  var self = this;
  // Rule storage - pluralize and singularize need to be run sequentially,
  // while other rules can be optimized using an object for instant lookups.
  var pluralRules = [];
  var singularRules = [];
  var uncountables = {};
  var irregularPlurals = {};
  var irregularSingles = {};

  /**
   * Title case a string.
   *
   * @param  {string} str
   * @return {string}
   */
  function toTitleCase (str) {
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
  }

  /**
   * Sanitize a pluralization rule to a usable regular expression.
   *
   * @param  {(RegExp|string)} rule
   * @return {RegExp}
   */
  function sanitizeRule (rule) {
    if (typeof rule === 'string') {
      return new RegExp('^' + rule + '$', 'i');
    }

    return rule;
  }

  /**
   * Pass in a word token to produce a function that can replicate the case on
   * another word.
   *
   * @param  {string}   word
   * @param  {string}   token
   * @return {Function}
   */
  function restoreCase (word, token) {
    // Upper cased words. E.g. "HELLO".
    if (word === word.toUpperCase()) {
      return token.toUpperCase();
    }

    // Title cased words. E.g. "Title".
    if (word[0] === word[0].toUpperCase()) {
      return toTitleCase(token);
    }

    // Lower cased words. E.g. "test".
    return token.toLowerCase();
  }

  /**
   * Interpolate a regexp string.
   *
   * @param  {string} str
   * @param  {Array}  args
   * @return {string}
   */
  function interpolate (str, args) {
    return str.replace(/\$(\d{1,2})/g, function (match, index) {
      return args[index] || '';
    });
  }

  /**
   * Sanitize a word by passing in the word and sanitization rules.
   *
   * @param  {String}   token
   * @param  {String}   word
   * @param  {Array}    collection
   * @return {String}
   */
  function sanitizeWord (token, word, collection) {
    // Empty string or doesn't need fixing.
    if (!token.length || uncountables.hasOwnProperty(token)) {
      return word;
    }

    var len = collection.length;

    // Iterate over the sanitization rules and use the first one to match.
    while (len--) {
      var rule = collection[len];

      // If the rule passes, return the replacement.
      if (rule[0].test(word)) {
        return word.replace(rule[0], function (match, index, word) {
          var result = interpolate(rule[1], arguments);

          if (match === '') {
            return restoreCase(word[index - 1], result);
          }

          return restoreCase(match, result);
        });
      }
    }

    return word;
  }

  /**
   * Replace a word with the updated word.
   *
   * @param  {Object}   replaceMap
   * @param  {Object}   keepMap
   * @param  {Array}    rules
   * @return {Function}
   */
  function replaceWord (replaceMap, keepMap, rules) {
    return function (word) {
      // Get the correct token and case restoration functions.
      var token = word.toLowerCase();

      // Check against the keep object map.
      if (keepMap.hasOwnProperty(token)) {
        return restoreCase(word, token);
      }

      // Check against the replacement map for a direct word replacement.
      if (replaceMap.hasOwnProperty(token)) {
        return restoreCase(word, replaceMap[token]);
      }

      // Run all the rules against the word.
      return sanitizeWord(token, word, rules);
    };
  }

  /**
   * Pluralize or singularize a word based on the passed in count.
   *
   * @param  {String}  word
   * @param  {Number}  count
   * @param  {Boolean} inclusive
   * @return {String}
   */
  function pluralize (word, count, inclusive) {
    var pluralized = count <= 1
      ? self.singular(word) : self.plural(word);

    return (inclusive ? count + ' ' : '') + pluralized;
  }
  
  self.pluralizeWithCount = function(word, count) {
    return pluralize(word, count, false);
  };

  /**
   * Pluralize a word.
   *
   * @type {Function}
   */
  self.plural = replaceWord(
    irregularSingles, irregularPlurals, pluralRules
  );

  /**
   * Singularize a word.
   *
   * @type {Function}
   */
  self.singular = replaceWord(
    irregularPlurals, irregularSingles, singularRules
  );

  /**
   * Add a pluralization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */
  self.addPluralRule = function (rule, replacement) {
    pluralRules.push([sanitizeRule(rule), replacement]);
  };

  /**
   * Add a singularization rule to the collection.
   *
   * @param {(string|RegExp)} rule
   * @param {string}          replacement
   */
  self.addSingularRule = function (rule, replacement) {
    singularRules.push([sanitizeRule(rule), replacement]);
  };

  /**
   * Add an uncountable word rule.
   *
   * @param {(string|RegExp)} word
   */
  self.addUncountableRule = function (word) {
    if (typeof word === 'string') {
      uncountables[word.toLowerCase()] = true;
      return;
    }

    // Set singular and plural references for the word.
    self.addPluralRule(word, '$0');
    self.addSingularRule(word, '$0');
  };

  /**
   * Add an irregular word definition.
   *
   * @param {String} single
   * @param {String} plural
   */
  self.addIrregularRule = function (single, plural) {
    plural = plural.toLowerCase();
    single = single.toLowerCase();

    irregularSingles[single] = plural;
    irregularPlurals[plural] = single;
  };

  /**
   * Irregular rules.
   */
  [
    // Pronouns.
    ['I', 'we'],
    ['me', 'us'],
    ['he', 'they'],
    ['she', 'they'],
    ['them', 'them'],
    ['myself', 'ourselves'],
    ['yourself', 'yourselves'],
    ['itself', 'themselves'],
    ['herself', 'themselves'],
    ['himself', 'themselves'],
    ['themself', 'themselves'],
    ['is', 'are'],
    ['this', 'these'],
    ['that', 'those'],
    // Words ending in with a consonant and `o`.
    ['echo', 'echoes'],
    ['dingo', 'dingoes'],
    ['volcano', 'volcanoes'],
    ['tornado', 'tornadoes'],
    ['torpedo', 'torpedoes'],
    // Ends with `us`.
    ['genus', 'genera'],
    ['viscus', 'viscera'],
    // Ends with `ma`.
    ['stigma', 'stigmata'],
    ['stoma', 'stomata'],
    ['dogma', 'dogmata'],
    ['lemma', 'lemmata'],
    ['schema', 'schemata'],
    ['anathema', 'anathemata'],
    // Other irregular rules.
    ['ox', 'oxen'],
    ['axe', 'axes'],
    ['die', 'dice'],
    ['yes', 'yeses'],
    ['foot', 'feet'],
    ['eave', 'eaves'],
    ['goose', 'geese'],
    ['tooth', 'teeth'],
    ['quiz', 'quizzes'],
    ['human', 'humans'],
    ['proof', 'proofs'],
    ['carve', 'carves'],
    ['valve', 'valves'],
    ['thief', 'thieves'],
    ['genie', 'genies'],
    ['groove', 'grooves'],
    ['pickaxe', 'pickaxes'],
    ['whiskey', 'whiskies']
  ].forEach(function (rule) {
    return self.addIrregularRule(rule[0], rule[1]);
  });

  /**
   * Pluralization rules.
   */
  [
    [/s?$/i, 's'],
    [/([^aeiou]ese)$/i, '$1'],
    [/(ax|test)is$/i, '$1es'],
    [/(alias|[^aou]us|tlas|gas|ris)$/i, '$1es'],
    [/(e[mn]u)s?$/i, '$1s'],
    [/([^l]ias|[aeiou]las|[emjzr]as|[iu]am)$/i, '$1'],
    [/(alumn|syllab|octop|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'],
    [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
    [/(seraph|cherub)(?:im)?$/i, '$1im'],
    [/(her|at|gr)o$/i, '$1oes'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
    [/sis$/i, 'ses'],
    [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
    [/([^aeiouy]|qu)y$/i, '$1ies'],
    [/([^ch][ieo][ln])ey$/i, '$1ies'],
    [/(x|ch|ss|sh|zz)$/i, '$1es'],
    [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
    [/(m|l)(?:ice|ouse)$/i, '$1ice'],
    [/(pe)(?:rson|ople)$/i, '$1ople'],
    [/(child)(?:ren)?$/i, '$1ren'],
    [/eaux$/i, '$0'],
    [/m[ae]n$/i, 'men'],
    ['thou', 'you']
  ].forEach(function (rule) {
    return self.addPluralRule(rule[0], rule[1]);
  });

  /**
   * Singularization rules.
   */
  [
    [/s$/i, ''],
    [/(ss)$/i, '$1'],
    [/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)(?:sis|ses)$/i, '$1sis'],
    [/(^analy)(?:sis|ses)$/i, '$1sis'],
    [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
    [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
    [/([^aeiouy]|qu)ies$/i, '$1y'],
    [/(^[pl]|zomb|^(?:neck)?t|[aeo][lt]|cut)ies$/i, '$1ie'],
    [/(\b(?:mon|smil))ies$/i, '$1ey'],
    [/(m|l)ice$/i, '$1ouse'],
    [/(seraph|cherub)im$/i, '$1'],
    [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|tlas|gas|(?:her|at|gr)o|ris)(?:es)?$/i, '$1'],
    [/(e[mn]u)s?$/i, '$1'],
    [/(movie|twelve)s$/i, '$1'],
    [/(cris|test|diagnos)(?:is|es)$/i, '$1is'],
    [/(alumn|syllab|octop|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
    [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'],
    [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
    [/(alumn|alg|vertebr)ae$/i, '$1a'],
    [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
    [/(matr|append)ices$/i, '$1ix'],
    [/(pe)(rson|ople)$/i, '$1rson'],
    [/(child)ren$/i, '$1'],
    [/(eau)x?$/i, '$1'],
    [/men$/i, 'man']
  ].forEach(function (rule) {
    return self.addSingularRule(rule[0], rule[1]);
  });

  /**
   * Uncountable rules.
   */
  [
    // Singular words with no plurals.
    'advice',
    'adulthood',
    'agenda',
    'aid',
    'alcohol',
    'ammo',
    'athletics',
    'bison',
    'blood',
    'bream',
    'buffalo',
    'butter',
    'carp',
    'cash',
    'chassis',
    'chess',
    'clothing',
    'commerce',
    'cod',
    'cooperation',
    'corps',
    'digestion',
    'debris',
    'diabetes',
    'energy',
    'equipment',
    'elk',
    'excretion',
    'expertise',
    'flounder',
    'fun',
    'gallows',
    'garbage',
    'graffiti',
    'headquarters',
    'health',
    'herpes',
    'highjinks',
    'homework',
    'housework',
    'information',
    'jeans',
    'justice',
    'kudos',
    'labour',
    'literature',
    'machinery',
    'mackerel',
    'media',
    'mews',
    'moose',
    'music',
    'news',
    'pike',
    'plankton',
    'pliers',
    'pollution',
    'premises',
    'rain',
    'research',
    'rice',
    'salmon',
    'scissors',
    'series',
    'sewage',
    'shambles',
    'shrimp',
    'species',
    'staff',
    'swine',
    'trout',
    'traffic',
    'transporation',
    'tuna',
    'wealth',
    'welfare',
    'whiting',
    'wildebeest',
    'wildlife',
    'you',
    // Regexes.
    /pox$/i, // "chickpox", "smallpox"
    /ois$/i,
    /deer$/i, // "deer", "reindeer"
    /fish$/i, // "fish", "blowfish", "angelfish"
    /sheep$/i,
    /measles$/i,
    /[^aeiou]ese$/i // "chinese", "japanese"
  ].forEach(self.addUncountableRule);
};

module.exports = Inflector;
},{}],14:[function(require,module,exports){
var IngredientParser = require('./domain/parser');

var IngredientBinder = function(lineItemNode) {
  this.lineItemNode = lineItemNode;
  this.textNode = lineItemNode.firstChild
  this.parser = new IngredientParser(this.textNode.textContent);

  this.scale = function(scalingFactor) {
    this.textNode.textContent = this.parser.scale(scalingFactor);
  }.bind(this);
};

module.exports = IngredientBinder;
},{"./domain/parser":5}],15:[function(require,module,exports){
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}


if (!String.prototype.includes) {
  String.prototype.includes = function() {'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

if (!Number.isInteger) {
  Number.isInteger = function isInteger (nVal) {
    return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && (Math.floor(nVal) - nVal < 0.001);
  };
}

},{}],16:[function(require,module,exports){
var Scrubbing
(function (window, undefined){

var resolveStrToObj = function ( objOrStr, searchObj ) {
  if ( ! objOrStr ) return;

  // If `objOrStr` is a String search for it in the `searchObj`
  if ( typeof objOrStr === "string") {
    return searchObj[objOrStr];
  }

  return objOrStr;
},

fillOption = function ( newOptions, userOption, defaultOptions, searchObj, optionName ) {
  if ( ! userOption ) {
    // No userOptions, use defaults
    newOptions[optionName] = defaultOptions[optionName];
  } else {
    // User Options are there.
    // Search for the `optionName` and resolve it.
    newOptions[optionName] = resolveStrToObj ( userOption[optionName], searchObj ) || defaultOptions[optionName];
  }
},

callObjOrArray = function ( objOrArr, methodName, p1, p2, p3 ){
  if ( Array.isArray ( objOrArr ) ) {
    objOrArr.forEach(function ( obj ){
      obj[methodName] ( p1, p2, p3 );
    });
  } else { 
    objOrArr[methodName] ( p1, p2, p3 );
  }

};

// Adapter are used to bridge between the scrubbing Element and the DOM


// The BasicNode Adapter comes bundled and allows the scrubbing to work
// on DOM elements, reading the starting value from DOM and writing it back on change.
var BasicNodeAdapter = {


  // Called everytime a new `scrubbingElement` was created.
  init : function ( scrubbingElement ) {},


  // Called before the scrubbing starts.
  //
  // Return the inital value for scrubbing
  start : function ( scrubbingElement ){
    return parseInt ( scrubbingElement.node.textContent, 10 );
  },


  // Called if the `value` for the `scrubbingElement` has changed.
  // Where `value` is the value calculated from `start` and
  // the Resolver which is used.
  change : function ( scrubbingElement, value ) {
    scrubbingElement.node.textContent = value;
  },

  //  Called when the scrubbing ends.
  end : function ( scrubbingElement ) { }
};

// Resolver are used to calculate the coordinates and scrubbing value

// The BasicResolver is used to construct the `HorizontalResolver` and the `VerticalResolver`
// Which are bundled with Scrubbing.js
var BasicResolver = function ( name, prop, factor, divider ){
  this.name    = name;
  this.prop    = prop;
  this.factor  = factor  || 1;
  this.divider = divider || 1;
};

BasicResolver.prototype = {

   //  Used to determin the `startCoordinate` and `currentCoordinate`
   //
   //   e : MouseEvent/TouchEvent/Event
   //
   //  return Coordinate
  coordinate : function ( e ) {
    return e[this.prop];
  },


   //  Calculate the diffrence between the `startCoordinate` and the `currentCoordinate`
   //
   //  return Value used to calculate the new numeric value
  value : function ( startCoordinate, currentCoordinate ){
    return this.factor * Math.floor ( ( currentCoordinate - startCoordinate ) / this.divider );
  }
};

// This function creates provider for different BasicResolver
// It is used to create the bundled `HorizontalResolver` and `VerticalResolver`
//
// Return function which takes a `divider` to determin the "friction" of the Scrubbing
var CreateBasicResolverProvider = function ( name, prop, factor ) {
  return function ( divider ) {
    return new BasicResolver ( name, prop, factor, divider );
  };
};


// Create Horizontal/Vertical Resolver
var HorizontalResolverProvider = CreateBasicResolverProvider ( 'Horizontal', 'clientX' ),
    VerticalResolverProvider   = CreateBasicResolverProvider ( 'Vertical'  , 'clientY', -1 );


// A driver defines the input method used to scrub values.
// The default mouse driver uses a combination of `mousedown`, `mouseup` and `mousemove`
// events to calucalte a new Value. This is done by using an `Adapter` to retrive values from the
// DOM and reflect new values back in the DOM. A `resolver` is used to calculate the changed values.

var MouseDriver = (function (){

  var globalMouseMoveListener, // Holds the current MouseMoveListener
      currentElement,          // Holds the current Element

      globalMouseUpListener = function (  ) {
        this.removeEventListener('mousemove', globalMouseMoveListener, false);

        if ( !!currentElement )
            currentElement.options.adapter.end ( currentElement );

      },

      globalMouseDownListener = function ( e ) {
        if ( !! e.target.scrubbingElement ) {
            e.preventDefault();

            currentElement = e.target.scrubbingElement;

            var startValue          = currentElement.options.adapter.start ( currentElement ),
                coordinateResolver  = function ( e ) { return currentElement.options.resolver.coordinate( e ); },
                startCoordinate     = coordinateResolver( e );


            globalMouseMoveListener = function  ( e ) {
              if ( e.which === 1 ) {
                var delta = currentElement.options.resolver.value ( startCoordinate, coordinateResolver ( e ) );
                            currentElement.options.adapter.change ( currentElement, startValue +  delta, delta );
              } else { 
                globalMouseUpListener ();
              }
            };

            window.addEventListener('mousemove', globalMouseMoveListener, false);
            window.addEventListener('mouseup',   globalMouseUpListener, false);

            return true;
          }
      },

      init_once = function (){
        window.addEventListener('mousedown', globalMouseDownListener, false);
        init_once = function (){}; // NOOP Function that will be called subsequential
      };

  return {

      init : function ( scrubbingElement ) {
        init_once ();
      },

      remove : function ( scrubbingElement ) { }
  };
})();

var TouchDriver = (function(window, undefined){
  var currentElement,
      globalTouchMoveListener,
      globalTouchEndListener = function ( e ) {
        window.removeEventListener ( 'touchmove', globalTouchMoveListener, false );
        if (!! currentElement ) {
          currentElement.options.adapter.end ( currentElement );
        }
      },
      touchstartListener = function ( e ){
        if ( e.targetTouches.length !== 1) return;
        var touchEvent = e.targetTouches[0];

        if ( !! touchEvent.target.scrubbingElement ) {
          e.preventDefault();

          currentElement = touchEvent.target.scrubbingElement;

          var startValue          = currentElement.options.adapter.start ( currentElement ),
              coordinateResolver  = function ( e ) { return currentElement.options.resolver.coordinate( e ); },
              startCoordinate     = coordinateResolver( touchEvent );

          globalTouchMoveListener = function ( e ) { 
            if ( e.targetTouches.length !== 1) return;
            e.preventDefault();
            var delta = currentElement.options.resolver.value ( startCoordinate, coordinateResolver ( e.targetTouches[0] ) );
            currentElement.options.adapter.change ( currentElement, startValue +  delta, delta );
          };

          window.addEventListener ( 'touchmove', globalTouchMoveListener, false );
        }
      },

      init_once = function ( ) {
        window.addEventListener ( 'touchcancel', globalTouchEndListener, false );
        window.addEventListener ( 'touchend', globalTouchEndListener, false );
        init_once = function ( ) { };
      };


  return {
    init : function ( scrubbingElement ) {
      init_once ();
      scrubbingElement.node.addEventListener ( 'touchstart', touchstartListener, false );
    },

    remove : function ( scrubbingElement ) { } 
  };
})(window, undefined);

var MouseWheelDriver = (function(window, undefined){

  return {
    init : function ( scrubbingElement ) {

      scrubbingElement.node.addEventListener("mousewheel", function ( e ) {
        e.preventDefault();
        var startValue          = scrubbingElement.options.adapter.start ( scrubbingElement );
        scrubbingElement.options.adapter.change ( scrubbingElement, startValue - e.wheelDelta, e.wheelDelta );
      }, false);

    },

    remove : function ( scrubbingElement ) { }
  };

})(window);

// Defining some defaults
var defaultOptions = {
  driver      : [ TouchDriver, MouseDriver ],
  resolver    : HorizontalResolverProvider ( ),
  adapter     : BasicNodeAdapter
};


//  Base Object
//
//  Used to create a Scrubbing
//
//      `node` : Scrubbing will be bound to this element
//      `userOptions` : [optional] Here you can pass some Options
//
var Scrubbing = function ( node, userOptions ) {

  // Make `new` optional
  if ( !( this instanceof Scrubbing )){
    return new Scrubbing ( userOptions );
  }
  // Save DOM node
  this.node        =  node;

  // Add Options
  this.options     = {};

  fillOption ( this.options, userOptions, defaultOptions, Scrubbing.driver,   "driver");
  fillOption ( this.options, userOptions, defaultOptions, Scrubbing.resolver, "resolver");
  fillOption ( this.options, userOptions, defaultOptions, Scrubbing.adapter,  "adapter");


  this.node.dataset.scrubOrientation = this.options.resolver.name;

  // Add Scrubbing element to node
  node.scrubbingElement = this;

  // Initialise Adapter
  this.options.adapter.init ( this );
  // Initialise Driver
  callObjOrArray ( this.options.driver, "init", this);
};

Scrubbing.prototype = {
    remove   : function (){
      delete node.scrubbingElement;
      callObjOrArray ( this.options.driver, "remove", this);
    }
};


  Scrubbing.driver   = {
                        Mouse     : MouseDriver,
                        MouseWheel: MouseWheelDriver,

                        Touch     : TouchDriver
                       };

  Scrubbing.adapter  = { BasicNode : BasicNodeAdapter };

  Scrubbing.resolver = {
                        DefaultHorizontal  : HorizontalResolverProvider (),
                        DefaultVertical    : VerticalResolverProvider   (),

                        HorizontalProvider : HorizontalResolverProvider,
                        VerticalProvider   : VerticalResolverProvider
                      };

module.exports = Scrubbing;

})(window);



},{}],17:[function(require,module,exports){
var ServingBinder = function(scalingNode) {
  this.scalingNode = scalingNode;
  this.textNode = this.scalingNode.firstChild
  this.value = parseInt(this.textNode.textContent)

  this.scale = function(scalingFactor) {
    this.textNode.textContent = '' + this.value * scalingFactor
  }.bind(this);
};

module.exports = ServingBinder;
},{}]},{},[12]);
