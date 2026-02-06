// 省略掉其他函数以及过程，只进行初始化的渲染过程
var HostRoot = 3;
var ConcurrentRoot = 1;

var NoFlags = 0;
var PerformedWork = 1;
var Placement = 2;
var Update = 4;
var ChildDeletion = 16;
var ContentReset = 32;
var Callback = 64;
var DidCapture = 128;
var ForceClientRender = 256;
var Ref = 512;
var Snapshot = 1024;

var Incomplete = 32768;

function createRoot(container, options) {
  const root = createContainer(container, ConcurrentRoot);
  return new ReactDOMRoot(root);
}


function createContainer(containerInfo, tag) {
  return createFiberRoot(containerInfo, tag);
}

function createFiberRoot(containerInfo, tag) {
  const root = new FiberRootNode(containerInfo, tag);
  const uninitializedFiber = createHostRootFiber(tag);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  return root;
}

function createHostRootFiber(tag) {
  return createFiber(HostRoot, null, null, NoMode);
}
var createFiber = function (tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
};
function FiberRootNode(containerInfo, tag) {
  this.tag = tag;
  this.containerInfo = containerInfo;
  this.current = null;
}
function FiberNode(tag, pendingProps, key, mode) {
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;
  this.lanes = NoLanes;
  this.childLanes = NoLanes;
  this.alternate = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.memoizedState = null;
}
function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}
ReactDOMRoot.prototype.render =
  function (children) {
    const root = this._internalRoot;
    if (root === null) {
      throw new Error('Cannot update an unmounted root.');
    }
    updateContainer(children, root, null, null);
  };

function updateContainer(element, container, parentComponent, callback) {
  const current = container.current;
  const root = current.stateNode;
  const lane = NoLanes;

  // 设置 memoizedState
  current.memoizedState = { element: element };

  if (root !== null) {
    scheduleUpdateOnFiber(root, current, lane);
  }
  return lane;
}

function scheduleUpdateOnFiber(root, fiber, lane) {
  ensureRootIsScheduled(root);
}

function ensureRootIsScheduled(root) {
  performConcurrentWorkOnRoot(root);
}

function performConcurrentWorkOnRoot(root) {
  renderRootSync(root, NoLanes);
  finishConcurrentRender(root, RootDidNotComplete, NoLanes);
}

function finishConcurrentRender(root, exitStatus, lanes) {
  root.finishedWork = root.current.alternate;
  root.finishedLanes = lanes;
  // commitRoot(root);
}

var workInProgress = null;
var current = null;
var workInProgressRoot = null;
var hostRootFiber = null;
function renderRootSync(root, lanes) {
  prepareFreshStack(root, lanes);
  do{
    try {
      workLoopSync();
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
    }
  } while (true);
}

function prepareFreshStack(root, lanes) {
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  workInProgressRoot = root;
  var rootWorkInProgress = createWorkInProgress(root.current, null);
  workInProgress = rootWorkInProgress;
  hostRootFiber = rootWorkInProgress;
  return rootWorkInProgress;
}

function createWorkInProgress(current, pendingProps) {
  var workInProgress = current.alternate;

  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode);
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }


  workInProgress.flags = current.flags & StaticMask;
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;


  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;


  return workInProgress;
}

function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  var current = unitOfWork.alternate;
  setCurrentFiber(unitOfWork);
  const next = beginWork(current, unitOfWork);
  resetCurrentFiber();
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}

function resetCurrentFiber() {
  current = null;
}
function setCurrentFiber(fiber) {
  current = fiber;
}
function beginWork(current, workInProgress, renderLanes) {
  switch(workInProgress.tag) {
    case IndeterminateComponent:
      return mountIndeterminateComponent(current, workInProgress, workInProgress.type, renderLanes);
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    default:
      return null;
  }
}

function mountIndeterminateComponent(_current, workInProgress, Component, renderLanes) {
  var props = workInProgress.pendingProps;
  workInProgress.tag = FunctionComponent;
  var value = Component && Component(props);
  debugger;
  workInProgress.flags |= PerformedWork;
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  reconcileChildren(null, workInProgress, value, renderLanes);

  return workInProgress.child;
}

function updateHostRoot(current, workInProgress, renderLanes) {
  var nextState = workInProgress.memoizedState;
  var nextChildren = nextState.element;
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderLanes);
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);
  }
}
var reconcileChildFibers = ChildReconciler(true);
var mountChildFibers = ChildReconciler(false);

function ChildReconciler(shouldTrackSideEffects) {
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      return;
    }

    var deletions = returnFiber.deletions;

    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion;
    } else {
      deletions.push(childToDelete);
    }
  }

  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) {
      return null;
    }

    var childToDelete = currentFirstChild;

    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }

    return null;
  }

  function useFiber(fiber, pendingProps) {
    // We currently set sibling to null and index to 0 here because it is easy
    // to forget to do before returning it. E.g. for the single child case.
    var clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex;

    if (!shouldTrackSideEffects) {
      newFiber.flags |= Forked;
      return lastPlacedIndex;
    }

    var current = newFiber.alternate;

    if (current !== null) {
      var oldIndex = current.index;

      if (oldIndex < lastPlacedIndex) {
        // This is a move.
        newFiber.flags |= Placement;
        return lastPlacedIndex;
      } else {
        // This item can stay in place.
        return oldIndex;
      }
    } else {
      // This is an insertion.
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    }
  }

  function placeSingleChild(newFiber) {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.flags |= Placement;
    }

    return newFiber;
  }

  function updateTextNode(returnFiber, current, textContent, lanes) {
    if (current === null || current.tag !== HostText) {
      // Insert
      var created = createFiberFromText(textContent, returnFiber.mode, lanes);
      created.return = returnFiber;
      return created;
    } else {
      // Update
      var existing = useFiber(current, textContent);
      existing.return = returnFiber;
      return existing;
    }
  }

  function updateElement(returnFiber, current, element, lanes) {
    var elementType = element.type;

    if (current !== null) {
      if (current.elementType === elementType) {
        var existing = useFiber(current, element.props);
        existing.return = returnFiber;
        return existing;
      }
    }

    var created = createFiberFromElement(element, returnFiber.mode, lanes);
    created.return = returnFiber;
    return created;
  }

  function createChild(returnFiber, newChild, lanes) {
    if (typeof newChild === 'string' && newChild !== '' || typeof newChild === 'number') {
      var created = createFiberFromText('' + newChild, returnFiber.mode, lanes);
      created.return = returnFiber;
      return created;
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            var _created = createFiberFromElement(newChild, returnFiber.mode, lanes);
            _created.return = returnFiber;
            return _created;
          }
      }
    }

    return null;
  }

  function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent, lanes) {
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
      var existing = useFiber(currentFirstChild, textContent);
      existing.return = returnFiber;
      return existing;
    }
    deleteRemainingChildren(returnFiber, currentFirstChild);
    var created = createFiberFromText(textContent, returnFiber.mode, lanes);
    created.return = returnFiber;
    return created;
  }

  function reconcileSingleElement(returnFiber, currentFirstChild, element, lanes) {
    var key = element.key;
    var child = currentFirstChild;

    while (child !== null) {
      if (child.key === key) {
        var elementType = element.type;
        if (child.elementType === elementType) {
          deleteRemainingChildren(returnFiber, child.sibling);
          var existing = useFiber(child, element.props);
          existing.return = returnFiber;
          return existing;
         }
        deleteRemainingChildren(returnFiber, child);
        break;
      } else {
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }

    var _created4 = createFiberFromElement(element, returnFiber.mode, lanes);
    _created4.return = returnFiber;
    return _created4;
  }
  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
    var resultingFirstChild = null;
    var previousNewFiber = null;
    var oldFiber = currentFirstChild;
    var lastPlacedIndex = 0;
    var newIdx = 0;
    var nextOldFiber = null;

    if (oldFiber === null) {
      for (; newIdx < newChildren.length; newIdx++) {
        var _newFiber = createChild(returnFiber, newChildren[newIdx], lanes);

        if (_newFiber === null) {
          continue;
        }

        lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx);

        if (previousNewFiber === null) {
          resultingFirstChild = _newFiber;
        } else {
          previousNewFiber.sibling = _newFiber;
        }

        previousNewFiber = _newFiber;
      }

      return resultingFirstChild;
    }

    return resultingFirstChild;
  }

  function reconcileChildFibers(returnFiber, currentFirstChild, newChild, lanes) {
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, lanes));
      }
    }

    if (typeof newChild === 'string' && newChild !== '' || typeof newChild === 'number') {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, lanes));
    }

    if (Array.isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
    }

    return deleteRemainingChildren(returnFiber, currentFirstChild);
  }

  return reconcileChildFibers;
}

function completeUnitOfWork(unitOfWork) {
  var completedWork = unitOfWork;

  do {
    var current = completedWork.alternate;
    var returnFiber = completedWork.return;

    if(completedWork.flags & Incomplete === NoFlags) {
      setCurrentFiber(completedWork);
      var next = void 0;

      next = completeWork(current, completedWork, subtreeRenderLanes);
      resetCurrentFiber();

      if(next !== null) {
        workInProgress = next;
        return;
      }
    } else {
      if(returnFiber !== null) {
        // 设置父节点的标识为 Incomplete，重置子树的标识位为 NoFlags，删除父节点的 deletions
        returnFiber.flags |= Incomplete;
        returnFiber.subtreeFlags = NoFlags;
        returnFiber.deletions = null;
      } else {
        workInProgress = null;
        return;
      }
    }

    var siblingFiber = completedWork.sibling;
    if(siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}

function completeWork(current, workInProgress, renderLanes) {
  var newProps = workInProgress.pendingProps;
  switch(workInProgress.tag) {
    case HostRoot:
      // return updateHostContainer(current, workInProgress);
      return null;
    case HostComponent:
      {
        var type = workInProgress.type;
        var rootContainerInstance = workInProgressRoot.current;
        if(current !== null && workInProgress.stateNode !== null) {
          updateHostComponent(current, workInProgress, type, newProps)
        } else {
          var instance = createInstance(type, newProps, rootContainerInstance, workInProgress);
          appendAllChildren(instance, workInProgress, false, false);
          workInProgress.stateNode = instance;
        }
      }
    default:
      return null;
  }
}
function shouldSetTextContent(type, props) {
  return type === 'textarea' || type === 'noscript' || typeof props.children === 'string' || typeof props.children === 'number' || typeof props.dangerouslySetInnerHTML === 'object' && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
}

function updateHostComponent(current, workInProgress, type, newProps) {
  var type = workInProgress.type;
  var nextProps = workInProgress.pendingProps;
  var prevProps = current !== null ? current.memoizedProps : null;
  var nextChildren = nextProps.children;

  var isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild) {
    nextChildren = null;
  }
  reconcileChildren(current, workInProgress, nextChildren, NoLanes);
  return workInProgress.child;
}

function  appendAllChildren(parent, workInProgress, needsVisibilityToggle, isHidden) {
  var node = workInProgress.child;

  while (node !== null) {
    // 深度优先遍历，找到类型是 HostComponent 或 HostText 的节点，才并将其添加到父节点中
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
    } else if (node.child !== null) {
      // 如果子节点存在，则将子节点的 return 指针指向当前节点，然后继续遍历子节点
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === workInProgress) {
      return;
    }

    // 如果当前节点没有兄弟节点，则继续遍历父节点
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return;
      }

      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
};

// 一直往后插入子元素
function appendInitialChild(parentInstance, child) {
  parentInstance.appendChild(child);
}

// 定义缺失的常量和变量
var NoMode = 0;
var NoLanes = 0;
var FunctionComponent = 0;
var IndeterminateComponent = 2;
var HostComponent = 5;
var HostText = 6;
var REACT_ELEMENT_TYPE = Symbol.for('react.element');
var StaticMask = 0;
var Forked = 0;
var subtreeRenderLanes = NoLanes;
var RootDidNotComplete = 0;

// 定义缺失的函数（简化版本）
function createFiberFromText(textContent, mode, lanes) {
  var fiber = createFiber(HostText, textContent, null, mode);
  fiber.lanes = lanes;
  return fiber;
}

function createFiberFromElement(element, mode, lanes) {
  var owner = null;
  var type = element.type;
  var key = element.key;
  var pendingProps = element.props;
  var fiber = createFiber(typeof type === 'function' ? IndeterminateComponent : HostComponent, pendingProps, key, mode);
  fiber.elementType = type;
  fiber.type = type;
  fiber.lanes = lanes;
  return fiber;
}

function createInstance(type, props, rootContainerInstance, hostContext) {
  return document.createElement(type);
}

// function commitRoot(root) {
//   var finishedWork = root.finishedWork;
//   if (finishedWork === null) {
//     return;
//   }
  
//   // 简化的提交逻辑：将 fiber 树转换为 DOM
//   commitMutationEffects(root, finishedWork);
// }

// function commitMutationEffects(root, finishedWork) {
//   // 简化的提交：直接提交整个树
//   commitPlacement(finishedWork);
// }

// function commitPlacement(finishedWork) {
//   // 如果是 HostRoot，直接使用容器
//   var parent = null;
//   if (finishedWork.tag === HostRoot) {
//     parent = finishedWork.stateNode.containerInfo;
//   } else {
//     var parentFiber = getHostParentFiber(finishedWork);
//     if (parentFiber) {
//       if (parentFiber.tag === HostRoot) {
//         parent = parentFiber.stateNode.containerInfo;
//       } else {
//         parent = parentFiber.stateNode;
//       }
//     }
//   }
  
//   if (!parent) {
//     return;
//   }
  
//   // 遍历子节点并添加到 DOM
//   var node = finishedWork.child;
//   while (node !== null) {
//     if (node.tag === HostComponent || node.tag === HostText) {
//       if (node.stateNode) {
//         appendInitialChild(parent, node.stateNode);
//       }
//     } else if (node.child !== null) {
//       // 递归处理子节点
//       commitPlacement(node);
//     }
    
//     node = node.sibling;
//   }
// }

// function getHostParentFiber(fiber) {
//   var parent = fiber.return;
//   while (parent !== null) {
//     if (parent.tag === HostComponent || parent.tag === HostRoot) {
//       return parent;
//     }
//     parent = parent.return;
//   }
//   return null;
// }

// function handleError(root, thrownValue) {
//   // 简化的错误处理
//   console.error('Error during render:', thrownValue);
// }

// 定义 React 对象（JSX 转换需要）
var React = {
  createElement: function(type, props, ...children) {
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: props && props.key ? props.key : null,
      props: {
        ...props,
        children: children.length === 1 ? children[0] : children
      }
    };
  }
};

// 定义 ReactDOM 对象
var ReactDOM = {
  createRoot: createRoot
};