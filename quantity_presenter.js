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
    0.6: "\u2158",
    0.167: "\u2159",
    0.833: "\u215A",
    0.125: "\u215B",
    0.375: "\u215C",
    0.625: "\u215D",
    0.875: "\u215E",
  };
  
    
  this.closestFraction = Object.keys(fractions).find(function(fraction) {
    return Math.abs(this.remainder - parseFloat(fraction)) < 0.01;
  }.bind(this))
  
  if (this.closestFraction) {
    this.integerAsString = this.integer == 0 ? '' : '' + this.integer
    this.quantityForDisplay = this.integerAsString + fractions[this.closestFraction];
  } else {
    this.quantityForDisplay = '' + this.quantity;
  }
  
}