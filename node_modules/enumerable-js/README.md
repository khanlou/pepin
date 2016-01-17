Enumerable.js
=============

### *utility functions for all types of collections*

When you use a JavaScript array or hash table, you have so many ways to get utility functions at your disposal through libraries like Underscore, Zepto, jQuery, or natively in ECMAScript5. Why can't we have these same utility functions just as easily for other data structures that can be iterated over? Say, a linked list, or a tree, or a graph, or that newest thing that your monkey came up with?

This library is heavily inspired by Ruby's Enumerable module, and borrows great deal of its functionality.

Note: This is *not* meant to be a standalone library, but to be used in conjunction with another data type that has a defineable `.each` method.

Quickstart
----------

#### 1. Have a collection of some sort

```` js
// contrived example
var LinkedList = function(){
  this.head = null;
  this.tail = null;
};

LinkedList.prototype.add = function(value){
  var node = {
    value: value,
    next: null
  };
  if(!this.head){
    this.head = this.tail = node;
  } else {
    this.tail.next = node;
    this.tail = node;
  }
};

````

#### 2. Extend that thing with enumerable

```` js
// option 1: use enumerable.extend
enumerable.extend(LinkedList.prototype);

// option 2: use Object#create. NOTE: In this case, doing so will will completely 
// reassign what LinkedList.prototype is. Here, we would need to define 
// LinkedList#add again after this.

LinkedList.prototype = Object.create(enumerable);
````

#### 3. Define what `.each` means

```` js
LinkedList.prototype.each = function(callback, context){
  var node = this.head;
  while(node){
    callback.call(context, node);
    node = node.next;
  }
};
````

#### 4. Stand in awe of all the awesome utility functions you suddenly have

```` js
var list = new LinkedList();
list.add(5);
list.add(9);
list.add(15);

var sum = list.reduce(function(sum, node){ return sum + node.value; }, 0);
console.log(sum);
// => 27   ¯\_(ツ)_/¯
````

Supported functions
-------------------

**Returns a unit of the collection**
* first
* max
* min
* detect
* find

**Returns as specified**
* reduce / inject / foldl

**Returns an array**
* filter / select / findAll
* mapToArray
* toArray
* sort
* partition

**Returns `this`**
* mapInPlace
* eachCons
* eachUntilN
* eachSlice
* reverseEach
* cycle

**Returns an integer**
* count

**Returns a boolean**
* all
* any
* none
* hasN

Installation
------------

As an NPM module
`npm install enumerablejs`

As a bower module
`bower install enumerablejs`

From Github
`git clone git@github.com:bioball/Enumerable.js.git`

---

*This is currently a work in progress. Please send in pull requests! However, please also have test coverage in your pull requests.