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
