var HostRoot = 3;
var ConcurrentRoot = 1;
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
  const update = createUpdate(eventTime, lane);
  update.payload = {
    element: element
  };

  const current = container.current;
  const root = enqueueUpdate(current$1, update, lane);

  if (root !== null) {
    scheduleUpdateOnFiber(root, current$1, lane, eventTime);
  }
  return lane;
}

function scheduleUpdateOnFiber(root, fiber, lane, eventTime) {
  ensureRootIsScheduled(fiber, lane, eventTime);
}