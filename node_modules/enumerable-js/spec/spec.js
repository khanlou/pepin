'use strict';

var enumerable = require('../enumerable');
var expect     = require('chai').expect;

// TEST CLASSES
var LinkedList = require('./classes/LinkedList.js');

describe('enumerable', function(){
  it('should have a reduce function', function(){
    expect(typeof enumerable.reduce).to.equal('function');
  });

  it('should have an inject function which is equal to reduce', function(){
    expect(enumerable.inject).to.equal(enumerable.reduce);
  });

  it('should respond to all enumerable functions', function(){
    expect(enumerable).to.respondTo('reduce');
    expect(enumerable).to.respondTo('inject');
    expect(enumerable).to.respondTo('foldl');
    expect(enumerable).to.respondTo('filter');
    expect(enumerable).to.respondTo('select');
    expect(enumerable).to.respondTo('findAll');
    expect(enumerable).to.respondTo('find');
    expect(enumerable).to.respondTo('all');
    expect(enumerable).to.respondTo('any');
    expect(enumerable).to.respondTo('none');
    expect(enumerable).to.respondTo('mapInPlace');
    expect(enumerable).to.respondTo('extend');
    expect(enumerable).to.respondTo('noConflict');
    expect(enumerable).to.respondTo('count');
    expect(enumerable).to.respondTo('toArray');
    expect(enumerable).to.respondTo('cycle');
    expect(enumerable).to.respondTo('detect');
    expect(enumerable).to.respondTo('eachCons');
    expect(enumerable).to.respondTo('eachUntilN');
    expect(enumerable).to.respondTo('eachSlice');
    expect(enumerable).to.respondTo('first');
    expect(enumerable).to.respondTo('max');
    expect(enumerable).to.respondTo('min');
    expect(enumerable).to.respondTo('hasN');
    expect(enumerable).to.respondTo('partition');
    expect(enumerable).to.respondTo('reverseEach');
    expect(enumerable).to.respondTo('sort');
  });

  describe('with linked lists', function(){
    var list;

    beforeEach(function(){
      enumerable.extend(LinkedList.prototype);
      list = new LinkedList();
      list.add(3);
      list.add(4);
      list.add(5);
      list.add(6);
    });


    it('should be able to reduce', function(){
      var sum = list.reduce(function(sum, node){
        return sum + node.value;
      }, 0);
      expect(sum).to.equal(18);
    });

    it('should be able to filter', function(){
      var evens = list.filter(function(node){
        return node.value % 2 === 0;
      });
      expect(evens.length).to.equal(2);
      expect(evens[0].value).to.equal(4);
      expect(evens[1].value).to.equal(6);
      expect(Array.isArray(evens)).to.be.true;
    });

    it('should be able to find', function(){
      var three = list.find(function(node){
        return node.value === 3;
      });
      var six = list.find(function(node){
        return node.value === 6
      });
      var thirteen = list.find(function(node){
        return node.value === 13;
      });
      expect(three).to.equal(list.head);
      expect(six).to.equal(list.tail);
      expect(thirteen).to.be.null;
    });

    it('should return the correct boolean for `all`', function(){
      var allPositive = list.all(function(node){
        return node.value > 0;
      });
      var allEven = list.all(function(node){
        return node.value % 2 === 0;
      });
      expect(allPositive).to.be.true;
      expect(allEven).to.be.false;
    });

    it('should return the correct boolean for `any`', function(){
      var anyNegative = list.any(function(node){
        return node.value < 0;
      });
      var anyFour = list.any(function(node){
        return node.value === 4;
      });

      expect(anyNegative).to.be.false;
      expect(anyFour).to.be.true;
    });

    it('should map in place', function(){
      list.mapInPlace(function(node){
        node.value *= 2;
        return node;
      });
      expect(list.head.value).to.equal(6);
      expect(list.head.next.value).to.equal(8);
    });

    it('should handle eachSlice', function(){
      list.add(7);

      var nodeSlices = [];
      list.eachSlice(function(nodes){
        nodeSlices.push(nodes);
      }, 2);

      expect(nodeSlices[0].length).to.equal(2);
      expect(nodeSlices[1].length).to.equal(2);
      expect(nodeSlices[2].length).to.equal(1);
      expect(Array.isArray(nodeSlices[0])).to.be.true;
      expect(nodeSlices[0][0]).to.equal(list.head);
      expect(nodeSlices[0][1]).to.equal(list.head.next);
      expect(function(){ list.eachSlice(function(){}) }).to.throw(SyntaxError);

    });

    it('should count all items when no condition is passed in', function(){
      expect(list.count()).to.equal(4);
      list.add(13);
      expect(list.count()).to.equal(5);
    });

    it('should count according to the result of a callback when supplied', function(){
      var count = list.count(function(node){
        return node.value % 2 == 0;
      })
      expect(count).to.equal(2);

      list.add(14);
      count = list.count(function(node){
        return node.value % 2 == 0;
      });
      expect(count).to.equal(3);
    });

    it('should count properly when a non-object condition is supplied', function(){
      var countHead = list.count(list.head);
      var countNum = list.count(9);

      expect(countHead).to.equal(1);
      expect(countNum).to.equal(0);
    });

    it('should be able to put everything in an array', function(){
      var arr = list.toArray();
      expect(Array.isArray(arr)).to.be.true;
      expect(arr.length).to.equal(4);
      expect(arr[0]).to.equal(list.head);
      expect(arr[arr.length - 1]).to.equal(list.tail);
    });

    it('should be able to cycle through a list n times', function(){
      var cycledNodes = [];
      var callbackFn = function(node){
        cycledNodes.push(node);
      };
      list.cycle(callbackFn, 2);
      expect(cycledNodes.length).to.equal(8);

      list.cycle(callbackFn, 0);
      expect(cycledNodes.length).to.equal(8);

      expect(function(){ list.cycle() }).to.throw(SyntaxError);
    });

    it('should be able to detect the first node which fails the callback', function(){
      var greaterThanFive = list.detect(function(node){
        return node.value <= 5;
      });
      expect(greaterThanFive.value).to.equal(6);
      expect(greaterThanFive).to.equal(list.tail);

      var greaterThanTen = list.detect(function(node){
        return node.value <= 10;
      });

      expect(greaterThanTen).to.be.null;
    });

    it('should execute a callback for an array of consecutive n items', function(){
      var sliceThrees = [];
      list.eachCons(function(slice){
        sliceThrees.push(slice);
      }, 3);
      expect(sliceThrees.length).to.equal(2);
      expect(sliceThrees[0].length).to.equal(3);
      expect(sliceThrees[sliceThrees.length - 1].length).to.equal(3);
      expect(sliceThrees[0][0].value).to.equal(3);
    });

    it('should execute a callback for n number of elements', function(){
      var items = [];
      list.eachUntilN(function(item){
        items.push(item);
      }, 3);
      expect(items.length).to.equal(3);
      expect(items[0]).to.equal(list.head);

      var items2 = [];
      list.eachUntilN(function(item){
        items2.push(item);
      }, 3, null, 1);
      expect(items2.length).to.equal(3);
      expect(items2[0]).to.equal(list.head.next);
    });

    it('should be able to return the first N item', function(){
      var first = list.first();
      expect(first).to.equal(list.head);

      var first2 = list.first(2);
      expect(Array.isArray(first2)).to.be.true;
      expect(first2[0]).to.equal(list.head);
      expect(first2[1]).to.equal(list.head.next);
     
      var first100 = list.first(100);
      expect(first100.length).to.equal(4);
    });

    it('should be able to return the max as described by the callback', function(){
      var maxNum = list.max(function(node){
        return node.value;
      });
      expect(maxNum).to.equal(list.tail);
      expect(maxNum.value).to.equal(6);

      list.head.value = 'bob';
      list.head.next.value = 'sandy';
      list.head.next.next.value = 'lauren';
      list.head.next.next.next.value = 'billy';

      var maxLength = list.max(function(node){
        return node.value.length;
      });
      expect(maxLength.value).to.equal('lauren');
      expect(function(){ list.max() }).to.throw(SyntaxError);

      var maxAlphabet = list.max(function(node){
        return node.value;
      });
      expect(maxAlphabet.value).to.equal('sandy');
    });

    it('should be able to return the min as described by the callback', function(){
      var minNum = list.min(function(node){
        return node.value;
      });
      expect(minNum).to.equal(list.head);
      expect(minNum.value).to.equal(3);

      list.head.value = 'bob';
      list.head.next.value = 'sandy';
      list.head.next.next.value = 'lauren';
      list.head.next.next.next.value = 'billy';

      var minLength = list.min(function(node){
        return node.value.length;
      });
      expect(minLength.value).to.equal('bob');
      expect(function(){ list.min() }).to.throw(SyntaxError);

      var minAlphabet = list.min(function(node){
        return node.value;
      });
      expect(minAlphabet.value).to.equal('billy');
    });

    it('should return the correct boolean for none', function(){
      var lessThanZero = list.none(function(node){
        return node.value < 0;
      });
      expect(lessThanZero).to.be.true;
    });

    it('should return the correct boolean for the number of items for which the callback is truthy', function(){
      var hasTwo = list.hasN(function(node){
        return node.value % 2 === 0;
      }, 2);
      expect(hasTwo).to.be.true;
    });

    it('should default to 1 for hasN if no number is passed in', function(){
      var hasOneEven = list.hasN(function(node){
        return node.value % 2 === 0;
      });
      expect(hasOneEven).to.be.false;

      var hasOneSix = list.hasN(function(node){
        return node.value === 6;
      });
      expect(hasOneSix).to.be.true;
    });

    it('should partition the items into two arrays based on the truthiness of the callback', function(){
      var evenOdds = list.partition(function(node){
        return node.value % 2 === 0;
      });
      expect(evenOdds.length).to.equal(2);
      expect(evenOdds[0][0].value).to.equal(4);
      expect(evenOdds[1][0].value).to.equal(3);
    });

    it('should be able to call everything in reverse', function(){
      var valueStr = '';
      list.reverseEach(function(node){
        valueStr += node.value;
      });
      expect(valueStr).to.equal('6543');
    });

    it('should be able to return a sorted array by sort described by the callback', function(){
      list.add(16);
      list.add(13);
      list.add(7);
      var sorted = list.sort(function(node){
        return node.value;
      });
      expect(sorted[sorted.length - 1].value).to.equal(16)
    });

  });
});
