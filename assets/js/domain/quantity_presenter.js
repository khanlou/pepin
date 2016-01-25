
var QuantityPresenter = function(quantity) {
  this.quantity = quantity;
  
  this.integer = Math.floor(this.quantity);
  this.remainder = quantity - this.integer;
  
  this.fractions = {
    0: "",
    0.25: "1/4",
    0.5: "1/2",
    0.75: "3/4",
    0.1428: "1/7",
    0.111: "1/9",
    0.1: "1/10",
    0.333: "1/3",
    0.667: "2/3",
    0.2: "1/5",
    0.4: "2/5",
    0.6: "3/5",
    0.8: "4/5",
    0.167: "1/6",
    0.833: "5/6",
    0.125: "1/8",
    0.375: "3/8",
    0.625: "5/8",
    0.875: "7/8",
  };
  
    
  this.closestFraction = Object.keys(this.fractions).find(function(fraction) {
    return Math.abs(this.remainder - parseFloat(fraction)) < 0.01;
  }.bind(this))
  
  this.fractionToHTML = function(fractionString) {
    if (fractionString === "") { return ""; }
    var fractionParts = fractionString.split('/');
    return "<sup class='frac'>" + fractionParts[0] + "</sup>&frasl;<sub class='frac'>" + fractionParts[1] + "</sub>";
  }
  
  
  if (this.closestFraction) {
    this.integerAsString = this.integer == 0 ? '' : '' + this.integer
    this.quantityForDisplay = this.integerAsString + this.fractionToHTML(this.fractions[this.closestFraction]);
  } else {
    this.quantityForDisplay = '' + this.quantity;
  }
  
};

module.exports = QuantityPresenter;