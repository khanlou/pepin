var Conversion = function(unitName, scaleToAnchor) { //add wet or dry, imperial or metric, and the name of the anchor measurement
  this.unitName = unitName;
  this.unit = Unit.unitFromName(this.unitName)
  this.scaleToAnchor = scaleToAnchor;

  this.convert = function(amount, relatedConversion) {
    var quantityAtAnchor = amount.quantity * relatedConversion.scaleToAnchor;
    return new Amount(quantityAtAnchor / this.scaleToAnchor, this.unit, amount.ingredientName);
  }.bind(this);
};

var conversions = {
  dryImperial: [
    new Conversion('cup', 48),
    new Conversion('tablespoon', 3),
    new Conversion('teaspoon', 1),
    new Conversion('pinch', 1.0 / 16),
    new Conversion('dash', 1.0 / 8),
  ],
  wetImperial: [
    new Conversion('gallon', 768),
    new Conversion('quart', 192),
    new Conversion('pint', 96),
    new Conversion('cup', 48),
    new Conversion('tablespoon', 3),
    new Conversion('teaspoon', 1),
    new Conversion('dash', 1.0 / 8),
  ],
  fluidMetric: [
    new Conversion('liter', 1000),
    new Conversion('milliliter', 1),
  ],
  weightMetric: [
    new Conversion('kilogram', 1000),
    new Conversion('gram', 1),
  ],
};

var UnitReducer = function(amount) {
  this.amount = amount;
  
  for (var key in conversions) {
    var conversionTable = conversions[key];
    var validConversion = conversionTable.some(function(conversion) {
      return conversion.unitName === this.amount.unit.name;
    }.bind(this))
    if (validConversion) {
      this.conversionTable = conversionTable;
      break;
    }
  }
  
  this.conversion = this.conversionTable.find(function(conversion) {
    return conversion.unitName === this.amount.unit.name;
  }.bind(this))

  this.quantityAtAnchor = this.amount.quantity * this.conversion.scaleToAnchor;

  var bestConvertedAmount = this.amount;
  for (var i = 0; i < this.conversionTable.length; i++) {
    var conversion = this.conversionTable[i];
    var convertedAmount = conversion.convert(this.amount, this.conversion);
    if (convertedAmount.quantity >= convertedAmount.unit.smallestMeasure) {
      if (convertedAmount.quantity < bestConvertedAmount.quantity) {
        bestConvertedAmount = convertedAmount;
      }
    }
  }
  
  this.reducedAmount = bestConvertedAmount;
};
