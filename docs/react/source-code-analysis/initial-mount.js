// 省略掉其他函数以及过程，只看HostComponent的挂载过程
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
  return createFiber(tag, null, null, NoMode);
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
}
function ReactDOMRoot(internalRoot: FiberRoot) {
  this._internalRoot = internalRoot;
}
ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render =
  function (children: ReactNodeList): void {
    const root = this._internalRoot;
    if (root === null) {
      throw new Error('Cannot update an unmounted root.');
    }
    updateContainer(children, root, null, null);
  };

function updateContainer(element, container, parentComponent, callback) {

  const current = container.current;
  const root =  current.stateNode;

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
}

var workInProgress = null;
var current = null;
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

  return rootWorkInProgress;
}

function createWorkInProgress(current, pendingProps) {
  var workInProgress = current.alternate;

  if (workInProgress === null) {
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other" unused
    // node that we're free to reuse. This is lazily created to avoid allocating
    // extra objects for things that are never updated. It also allow us to
    // reclaim the extra memory if needed.
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode);
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps; // Needed because Blocks store data on type.
    workInProgress.type = current.type; // We already have an alternate.
    // Reset the effect tag.
    workInProgress.flags = NoFlags; // The effects are no longer valid.
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
  // Already timed out, so perform work without checking if we need to yield.
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  // The current, flushed, state of this fiber is the alternate. Ideally
  // nothing should rely on this, but relying on it here means that we don't
  // need an additional field on the work in progress.
  var current = unitOfWork.alternate;
  setCurrentFiber(unitOfWork);
  const next = beginWork(current, unitOfWork);
  resetCurrentFiber();
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    // If this doesn't spawn new work, complete the current work.
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
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    default:
      return null;
  }
}

function updateHostRoot(current, workInProgress, renderLanes) {
  var nextState = workInProgress.memoizedState;
  var nextChildren = nextState.element;
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
  if (current === null) {
    // If this is a fresh new component that hasn't been rendered yet, we
    // won't update its child set by applying minimal side-effects. Instead,
    // we will add them all to the child before it gets rendered. That means
    // we can optimize this reconciliation pass by not tracking side-effects.
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderLanes);
  } else {
    // If the current child is the same as the work in progress, it means that
    // we haven't yet started any work on these children. Therefore, we use
    // the clone algorithm to create a copy of all the current children.
    // If we had any progressed work already, that is invalid at this point so
    // let's throw it out.
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
    return deleteRemainingChildren(returnFiber, currentFirstChild);
  }

  return reconcileChildFibers;
}

function completeUnitOfWork() {
}