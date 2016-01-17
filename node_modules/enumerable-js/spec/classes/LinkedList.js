var LinkedList = function(){
  this.head = null;
  this.tail = null;
};

var LinkedListNode = function(val){
  this.value = val;
  this.next = null;
}

LinkedList.prototype.add = function(val){
  var node = new LinkedListNode(val);
  if(!this.head){
    this.head = this.tail = node;
  } else {
    this.tail.next = node;
    this.tail = node;
  }
  return node;
};

LinkedList.prototype.removeFromHead = function(){
  this.head && this.head.next = this.head;
};

LinkedList.prototype.removeFromTail = function(){
  node = this.head;
  while(node.next && node.next.next){
    node = node.next;
  }
  this.tail = node;
}

LinkedList.prototype.each = function(cb){
  var node = this.head;
  while(node){
    cb(node);
    node = node.next;
  }
};

module.exports = LinkedList;