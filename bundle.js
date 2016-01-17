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
  this.ingredient = { name: ingredientName };


  this.amountByScaling = function(scalingFactor) {
    return new Amount(this.quantity * scalingFactor, this.unit, this.ingredient.name);
  }.bind(this);
  
  this.isValid = (this.quantity >= this.unit.smallestMeasure);
};

module.exports = Amount;
},{}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],3:[function(require,module,exports){
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
    var pluralized = count === 1
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
},{}],4:[function(require,module,exports){
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
},{"./pattern":5,"./presenters":7}],5:[function(require,module,exports){
var Unit = require('./unit');
var IngredientLine = require('./amount');

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
    return new IngredientLine(quantity, unit, ingredientName);
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
},{"./amount":2,"./unit":8}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
var Inflector = require('./inflector');
var inflector = new Inflector();

var UnitReducer = require('./unit_reducer');


var AmountPresenter = function(pattern, amount) {
  this.pattern = pattern;
  this.amount = amount;
  this.unitReducer = new UnitReducer(this.amount);
  this.reducedAmount = this.unitReducer.reducedAmount;
  
  this.stringForDisplay = this.pattern.inject(
    new QuantityPresenter(this.reducedAmount.quantity).quantityForDisplay,
    inflector.pluralizeWithCount(this.reducedAmount.unit.name, this.reducedAmount.quantity),
    this.reducedAmount.ingredient.name
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
},{"./inflector":3,"./unit_reducer":9}],8:[function(require,module,exports){
var polyfills = require('./polyfills');

var Inflector = require('./inflector');

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
},{"./inflector":3,"./polyfills":6}],9:[function(require,module,exports){
var Unit = require('./unit');
var Amount = require('./Amount');

var Conversion = function(unitName, scaleToAnchor) { //add wet or dry, imperial or metric, and the name of the anchor measurement
  this.unitName = unitName;
  this.unit = Unit.unitFromName(this.unitName);
  this.scaleToAnchor = scaleToAnchor;

  this.convert = function(amount, relatedConversion) {
    var quantityAtAnchor = amount.quantity * relatedConversion.scaleToAnchor;
    return new Amount(quantityAtAnchor / this.scaleToAnchor, this.unit, amount.ingredient.name);
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

},{"./Amount":1,"./unit":8}],10:[function(require,module,exports){
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

},{"./domain/parser":4}]},{},[10]);
