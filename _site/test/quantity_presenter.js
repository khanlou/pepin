var QuantityPresenter = require('../assets/js/domain/quantity_presenter');
var assert = require('assert');

describe("quantity presenter", function() {
  
  it("should present quantities", function() {
    var quantityPresenter = new QuantityPresenter(1);
    assert.equal(quantityPresenter.quantityForDisplay, "1");
  });
  
  it("should present fractions", function() {
    var quantityPresenter = new QuantityPresenter(0.75);
    assert.equal(quantityPresenter.quantityForDisplay, "<sup class='frac'>3</sup>&frasl;<sub class='frac'>4</sub>");
  });
  
  it("should present decimals", function() {
    var quantityPresenter = new QuantityPresenter(0.65);
    assert.equal(quantityPresenter.quantityForDisplay, "0.65");
  });

});
