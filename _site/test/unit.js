var Unit = require('../assets/js/domain/unit');
var assert = require('assert');

describe("unit", function() {
  it("should find units by their names", function() {
    var unit = Unit.unitFromName('cup');
    assert.equal(unit.name, 'cup');
  });  
  
  it("should find units by their plurals", function() {
    var unit = Unit.unitFromName('cups');
    assert.equal(unit.name, 'cup');
  });  
  
  it("should find units by their alternate names", function() {
    var unit = Unit.unitFromName('c');
    assert.equal(unit.name, 'cup');
  });  
  
  
});
