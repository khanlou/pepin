(function(){

  'use strict';

  var root = this;

  // this is used to "break" out of an each loop

  var breaker = {};

  // store the old enumerable

  var oldEnumerable = root.enumerable;

  var enumerable = {};

  enumerable.VERSION = '0.0.1';

  // if enumerable was being used, it may be reinstated by invoking noConflict. However, this will remove the enumerable
  // library unless it is saved to a variable.

  enumerable.noConflict = function noConflict(){
    root.enumerable = oldEnumerable;
    return enumerable;
  };

  // returns the result of combining all items in the collection into one, via the seed object

  enumerable.reduce = enumerable.inject = enumerable.foldl = function reduce(callback, seed, context){
    context = context || this;
    this.each(function(item){
      seed = callback.call(context, seed, item);
    });
    return seed;
  };

  // returns an array of all items for which the callback returns truthy

  enumerable.filter = enumerable.select = enumerable.findAll = function filter(callback, context){
    context = context || this;
    var result = [];
    this.each(function(item){
      if(callback.call(context, item)){
        result.push(item);
      }
    });
    return result;
  };

  // returns the first item for which the callback returns truthy

  enumerable.find = function find(callback, context){
    context = context || this;
    var result = null;
    try {
      this.each(function(item){
        if(callback.call(context, item)){
          result = item;
          throw breaker;
        }
      });
    } catch(e) {
      if(e !== breaker){
        throw e;
      }
    }
    return result;
  };

  // if no condition is supplied, returns the number of items total
  // if a function is supplied as the condition, counts the number of items for which the condition passes
  // otherwise, counts the number of items that strictly equal the passed in object

  enumerable.count = function count(condition, context){
    context = context || this;
    var result = 0;
    var callback = typeof condition === 'function' 
    ? condition 
    : function(item){
      return item === condition;
    };
    this.each(function(item){
      condition ? callback.call(context, item) && result++ : result++;
    });
    return result;
  };

  // returns true if the callback on every item is truthy

  enumerable.all = function all(callback, context){
    context = context || this;
    try {
      this.each(function(item){
        if(!callback.call(context, item)){
          throw breaker;
        }
      });
    } catch(e) {
      if(e === breaker){
        return false;
      } else {
        throw e;
      }
    }
    return true;
  };

  // returns true if the callback on any item is truthy

  enumerable.any = function any(callback, context){
    context = context || this;
    return !this.all(function(item){
      return !callback.call(context, item);
    });
  };

  // IMPORTANT TO NOTE: JavaScript primitives are immutable, and this function is designed
  // to mutate each object, so it will not work if the `each` item is a primitive.

  enumerable.mapInPlace = function mapInPlace(callback, context){
    context = context || this;
    this.each(function(item){
      item = callback.call(context, item);
    });
    return this;
  };

  // returns an array of ths result invoking the callback on each item in the collection

  enumerable.mapToArray = function mapToArray(callback, context){
    context = context || this;
    var result = [];
    this.each(function(item){
      result.push(callback.call(context, item));
    });
    return result;
  };

  // if two objects are passed in, it will extend properties of the first object to the second object.
  // otherwise, if just one is passed in, it will extend enumerable to that object.

  enumerable.extend = function extend(obj1, obj2){
    if(!obj2){
      this.extend(this, obj1);
    } else {
      for(var key in obj1){
        obj2[key] = obj1[key];
      }
    }
  };

  // returns all the items in the collection in an array format

  enumerable.toArray = function toArray(){
    return this.mapToArray(function(item){
      return item;
    });
  };

  // executes the callback on every item in the collection num amount of times

  enumerable.cycle = function cycle(callback, num, context){
    context = context || this;
    if (typeof num !== 'number') { throw new SyntaxError('need a number passed in as the second argument'); }
    num = Math.floor(Math.abs(num));
    while(num){
      this.each.call(context, callback);
      num--;
    }
    return this;
  };

  // returns the first item for which the callback returns falsy

  enumerable.detect = function detect(callback, context){
    context = context || this;
    return this.find(function(node){
      return !callback.call(context, node);
    });
  };

  // invokes the callback on num-consecutive items in an array format
  // [1,2,3,4].eachCons(function(console.log(nums)), 3);
  // #=> [1,2,3]
  // #=> [2,3,4]

  enumerable.eachCons = function eachCons(callback, num, context){
    context = context || this;
    var index = 0;
    var self = this;
    try {
      this.each(function(){
        var collection = [];
        self.eachUntilN(function(node){
          collection.push(node);
        }, num, this, index);
        if (collection.length !== num) { throw breaker; }
        callback.call(context, collection);
        index++;
      });
    } catch(e){
      if (e !== breaker) {
        throw e;
      }
    }
    return this;
  };

  // slices the collection up into num-sized arrays, and invokes the callback on them

  enumerable.eachSlice = function eachSlice(callback, num, context){
    if (typeof num !== 'number') { throw new SyntaxError('need a number passed in as a second argument') }
    context = context || this;
    var currentSlice = [];
    this.each(function(item){
      currentSlice.push(item);
      if (currentSlice.length == num) {
        callback.call(context, currentSlice);
        currentSlice = [];
      }
    });
    if (currentSlice.length) {
      callback.call(context, currentSlice);
    }
    return this;
  }

  // iterates the given callback for the first N elements only. If a start index is given, it starts at that element

  enumerable.eachUntilN = function eachUntilN(callback, num, context, start){
    start = start || 0;
    context = context || this;
    var index = -1;
    if (typeof num !== 'number' || num < 0) { throw new TypeError('need a positive integer number as a second argument') }
    try {
      this.each(function(item){
        index++;
        if (index < start) { return; }
        callback.call(context, item);
        num--;
        if (num === 0) {
          throw breaker;
        }
      });
    } catch(e) {
      if (e !== breaker) {
        throw e;
      }
    }
    return this;
  };

  // returns the first item in the collection. If a numerical argument is given, returns the first num arguments in an array

  enumerable.first = function first(num){
    var count = 0;
    var result;
    try {
      if (typeof num !== 'number') {
        return this.each(function(item){
          result = item;
          throw breaker;
        });
      } else {
        result = [];
        this.each(function(item){
          result.push(item);
          if (result.length == num){
            throw breaker;
          }
        })
      }
    } catch(e) {
      if (e !== breaker) {
        throw e;
      }
    }
    return result;
  };

  // returns the maximal item in a collection as determined by the callback

  enumerable.max = function max(callback, context){
    if (typeof callback !== 'function') {
      throw new SyntaxError('need a callback argument')
    }
    context = context || this;
    var maxObj, maxValue, currentValue;
    this.each(function(currentObj){
      currentValue = callback.call(context, currentObj);
      if (typeof maxObj === 'undefined' || currentValue > maxValue) {
        maxObj = currentObj;
        maxValue = currentValue;
      }
    });
    return maxObj;
  };

  // returns the maximal item in a collection as determined by the callback

  enumerable.min = function min(callback, context){
    if(typeof callback !== 'function'){
      throw new SyntaxError('need a callback argument')
    }
    context = context || this;
    var minObj, minValue, currentValue;
    this.each(function(currentObj){
      currentValue = callback.call(context, currentObj);
      if (typeof minObj === 'undefined' || currentValue < minValue) {
        minObj = currentObj;
        minValue = currentValue;
      }
    });
    return minObj;
  };

  // returns true if none of the items return truthy from the callback

  enumerable.none = function none(callback, context){
    context = context || this;
    return this.all(function(item){
      return !callback.call(context, item);
    });
  };

  // returns a boolean of whether a collection has num-number of items that return truthy from the callback

  enumerable.hasN = function hasN(callback, num, context){
    context = context || this;
    num = num || 1;
    try {
      this.each(function(item){
        if(callback.call(context, item)){
          num--;
        }
        if(num < 0){
          throw breaker;
        }
      })
    } catch (e){
      if (e !== breaker) {
        throw e;
      }
    }
    return num == 0;
  };

  // returns two arrays, one with items which pass the callback, and one which does not

  enumerable.partition = function partition(callback, context){
    var pass = [];
    var fail = [];
    this.each(function(item){
      if(callback.call(context, item)){
        pass.push(item);
      } else {
        fail.push(item);
      }
    })
    return [pass, fail];
  };

  // invokes the callback in reverse order

  enumerable.reverseEach = function reverseEach(callback, context){
    var items = this.toArray();
    for(var i = items.length - 1; i >= 0; i--){
      callback.call(context, items[i]);
    }
    return this;
  };

  // returns an array of items sorted in ascending order by the callback

  enumerable.sort = function(callback, context){
    return this.toArray().sort(function(node1, node2){
      var result1 = callback.call(context, node1);
      var result2 = callback.call(context, node2);
      if (result1 > result2) {
        return 1;
      } else if (result1 < result2) {
        return -1;
      } else {
        return 0;
      }
    });
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = enumerable;
    }
    exports.enumerable = enumerable;
  } else {
    root.enumerable = enumerable
  }

}).call(this);