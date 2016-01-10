
var allUnitRegex = '(' + Unit.allUnitNames().map(function(unitName) { return '\\b' + unitName + '\\b'}).join('|') + ')';

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

    preparedTemplate = preparedTemplate.replace(/\s+/g, '\\s+')
    preparedTemplate = preparedTemplate.replace('{quantity}', this.quantityRegex)
    preparedTemplate = preparedTemplate.replace('{unit}', this.allUnitRegex)
    preparedTemplate = preparedTemplate.replace('{ingredient}', this.ingredientRegex)

    return preparedTemplate;
  }.bind(this)()

  this.matches = function(against) {
    var results = against.match(this.preparedTemplate);
    if (!results) {
      return null;
    }
    results.shift();
    var quantity, unit, ingredientName;
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      if (new RegExp(this.quantityRegex).test(result)) {
        quantity = result;
      } else if (new RegExp(this.allUnitRegex).test(result)) {
        unit = result;
      } else if (new RegExp(this.ingredientRegex).test(result)) {
        ingredientName = result;
      }
    }
    return new Amount(quantity, unit, ingredientName);
  }.bind(this);
};

var IngredientParser = function(text) {
  this.text = text;

  this.patterns = [
    new Pattern("{ingredient} to taste"),
    new Pattern("{ingredient} as desired"),
    new Pattern("{quantity} {unit} of {ingredient}"), // 2 sticks of butter, 2-3 tablespoons of sugar
    new Pattern("{quantity} {unit} {ingredient}"), //1 cup flour
    new Pattern("{quantity} {ingredient}"), //an egg, 
  ];

  for (var i = 0; i < this.patterns.length; i++) {
    var pattern = this.patterns[i];
    var match = pattern.matches(text)
    if (match) {
      this.amount = match;
      break;
    }
  }
};
