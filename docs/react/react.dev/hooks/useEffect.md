# useEffect

>> useEffect is a React Hook that lets you synchronize a component with an external system.

- `Reference`： `useEffect(setup, dependencies?)`

**核心要点**：

- setup函数：这是useEffect的第一个参数，即包含副作用逻辑的函数。它可以可选地返回一个清理函数（cleanup function）。
- 执行时机：
  - 当组件提交（commit）到DOM后，React会运行setup函数。
  - 在每次依赖项发生变化并提交后，React会先运行清理函数（如果提供了），然后再运行setup函数。
  - 当组件从DOM中移除时，React会运行清理函数。

**详细解释**：

1. 组件提交（commit）时运行setup函数
在React中，组件的生命周期包括渲染（render）和提交（commit）阶段。提交阶段是指React将渲染好的虚拟DOM更新到实际DOM的过程。
当组件首次渲染（mount）和每次更新（update）时，在提交到DOM后，React会运行useEffect中的setup函数。
2. 依赖项变化时的行为
useEffect可以接受一个依赖项数组作为第二个参数。当依赖项发生变化时，useEffect会重新执行。
具体过程：在每次提交（commit）并且依赖项发生变化时，React会先执行清理函数（如果存在），然后再执行setup函数。
清理函数会使用旧的依赖值执行，而setup函数会使用新的依赖值执行。这确保了清理函数可以清理上一次副作用留下的资源，避免内存泄漏。
3. 组件卸载时的行为
当组件从DOM中移除（卸载）时，React会执行清理函数。这是为了确保在组件销毁时，清理所有副作用（如订阅、定时器等）。
