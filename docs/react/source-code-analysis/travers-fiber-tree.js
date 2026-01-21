function FiberNode(val) {
  this.val = val;
  this.child = null;
  this.sibling = null;
  this.return = null;
}
FiberNode.prototype.setChild = function(child) {
  this.child = child;
}
FiberNode.prototype.setSibling = function(sibling) {
  this.sibling = sibling;
}
FiberNode.prototype.setReturn = function(returnNode) {
  this.return = returnNode;
}

const node1 = new FiberNode(1);
const node2 = new FiberNode(2);
const node3 = new FiberNode(3);
const node4 = new FiberNode(4);
const node5 = new FiberNode(5);
const node6 = new FiberNode(6);
const node7 = new FiberNode(7);
const node8 = new FiberNode(8);
const node9 = new FiberNode(9);

node1.setChild(node2);
node2.setReturn(node1);
node2.setChild(node3);
node3.setReturn(node2);
node3.setSibling(node4);
node4.setReturn(node2);
node4.setChild(node6);
node4.setSibling(node5);
node5.setReturn(node2);
node6.setReturn(node4);
node6.setSibling(node7);
node7.setReturn(node4);
node7.setChild(node8);
node8.setReturn(node7);

let nextNode = node1;
function begin() {
  while(nextNode) {
    debugger;
    console.log('begin', nextNode.val);
    if(nextNode.child) {
      nextNode = nextNode.child;
    } else {
      complete();
    }
  }
}

function complete() {
  while(nextNode) {
    console.log('complete', nextNode.val);
    if(nextNode.sibling) {
      nextNode = nextNode.sibling;
      return;
    }
    nextNode = nextNode.return;
  }
}
begin();