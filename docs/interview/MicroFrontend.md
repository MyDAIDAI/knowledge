# 微前端的实现方案

## 产生背景

微前端的产生背景源于传统单体前端架构在大型复杂应用中遇到的瓶颈，以及软件开发组织模式和技术演进的现实需求。以下是其产生的核心背景因素：

1.单体应用的困境

- 膨胀与维护困难： 随着业务增长，前端代码库变得极其庞大（数十万行代码）。开发、构建、测试、部署时间漫长，开发体验差。
- 技术栈锁定： 整个应用必须使用统一的技术栈。难以局部引入新技术（如 React/Vue 的优秀特性）。
- 团队协作耦合： 多个团队在同一个代码库上工作，代码冲突频繁，发布流程相互阻塞，独立发布困难。
- 牵一发而动全身： 修改一个小功能需要重新部署整个应用，风险高，上线周期长。

2.后端微服务架构的成功与启示

- 后端解耦： 微服务将后端拆分为独立部署、维护的小服务，提高了敏捷性和可扩展性。
- 前端的滞后： 后端实现了独立部署和扩展，但前端仍是一个紧耦合的单体，成为交付流程的瓶颈。用户看到的“一个应用”在技术上无法匹配后端服务的独立性。
- 需求： 需要一种类似微服务的思想，将前端应用也按业务功能或团队边界进行垂直拆分，实现“前端服务的独立自治”。

**期望实现**

- 单体前端的冲突： 跨职能团队，希望对自己的功能模块拥有控制权，能够独立开发、测试、部署和运维。
- 微前端的契合： 微前端允许每个团队负责一个或多个独立的子应用（对应其业务领域），拥有技术栈选择权、开发节奏控制权和独立的发布流水线，最大化团队自治。
- 技术选型自由： 不同业务场景可能适合不同技术栈（如复杂后台用 React，营销页面用 Vue，遗留系统是 AngularJS）
- 渐进式升级/重构： 不可能一次性重写庞大的单体应用。微前端允许渐进式迁移，将老应用的部分功能逐步替换为用新技术开发的新子应用，降低风险。
- 实验与创新： 团队可以在其负责的子应用中尝试新技术，不会影响全局。
- 用户期望统一体验： 用户希望访问的是一个无缝集成的完整应用，而不是多个割裂的独立网站
- 独立生命周期： 每个子应用拥有自己的生命周期，可以独立启动、更新、暂停或终止，而不影响其他部分。

### 核心挑战

**应用隔离**
JS 沙箱： 避免全局变量/事件污染
Qiankun 使用 Proxy 实现；Module Federation 依赖规范；Web Components 天然隔离。
CSS 隔离： 避免样式冲突。
方案：Scoped CSS (Vue/Svelte), CSS Modules, Shadow DOM (Web Components), 运行时动态加载卸载样式表 (Qiankun 支持), 命名空间前缀约定。

**路由管理**
容器应用通常负责顶层路由，子应用负责自身内部路由。需解决路由同步、历史记录管理问题。Single-SPA/Qiankun 提供良好集成

**应用通信**

- 基于 Props / Callback：父子应用间直接传递，适合简单场景。
- 自定义事件：window.dispatchEvent/ window.addEventListener简单但全局污染风险。
- 状态管理库： 共享一个 Redux/Mobx/Vuex Store（需解决实例共享和隔离）。或使用EventEmitter等发布订阅库。
- URL / 路由参数： 传递简单数据。
- 浏览器存储： localStorage, sessionStorage（注意命名空间）。
- 专用微前端通信库： 如 qiankun 的 initGlobalState。

**公共依赖共享**
避免重复加载 React/Vue 等大型库。Module Federation 最擅长此道；Qiankun 可通过 externals 配置；其他方案需手动管理或约定版本

**性能优化**

- 按需加载： 路由驱动或懒加载。
- 预加载： 在浏览器空闲时预加载潜在需要的子应用资源（Qiankun 支持）。
- 依赖共享： Module Federation 的核心优势。
- 子应用资源优化： 子应用自身做好代码分割、压缩等。

## 实践方式

### iframe

#### 实现原理

- JS隔离：每个iframe 拥有独立的全局对象（window），天然防止变量冲突
- CSS 隔离：样式仅作用于当前 iframe 内部，无法污染外部
- DOM 隔离：内部 DOM 与主应用完全分离，无选择器冲突风险

#### 通信机制

- 基于 `postMessage` 的安全通信

```ts
// 主应用发送消息
iframe.contentWindow.postMessage(
  { action: 'UPDATE_USER', data: { id: 123 } },
  '<https://child-app.com>' // 安全限制目标域
);

// 子应用接收消息
window.addEventListener('message', (event) => {
  if (event.origin !== '<https://main-app.com>') return; // 验证来源
  if (event.data.action === 'UPDATE_USER') {
    handleUserUpdate(event.data.data);
  }
});

// 基于postMessage实现路由同步
// 主应用监听路由变化 → 同步到子应用
window.addEventListener('popstate', () => {
  const iframe = document.getElementById('micro-app');
  iframe.contentWindow.postMessage({
    type: 'ROUTE_CHANGE',
    path: window.location.pathname.replace('/app', '')
  }, '<https://child-app.com>');
});

// 子应用内部路由变化 → 同步到主应用
window.parent.postMessage({
  type: 'CHILD_ROUTE_CHANGE',
  path: window.location.pathname
}, '<https://main-app.com>');
```

- 共享存储

```ts
// 主应用设置共享数据
localStorage.setItem('sharedData', JSON.stringify({ theme: 'dark' }));

// 子应用读取（需同源或配置CORS）
const data = JSON.parse(localStorage.getItem('sharedData'));
```

- 跨域 `Cookie` 共享
主/子应用同根域（`app.com`与`child.app.com`），设置 `domain=.app.com`

适用场景
1.隔离性需求 > 用户体验需求
2.系统间交互复杂度低
3.无全局状态共享强需求

### Single-SPA

微前端编排框架或“元框架”。它本身不处理具体的技术栈（如 React/Vue/Angular）、资源加载、样式隔离或沙箱，而是专注于应用生命周期的统一管理和基于路由的应用调度。其原理可以概括为以下几个关键点：

#### 1.核心思想：生命周期标准化

核心问题： 如何让不同技术栈开发、独立构建的子应用，能在同一个容器中被协调加载、挂载和卸载
Single-SPA 的解决方案：定义一套统一的、框架无关的生命周期接口。每个微应用（在 Single-SPA 中称为 application 或 parcel  必须实现并导出以下核心生命周期函数：

- `bootstrap(props)`: 初始化。应用首次加载时调用一次（或模块热更新后），用于设置全局副作用（非渲染相关）。应返回 Promise。
- `mount(props)`:  挂载。当路由匹配到该应用时调用。负责渲染 DOM、添加事件监听、启动子应用路由等。应返回Promise
- `unmount(props)`: 卸载。当路由离开该应用时调用。负责清理 DOM、事件监听、取消网络请求、销毁框架实例等。应返回Promise
- `update(props)`: (可选)：更新。主要用于parcel模式，当父应用传递的 props 变化时调用。

#### 2.应用注册与路由映射

注册机制： 容器应用在启动时，通过singleSpa.registerApplication()方法注册所有微应用。

```ts
singleSpa.registerApplication({
    name: 'app1',
    app: () => System.import('@org/app1'), // 动态加载，返回生命周期对象
    activeWhen: location => location.pathname.startsWith('/app1'),
    customProps: { authToken: 'dtyhjk' }
});
```

#### 3.路由驱动与状态切换

- 路由劫持/监听： Single-SPA 的核心single-spa包,接管了浏览器路由（监听 `hashchange`, `popstate`事件）
- 状态机管理： 为每个注册的应用维护一个内部状态机
  - `NOT_LOADED`： 已注册，但尚未加载代码。
  - `LOADING_SOURCE_CODE`： 正在加载应用代码。
  - `NOT_BOOTSTRAPPED`： 代码已加载，但未初始化 (bootstrap 未调用)。
  - `BOOTSTRAPPING`： 正在初始化 (bootstrap 调用中)。
  - `NOT_MOUNTED`： 已初始化，但未挂载 (等待路由激活)。
  - `MOUNTING`： 正在挂载 (mount 调用中)。
  - `MOUNTED`： 已成功挂载，正在运行。
  - `UNMOUNTING`： 正在卸载 (unmount 调用中)。
  - `UNLOADING`： 正在移除 (可选，较少用)。
  - `SKIP_BECAUSE_BROKEN`： 出错。
- 路由变化处理流程：
  - 用户触发导航 (点击链接、前进/后退、`history.pushState` 等)。
  - Single-SPA 检测到 URL 变化。
  - 遍历所有注册应用，根据其 `activityFunction` 判断哪些应用需要激活 (`active`)，哪些需要失活 (`inactive`)。
  - 卸载 (`unmount`) 所有失活的应用 (确保它们清理资源)。
  - 加载 (`load`) 并初始化 (`bootstrap`) 尚未加载/初始化的需激活应用 (如果需要)。
   挂载 (`mount`) 所有需激活的应用 (让它们渲染到 `DOM`)。

#### Qiankun

Qiankun 是基于 Single-SPA 封装的企业级微前端框架，它在 Single-SPA 的“应用生命周期调度”核心能力之上，解决了微前端落地中的关键痛点（资源加载、沙箱隔离、样式隔离、通信机制）。

1.JS沙箱
核心目标：防止子应用污染全局环境（window, document, 事件监听）

- 快照沙箱：全局共享一个window, 在挂载子应用时记录当前环境变量，在卸载时删除当前修改，恢复上次修改

```ts
class SnapshotSandbox {
  activate() {
    this.windowSnapshot = {};
    // 1. 记录当前 window 快照
    for (const key in window) this.windowSnapshot[key] = window[key];
    // 2. 恢复子应用上次的修改
    for (const key in this.modifyPropsMap) window[key] = this.modifyPropsMap[key];
  }
  deactivate() {
    // 3. 记录子应用对 window 的修改
    for (const key in window) {
      if (window[key] !== this.windowSnapshot[key]) {
        this.modifyPropsMap[key] = window[key];
        // 4. 还原全局状态
        window[key] = this.windowSnapshot[key];
      }
    }
  }
}
```

- 代理沙箱：为每个子应用创建虚假的全局对象 `fakeWindow`，通过`Proxy`代理操作，适用于多实例对象

```ts
class ProxySandbox {
  constructor() {
    const rawWindow = window;
    const fakeWindow = {};
    this.proxy = new Proxy(fakeWindow, {
      get(target, key) {
        // 优先返回子应用写入的属性
        return target[key] || rawWindow[key];
      },
      set(target, key, value) {
        target[key] = value; // 写入 fakeWindow
        return true;
      }
    });
  }
}
```

2.CSS隔离
核心问题：避免子应用 CSS 污染主应用或其他子应用。

- 动态样式表（默认方案）
  - 子应用加载时：将 `<link>` 和 `<style>` 标签插入主应用 DOM。
  - 子应用卸载时：移除所有动态添加的样式标签（通过 Qiankun 的记录机制精准清除）
  - 无法解决主应用与子应用、子应用之间的样式冲突
- Shadow DOM 隔离（实验性）
  - 浏览器原生隔离（CSS 和 DOM 均被隔离）。
  - 部分 CSS 选择器（如 :root）失效，弹窗组件需特殊处理。

```ts
export function mount(props) {
  const shadowContainer = props.container.attachShadow({ mode: 'open' });
  render({ element: shadowContainer }); // 将子应用渲染到 Shadow DOM
}
```

- Scoped CSS方案
  - 自动为子应用所有样式规则添加前缀选择器
  - 结合构建工具（如 postcss）或运行时 CSS 解析器动态改写样式

3.应用通信

- 全局状态使用 `initGlobalState`

```ts
// 主应用初始化
const actions = initGlobalState({ user: 'admin' });

// 子应用监听变化
actions.onGlobalStateChange((state, prevState) => {
  console.log('状态变更：', state.user);
});

// 子应用修改状态
actions.setGlobalState({ user: 'guest' });

```

- 自定义事件

```ts
// 主应用派发事件
window.dispatchEvent(new CustomEvent('main-event', { detail: { data: 123 } }));

// 子应用监听
window.addEventListener('main-event', event => {
  console.log('收到事件：', event.detail.data);
});
```

### 模块联邦

Module Federation是 Webpack 5 引入的颠覆性特性，它允许在运行时动态跨应用共享代码模块（组件、函数、状态库等），实现真正的“去中心化”微前端架构。其核心原理围绕 “模块容器” 和 “远程模块解析”。

1.构建时：生成联邦元数据
`Webpack` 在构建阶段为每个启用 `Module Federation` 的应用生成关键信息：

```ts
// webpack.config.js (Remote应用配置)
new ModuleFederationPlugin({
  name: 'app1', // 应用唯一标识
  filename: 'remoteEntry.js', // 入口清单文件
  exposes: { // 暴露的模块
    './Button': './src/components/Button.js',
    './Store': './src/store.js'
  },
  shared: { // 申明可共享依赖
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true }
  }
})

// webpack.config.js (Host应用配置)
new ModuleFederationPlugin({
  remotes: { // 声明依赖的Remote应用
    app1: 'app1@<http://cdn.com/app1/remoteEntry.js>',
    app2: 'app2@<http://cdn.com/app2/remoteEntry.js>'
  },
  shared: ['react', 'react-dom'] // 共享依赖
})
```

2.运行时：动态模块加载流程
当 `Host` 应用执行到需要加载 `Remote` 模块的代码时：

```ts
// Host 运行时动态加载 Remote 入口
import('app1/Button').then(ButtonModule => {
  // 使用 app1 暴露的 Button 组件
});

// Webpack 将 import('app1/Button') 重写为：
// 加载引入app1_remoteEntry.js文件后进行解析
**webpack_require**.e("app1_remoteEntry")
  .then(() => **webpack_require**("app1/Button"))
```

解析并加载目标模块
1.下载 `remoteEntry.js`（通常小于 1KB）
2.解析清单，发现 `Button` 模块对应 `app1_button.js`
3.动态创建 `<script>` 加载 `app1_button.js`
4.执行模块代码，返回导出对象

<https://docs.qq.com/flowchart-addon>

3.模块作用域隔离

- 每个 `Remote` 模块在独立闭包中运行
- 无沙箱污染问题：通过 `Webpack` 的模块系统隔离，而非 `window` 全局变量

4.双向依赖支持

- 不需要依赖中心基座，Host 可消费 Remote 的模块
- Remote 也可反向消费 Host 暴露的模块

### Web Components

核心思想： 将每个微应用封装成一个独立的 `Web Component`（自定义 HTML 元素）。容器应用直接在 HTML 中使用这些自定义标签（如 `<my-app1></my-app1>`）来嵌入子应用。

1.Custom Elements

```ts
class MicroAppElement extends HTMLElement {
  // 元素挂载时（类似 mount）
  connectedCallback() {
    this.renderApp();
  }

  // 元素卸载时（类似 unmount）
  disconnectedCallback() {
    this.cleanup();
  }

  renderApp() {
    // 动态加载子应用资源
    // 渲染框架到 Shadow DOM
    ReactDOM.render(<App />, this.shadowRoot);
  }

  cleanup() {
    // 清理资源
    ReactDOM.unmountComponentAtNode(this.shadowRoot);
  }
}

// 注册自定义元素
customElements.define('micro-app', MicroAppElement);
```

2.Shadow DOM
给DOM添加属性使其转换为 `shadow DOM`，创建封闭的DOM

- CSS完全隔离，不会影响外部
- DOM操作被限制在影子树内
- 外部JavaScript无法直接访问内部元素

```ts
class MicroAppElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }); // 创建隔离容器
  }
}
```

3.HTML Temples(模板)

```ts
<template id="micro-app-tpl">
  <style>
    /* 作用域 CSS */
    .btn { color: red; }
  </style>
  <div class="app-container"></div>
</template>

<script>
  const tpl = document.getElementById('micro-app-tpl');
  this.shadowRoot.appendChild(tpl.content.cloneNode(true));
</script>
```

4.通信机制

- Custom Events（原生事件总线）

```ts
// 子应用内部发送事件
this.dispatchEvent(new CustomEvent('child-event', {
  bubbles: true, // 冒泡穿透 Shadow DOM
  composed: true,
  detail: { data: 123 }
}));

// 主应用监听事件
document.querySelector('micro-app')
  .addEventListener('child-event', e => {
    console.log('收到子应用事件:', e.detail);
  });
```

- Property/Attribute同步

```ts
// 主应用传递数据
const app = document.querySelector('micro-app');
app.setAttribute('user-id', '12345');

// Create a class for the element
class MyCustomElement extends HTMLElement {
  static observedAttributes = ["user-id"];

  constructor() {
    super();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(
      `Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
    );
  }
}

customElements.define("my-custom-element", MyCustomElement);
```

- 共享 Context 对象

```ts
// 主应用创建共享对象
window.appContext = {
  authToken: 'abc123',
  notify: (msg) => console.log(msg)
};

// 子应用安全访问
if (window.appContext) {
  window.appContext.notify('子应用消息');
}
```

5.优化加载

```ts
// 预加载子应用资源
const link = document.createElement('link');
link.rel = 'preload';
link.href = '<https://child.app.com/main.js>';
link.as = 'script';
document.head.appendChild(link);

// 可见时加载
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    this.loadResources();
    observer.disconnect();
  }
});
observer.observe(this);
```
