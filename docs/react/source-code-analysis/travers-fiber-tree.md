# React内部怎样遍历`Fiber`树的呢？

## `Fiber`树结构

在`React`内部的`Fiber`节点，主要有以下几个属性：

- `child`: 指向当前节点的子节点
- `sibling`: 指向当前节点的兄弟节点
- `return`: 指向当前节点的父节点

![alt text](image.png)

如上图的一个`Fiber Tree`，树结构内部依靠`child`、`sibling`以及`return`节点进行连接。那么怎么进行遍历呢？

在`react`内部是使用**深度优先**的遍历方式，先从根节点依次向下走到最低层，然后找到最底层的兄弟节点，又依次向下走到最底层，按照这样的方式依次遍历完成整个数组。

我们可以将`react`中的遍历思想写成一个简单版本：

```js

let nextNode = node1;

function begin() {
  while(nextNode) {
    console.log('begin', nextNode.val);
    if(nextNode.child) {
      nextNode = nextNode.child;
    } else {
      complete()
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
begin()
```

将上面代码的执行过程图像化如下，分步进行执行过程分析：
![alt text](image-1.png)

1. 第一步，将开始节点`node1`赋值给全局变量`nextNode`，执行`begin`函数，打印 `begin 1`，判断`nextNode.child`存在，赋值给`nextNode`，此时`nextNode === node2`
2. 第二步，由于`nextNode`存在，继续执行`while`循环，打印 `begin 2`，判断`nextNode.child`存在，赋值给`nextNode`，此时`nextNode === node3`
3. 第三步，由于`nextNode`存在，继续执行`while`循环，打印`begin 3`，此时`nextNode === node3`，判断`nexNode.child`不存在，进入`complete`函数，执行`while`循环，打印`complete 3`
4. 第四步，，判断`nextNode.sibling`存在，赋值给`nextNode`，此时`nextNode === node4`，并执行`return`，返回到`begin()`函数中，继续在`begin()`函数中执行`while`循环，打印`begin 4`
5. 第五步，此时`nextNode === node4`，判断`nextNode.child`是否存在，赋值给`nextNode`，此时`nextNode === node6`，再次进入`begin()`函数中的`while`循坏，打印`begin 6`
6. 第六步，此时`nextNode === node6`，判断`nextNode.child`是否存在，不存在，进入`complete`函数，进入`complete`中的`while`循环，打印`complete 6`
7. 第七步，，判断`nextNode.sibling`存在，赋值给`nextNode`，此时`nextNode === node7`，并执行`return`，返回到`begin()`函数中，继续在`begin()`函数中执行`while`循环，打印`begin 7`
8. 第八步，此时`nextNode === node7`，判断`nextNode.child`是否存在，赋值给`nextNode`，此时`nextNode === node8`，再次进入`begin()`函数中的`while`循坏，打印`begin 8`
9. 第九步，此时`nextNode === node8`，判断`nextNode.child`是否存在，不存在，进入`complete`函数，进入`complete`中的`while`循环，打印`complete 8`
10. 第十步，，判断`nextNode.sibling`存在，不存在，则将`nextNode.return`赋值给`nextNode`，此时`nextNode === node7`，继续执行`complete`函数中的`while`循环，打印`complete 7`
11. 第十一步，判断`nextNode.sibling`不存在，继续将`nextNode.return`赋值给`nextNode`，此时`nextNode === node4`，继续执行`complete`函数中的`while`循环，打印`complete 4`
12. 第十二步，判断`nextNode.sibling`存在，则将其赋值给`nextNode`，此时`nextNode === node5`，执行`return`，返回到`begin`函数中，进入`begin`函数中执行`while`循环，打印`begin 5`
13. 第十三步，判断`nextNode.child`不存在，执行`complete`函数，进入`while`循环，打印`complete 5`
14. 第十四步，判断`nextNode.sibling`不存在，将`nextNode.return`赋值给`nextNode`，继续执行`while`循环，打印`complete 2`
15. 第十五步，判断`nextNode.sibling`不存在，将`nextNode.return`赋值给`nextNode`，继续执行`while`循环，打印`complete 1`

所以上面的代码会打印下面信息：

```text
begin 1
begin 2
begin 3
complete 3
begin 4
begin 6
complete 6
begin 7
begin 8
complete 8
complete 7
complee 4
begin 5
complete 5
complete 2
complete 1

```

下面是`ReactV18`中关于`Fiber`树遍历相关的代码

```js
function commitPassiveMountEffects(root, finishedWork, committedLanes, committedTransitions) {
    nextEffect = finishedWork;
    commitPassiveMountEffects_begin(finishedWork, root, committedLanes, committedTransitions);
  }

  function commitPassiveMountEffects_begin(subtreeRoot, root, committedLanes, committedTransitions) {
    while (nextEffect !== null) {
      var fiber = nextEffect;
      var firstChild = fiber.child;

      if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && firstChild !== null) {
        firstChild.return = fiber;
        nextEffect = firstChild;
      } else {
        commitPassiveMountEffects_complete(subtreeRoot, root, committedLanes, committedTransitions);
      }
    }
  }

  function commitPassiveMountEffects_complete(subtreeRoot, root, committedLanes, committedTransitions) {
    while (nextEffect !== null) {
      var fiber = nextEffect;

      if ((fiber.flags & Passive) !== NoFlags) {
        setCurrentFiber(fiber);

        try {
          commitPassiveMountOnFiber(root, fiber, committedLanes, committedTransitions);
        } catch (error) {
          captureCommitPhaseError(fiber, fiber.return, error);
        }

        resetCurrentFiber();
      }

      if (fiber === subtreeRoot) {
        nextEffect = null;
        return;
      }

      var sibling = fiber.sibling;

      if (sibling !== null) {
        sibling.return = fiber.return;
        nextEffect = sibling;
        return;
      }

      nextEffect = fiber.return;
    }
  }
```

可以看到其核心是一致的。
