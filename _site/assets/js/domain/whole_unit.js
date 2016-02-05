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