# 官方文档学习

> 平时只注重于功能以及业务开发，没有去认真的度过官方文档，现在将重读文档的重要内容记录如下

## 快速入门

### 响应事件

可以在组件中声明**事件处理**函数来响应事件，但是不要**调用**事件处理函数，只需要**把函数传递给事件**即可，在用户点击按钮的时候`React`会调用传递的事件处理函数

### 使用Hook

Hook比普通函数更为严格，只能在组件或者其他Hook的**顶层**调用Hook。如果想在一个条件或者循环中使用`useState`，请提取一个新的组件并在组件内部使用

### 组件间共享数据
