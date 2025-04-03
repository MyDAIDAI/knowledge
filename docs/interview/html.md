# `HTML`相关面试题

## `What does a doctype do?`, `doctype`是做什么的？

HTML 的 `<!DOCTYPE>` 声明（文档类型声明）是每个 HTML 文档**必须包含的第一行代码**，它的核心作用是**告知浏览器如何正确解析和渲染页面**。以下是其详细作用与功能：

---

### **1. 指定 HTML 版本**

- **明确文档标准**：`<!DOCTYPE>` 告诉浏览器当前页面遵循的 HTML 或 XHTML 规范。例如：

  - **HTML5**：`<!DOCTYPE html>`（简洁且无需版本号）。
  - **HTML4.01**：需引用 DTD（文档类型定义），如严格模式：

    ```html
    <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
    ```

  - **XHTML**：需包含 XML 命名空间，如：

    ```html
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    ```

---

### **2. 触发浏览器的「标准模式」**

- **避免怪异模式（Quirks Mode）**：  
  如果省略 `<!DOCTYPE>`，浏览器会进入**怪异模式**，以兼容早期非标准代码。此模式下：
  - 盒模型（Box Model）计算错误（如 `width` 包含内边距和边框）。
  - 某些 CSS 样式（如 `margin: auto` 居中）失效。
  - 旧版 JavaScript API 可能被启用。
- **标准模式（Standards Mode）**：  
  正确声明 `<!DOCTYPE>` 后，浏览器遵循 W3C 标准渲染页面，确保布局和功能的一致性。

---

### **3. 辅助验证工具与解析器**

- **历史作用**：旧版 HTML 依赖 DTD 验证文档结构（如标签嵌套是否合法）。现代 HTML5 已简化此过程，但验证工具仍可能参考 `<!DOCTYPE>`。
- **现代意义**：HTML5 的 `<!DOCTYPE html>` 去除了复杂的 DTD 引用，直接声明文档遵循最新标准。

---

### **注意事项**

1. **必须位于文档首行**：`<!DOCTYPE>` 前不能有任何内容（包括空格或注释）。
2. **HTML5 的简化写法**：仅需 `<!DOCTYPE html>`，且不区分大小写（如 `<!doctype html>` 也有效）。
3. **跨浏览器兼容性**：正确使用可减少不同浏览器渲染差异。

---

### **示例代码**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>标准 HTML5 页面</title>
  </head>
  <body>
    <p>这是一个符合标准的页面。</p>
  </body>
</html>
```

---

### **总结**

- **核心功能**：定义文档标准、触发标准渲染模式、辅助验证。
- **开发者价值**：确保页面按预期渲染，避免布局“玄学问题”。
- **现代实践**：始终使用 `<!DOCTYPE html>`（HTML5 声明），无需其他复杂配置。

## `How do you serve a page with content in multiple languages?` 如何配置多语言页面的内容？

配置多语言页面需要结合 **前端结构、后端逻辑、SEO 优化** 和 **用户体验设计**，以下是详细的实现方案：

---

### **一、基础配置**

#### 1. **声明页面语言**

- **HTML 根标签**：使用 `lang` 属性声明主语言

  ```html
  <html lang="zh-CN">
    <!-- 主语言为简体中文 -->
  </html>
  ```

- **局部覆盖**：为特定内容块设置其他语言

  ```html
  <div lang="en">
    <p>This paragraph is in English.</p>
  </div>
  ```

#### 2. **HTTP 头部声明**

- 通过 `Content-Language` 标头告知浏览器页面支持的语言：

  ```http
  Content-Language: zh-CN, en, ja
  ```

---

### **二、URL 结构设计**

#### 1. **路径模式（推荐）**

- **示例**：

  ```
  https://example.com/zh/about    # 中文
  https://example.com/en/about    # 英文
  https://example.com/ja/about    # 日文
  ```

- **实现方式**：
  - **静态站点**：为每种语言创建独立目录（如 `/zh/`, `/en/`）。
  - **动态站点**：通过路由参数处理（如 `/about?lang=zh`）。

#### 2. **子域名模式**

- **示例**：

  ```
  https://zh.example.com/about    # 中文子域名
  https://en.example.com/about    # 英文子域名
  ```

- **优点**：SEO 友好，语言隔离清晰。
- **缺点**：需配置多域名和 SSL 证书。

---

### **三、服务器端处理**

#### 1. **自动语言重定向**

- **逻辑**：根据 `Accept-Language` 请求头自动跳转到对应语言版本。
- **代码示例（Node.js）**：

  ```javascript
  app.get("/", (req, res) => {
    const acceptLanguage = req.headers["accept-language"];
    const userLang = acceptLanguage?.split(",")[0] || "en";
    res.redirect(`/${userLang}/home`);
  });
  ```

#### 2. **多语言资源加载**

- **JSON 文件管理翻译内容**：

  ```
  /locales
    ├─ en.json
    ├─ zh.json
    └─ ja.json
  ```

- **动态加载示例**：

  ```javascript
  fetch(`/locales/${userLang}.json`)
    .then((response) => response.json())
    .then((translations) => renderPage(translations));
  ```

---

### **四、前端动态切换**

#### 1. **语言切换器**

- **UI 组件**：下拉菜单或按钮组

  ```html
  <select id="lang-switcher">
    <option value="zh">中文</option>
    <option value="en">English</option>
    <option value="ja">日本語</option>
  </select>
  ```

- **逻辑实现**：

  ```javascript
  document.getElementById("lang-switcher").addEventListener("change", (e) => {
    const lang = e.target.value;
    window.location.href = `/${lang}${window.location.pathname}`;
  });
  ```

#### 2. **持久化用户偏好**

- **Cookie 或 localStorage**：

  ```javascript
  // 存储用户选择
  localStorage.setItem("preferredLang", "zh");
  // 读取时优先使用用户设置
  const lang = localStorage.getItem("preferredLang") || navigator.language;
  ```

---

### **五、SEO 优化**

#### 1. **`hreflang` 标注**

- 在 `<head>` 中声明多语言页面的关系：

  ```html
  <link rel="alternate" hreflang="zh" href="https://example.com/zh/about" />
  <link rel="alternate" hreflang="en" href="https://example.com/en/about" />
  <link
    rel="alternate"
    hreflang="x-default"
    href="https://example.com/en/about"
  />
  ```

#### 2. **规范链接（Canonical URL）**

- 避免重复内容惩罚：

  ```html
  <link rel="canonical" href="https://example.com/zh/about" />
  ```

---

### **六、开发工具与框架**

#### 1. **静态站点生成器**

- **Hugo**：原生多语言支持，通过 `config.toml` 配置：

  ```toml
  [languages.zh]
  languageName = "中文"
  weight = 1
  [languages.en]
  languageName = "English"
  weight = 2
  ```

- **Jekyll**：使用 `_data` 文件夹管理翻译内容。

#### 2. **前端国际化库**

- **i18next**（React/Vue/Angular 通用）：

  ```javascript
  import i18n from "i18next";
  i18n.init({
    lng: "zh",
    resources: {
      en: { translation: { welcome: "Welcome!" } },
      zh: { translation: { welcome: "欢迎！" } },
    },
  });
  ```

- **React Intl**：专为 React 设计的库，支持复数、日期格式化等。

---

### **七、测试与验证**

#### 1. **浏览器模拟**

- **Chrome DevTools**：  
  `F12 → Sensors → Override` 中模拟不同语言环境。
- **多语言内容检查**：  
  确保文字溢出、字体支持、RTL（如阿拉伯语）布局正常。

#### 2. **SEO 检查工具**

- **Google Search Console**：验证 `hreflang` 标注是否正确。
- **Ahrefs/Screaming Frog**：抓取多语言页面结构。

---

### **八、完整示例（React + i18next）**

```javascript
// 1. 初始化 i18n
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { title: "Hello World" } },
    zh: { translation: { title: "你好，世界" } },
  },
  lng: localStorage.getItem("lang") || "en",
});

// 2. 语言切换组件
function LanguageSwitcher() {
  return (
    <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
  );
}

// 3. 使用翻译内容
function App() {
  return <h1>{i18n.t("title")}</h1>;
}
```

---

### **九、注意事项**

1. **翻译一致性**：专业翻译避免机器直译，尤其是专业术语。
2. **动态内容处理**：如日期、货币、单位需本地化（如 `Intl.DateTimeFormat`）。
3. **性能优化**：按需加载语言包，避免首次加载过慢。
4. **无障碍（A11Y）**：为语言切换按钮添加 `aria-label`。

通过以上方案，可实现高效、可维护的多语言页面，兼顾用户体验和搜索引擎友好性。

## What are data- attributes good for? `data-`属性有什么好处？

`data-*` 属性是 HTML5 中用于在 HTML 元素上**存储自定义数据**的标准方式。它们为开发者提供了一种灵活且符合标准的机制，用于关联与 DOM 元素相关的额外信息。以下是其核心用途和优势：

---

### **1. 存储与 DOM 关联的私有数据**

- **场景**：保存元素的状态、配置或元数据，无需暴露给用户或影响渲染。
- **示例**：

  ```html
  <button data-modal-id="userProfile" data-action="open" data-theme="dark">
    Open Profile
  </button>
  ```

  通过 `data-*` 属性存储按钮控制的弹窗 ID、操作类型和主题样式。

---

### **2. 在 JavaScript 中快速访问数据**

- **直接访问**：通过 `element.dataset` API 读取或修改数据。

  ```javascript
  const button = document.querySelector("button");
  console.log(button.dataset.modalId); // "userProfile"
  button.dataset.theme = "light"; // 动态更新数据
  ```

- **兼容性**：所有现代浏览器均支持 `dataset` 属性。

---

### **3. 与 CSS 交互实现动态样式**

- **基于数据的样式控制**：通过 CSS 属性选择器，根据 `data-*` 值应用样式。

  ```css
  button[data-theme="dark"] {
    background: #333;
    color: white;
  }
  button[data-action="close"]::after {
    content: "×";
  }
  ```

---

### **4. 增强代码可读性和维护性**

- **语义化**：通过命名清晰的 `data-*` 属性，明确元素用途（如 `data-toggle="collapse"`）。
- **替代方案对比**：
  - **不推荐**：用隐藏的 `<input>` 或非标准属性（如 `custom-data`）存储数据。
  - **推荐**：使用 `data-*` 符合标准，避免潜在冲突。

---

### **5. 框架集成与状态管理**

- **前端框架**：React、Vue 等框架利用 `data-*` 属性传递组件状态或配置。

  ```jsx
  // React 示例
  <div data-testid="user-list" data-visible={isVisible}>
    {users.map((user) => (
      <User data-user-id={user.id} />
    ))}
  </div>
  ```

- **测试工具**：测试库（如 Testing Library）推荐用 `data-testid` 定位元素，避免依赖不稳定的 CSS 类名。

---

### **6. 支持复杂交互逻辑**

- **动态内容加载**：存储 AJAX 请求所需的参数。

  ```html
  <div data-endpoint="/api/comments" data-page="2" data-sort-by="date"></div>
  ```

- **事件委托**：通过 `data-*` 识别事件来源。

  ```javascript
  document.addEventListener("click", (e) => {
    if (e.target.dataset.action === "delete") {
      deleteItem(e.target.dataset.itemId);
    }
  });
  ```

---

### **7. 避免全局变量污染**

- **数据隔离**：将数据直接绑定到相关元素，而非存储在全局对象中。
- **示例对比**：

  ```html
  <!-- 不推荐：全局变量 -->
  <script>
    let currentPage = 2;
  </script>

  <!-- 推荐：data-* 属性 -->
  <div data-current-page="2"></div>
  ```

---

### **8. 注意事项**

- **命名规范**：仅使用小写字母和连字符（如 `data-user-id`，而非 `data-userID`）。
- **数据类型**：值始终为字符串，复杂数据需序列化（如 JSON）：

  ```html
  <div data-user='{"id":123, "name":"John"}'></div>
  ```

  ```javascript
  const user = JSON.parse(element.dataset.user);
  ```

- **性能**：避免滥用，大量 `data-*` 属性可能影响 DOM 性能。

---

### **典型应用场景**

1. **UI 组件配置**（如轮播图分页参数）。
2. **表单验证规则**（如 `data-validate="email"`）。
3. **国际化**（存储翻译键 `data-i18n="welcome_message"`）。
4. **埋点与统计**（记录交互事件 `data-track="click"`）。

---

通过合理使用 `data-*` 属性，可以显著提升代码的可维护性、可读性，同时确保遵循 Web 标准。

## the difference betwee a cookie, sessionStorge and localStorge

The differences between cookies, `sessionStorage`, and `localStorage` can be categorized by their **storage capacity**, **lifespan**, **scope**, **server interaction**, and **use cases**. Here's a structured breakdown:

---

### **1. Storage Capacity**

| Type               | Capacity            |
| ------------------ | ------------------- |
| **Cookies**        | ~4 KB per cookie    |
| **localStorage**   | ~5-10 MB per origin |
| **sessionStorage** | ~5-10 MB per origin |

- **Cookies** are limited and sent with every HTTP request, so they’re ideal for small data like session IDs.
- **Web Storage** (`localStorage`/`sessionStorage`) is designed for larger client-side data.

---

### **2. Lifespan**

| Type               | Persistence                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| **Cookies**        | Expires based on `Expires` or `Max-Age` attribute (or deleted manually). |
| **localStorage**   | Persists until explicitly cleared (survives browser restarts).           |
| **sessionStorage** | Cleared when the **tab/browser is closed** (tied to a page session).     |

---

### **3. Scope**

| Type               | Accessibility                                                                     |
| ------------------ | --------------------------------------------------------------------------------- |
| **Cookies**        | Sent to the server for **matching domain/path** (configurable via attributes).    |
| **localStorage**   | Shared across **all tabs/windows** of the same origin (protocol + domain + port). |
| **sessionStorage** | Isolated to the **specific tab** that created it (other tabs won’t share it).     |

---

### **4. Server Interaction**

| Type               | Sent to Server?                                    | Client/Server Access                                 |
| ------------------ | -------------------------------------------------- | ---------------------------------------------------- |
| **Cookies**        | Yes (with every HTTP request via `Cookie` header). | Both server (reads cookies) and client (JavaScript). |
| **localStorage**   | No                                                 | Client-side only (JavaScript API).                   |
| **sessionStorage** | No                                                 | Client-side only (JavaScript API).                   |

---

### **5. Security**

| Type               | Key Risks & Protections                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Cookies**        | - Vulnerable to CSRF (mitigated via `SameSite` attribute).<br>- Secure with `HttpOnly` (blocks JS access) and `Secure` (HTTPS-only). |
| **localStorage**   | - Accessible via JavaScript, making it vulnerable to XSS attacks.                                                                    |
| **sessionStorage** | - Same risks as `localStorage` (XSS vulnerabilities).                                                                                |

---

### **6. API & Syntax**

| Type               | Example Code                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| **Cookies**        | `js<br>document.cookie = "user=John; expires=Fri, 31 Dec 2023 23:59:59 GMT; path=/";<br>`          |
| **localStorage**   | `js<br>localStorage.setItem('theme', 'dark');<br>const theme = localStorage.getItem('theme');<br>` |
| **sessionStorage** | `js<br>sessionStorage.setItem('formData', JSON.stringify(data));<br>`                              |

---

### **7. Typical Use Cases**

| Type               | When to Use                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **Cookies**        | - Authentication tokens (e.g., `session-id`).<br>- Tracking user activity (e.g., GDPR consent). |
| **localStorage**   | - Persistent user preferences (e.g., dark mode).<br>- Offline data caching.                     |
| **sessionStorage** | - Temporary form data during multi-page navigation.<br>- Single-tab state (e.g., wizard steps). |

---

### **Summary Table**

| Feature            | Cookies                 | localStorage           | sessionStorage    |
| ------------------ | ----------------------- | ---------------------- | ----------------- |
| **Capacity**       | ~4 KB                   | ~5-10 MB               | ~5-10 MB          |
| **Lifespan**       | Configurable expiration | Until manually deleted | Tab/window closed |
| **Scope**          | Domain/path-specific    | Origin-wide            | Tab-specific      |
| **Sent to Server** | Yes                     | No                     | No                |
| **XSS Risk**       | Lower (with `HttpOnly`) | High                   | High              |

By understanding these distinctions, you can choose the right storage mechanism for your application’s needs.

## Describe the difference between `<script>`, `<script async>` and `<script defer>`

The `<script>`, `<script async>`, and `<script defer>` attributes control how JavaScript files are loaded and executed in an HTML document, impacting page rendering and script execution order. Here’s a breakdown:

---

### **1. `<script>` (Standard Behavior)**

- **Download**: Blocks HTML parsing until the script is fully downloaded.
- **Execution**: Executes immediately after download, halting parsing.
- **Order**: Scripts run in the order they appear in the document.
- **Use Case**: Critical scripts that must run first (e.g., scripts that modify the DOM needed for initial rendering).
- **Example**:

  ```html
  <script src="critical.js"></script>
  ```

---

### **2. `<script async>` (Asynchronous)**

- **Download**: Fetches the script **asynchronously** (in parallel with HTML parsing).
- **Execution**: Executes **as soon as it’s downloaded**, pausing HTML parsing.
- **Order**: **No guaranteed execution order** (scripts run as they finish downloading).
- **Use Case**: Independent scripts where timing doesn’t matter (e.g., analytics, ads).
- **Example**:

  ```html
  <script async src="analytics.js"></script>
  ```

---

### **3. `<script defer>` (Deferred)**

- **Download**: Fetches the script **asynchronously** without blocking parsing.
- **Execution**: Waits to run until **after HTML parsing is complete** (before `DOMContentLoaded`).
- **Order**: Executes scripts **in document order**, even if downloaded out of sequence.
- **Use Case**: Scripts that depend on the full DOM or other scripts (e.g., libraries, main app logic).
- **Example**:

  ```html
  <script defer src="library.js"></script>
  <script defer src="app.js"></script>
  <!-- Runs after library.js -->
  ```

---

### **Comparison Table**

| Attribute  | Download Behavior       | Execution Timing         | Order Guarantee | Ideal Use Case                 |
| ---------- | ----------------------- | ------------------------ | --------------- | ------------------------------ |
| `<script>` | Blocks parsing          | Immediate                | Yes             | Critical, render-blocking code |
| `async`    | Parallel (non-blocking) | Immediate after download | No              | Independent scripts            |
| `defer`    | Parallel (non-blocking) | After HTML parsing       | Yes             | DOM-dependent or ordered code  |

---

### **Key Notes**

- **Inline Scripts**: `async`/`defer` **do nothing** for scripts without `src`.
- **DOMContentLoaded**: `defer` scripts run before this event; `async` may run before or after.
- **Legacy Browsers**: Some older browsers ignore `async`/`defer` and treat them as standard `<script>`.
- **Dynamic Scripts**: Scripts added via JavaScript (e.g., `document.createElement('script')`) default to `async` unless `async=false` is set.

---

### **Best Practices**

- Place non-critical scripts at the **end of `<body>`** if not using `async`/`defer`.
- Use `defer` for scripts that rely on the full DOM or need execution order preserved.
- Use `async` for scripts that don’t depend on anything else (e.g., third-party widgets).

By choosing the right loading strategy, you optimize page speed and ensure scripts behave as expected.

## Why is it generally a good idea to position CSS `<link>`s between `<head></head>` and JS `<script>`s just before `</body>`? Do you know any exceptions?

将 CSS `<link>` 放在 `<head>` 中，而将 JS `<script>` 放在 `</body>` 之前，主要是为了优化**页面渲染性能**和**用户体验**。以下是详细解释及例外情况：

---

### **一、为什么这样做？**

#### **1. CSS `<link>` 放在 `<head>` 中**

- **避免 FOUC（无样式内容闪烁）**：  
  浏览器需先加载 CSS 再渲染页面。若 CSS 在底部，用户可能先看到未样式化的 HTML，随后突然应用样式，导致视觉闪烁。
- **并行加载**：  
  CSS 不会阻塞 HTML 解析，但会阻塞渲染（直到 CSSOM 构建完成）。将 CSS 放在 `<head>` 中可尽早启动下载，减少渲染阻塞时间。

#### **2. JS `<script>` 放在 `</body>` 前**

- **防止阻塞 HTML 解析**：  
  浏览器遇到 `<script>`（无 `async/defer`）会暂停解析 HTML，直到脚本下载并执行完毕。放在末尾可确保页面内容优先渲染。
- **DOM 访问安全**：  
  脚本执行时，DOM 已完全解析，避免因元素未加载而报错（如 `document.getElementById` 找不到元素）。

---

### **二、例外情况**

#### **1. 需要提前加载的 JS**

- **关键功能依赖**：  
  若脚本需在页面渲染前执行（如性能监控、A/B 测试），可使用 `async` 或 `defer` 异步加载：

  ```html
  <head>
    <script async src="analytics.js"></script>
    <!-- 异步加载，不阻塞 -->
    <script defer src="framework.js"></script>
    <!-- 延迟到 HTML 解析后执行 -->
  </head>
  ```

- **动态注入内容**：  
  如使用 `document.write`（已不推荐）或服务端渲染（SSR）时，需提前加载脚本。

#### **2. 非关键 CSS**

- **非首屏样式**：  
  对非关键 CSS（如弹窗、懒加载内容）使用媒体查询或异步加载：

  ```html
  <!-- 仅在打印时加载 -->
  <link rel="stylesheet" href="print.css" media="print" />

  <!-- 异步加载非关键 CSS -->
  <link
    rel="preload"
    href="non-critical.css"
    as="style"
    onload="this.rel='stylesheet'"
  />
  <noscript><link rel="stylesheet" href="non-critical.css" /></noscript>
  ```

#### **3. 性能优化策略**

- **关键 CSS 内联**：  
  将首屏关键 CSS 内联到 `<head>` 中，减少 HTTP 请求：

  ```html
  <style>
    /* 内联关键样式 */
    .header {
      color: #333;
    }
  </style>
  ```

- **预加载关键资源**：  
  使用 `<link rel="preload">` 提前加载关键 JS/CSS：

  ```html
  <head>
    <link rel="preload" href="main.js" as="script" />
    <link rel="preload" href="styles.css" as="style" />
  </head>
  ```

---

### **三、现代最佳实践**

1. **优先使用 `async/defer`**：

   - `async`：脚本下载完成后立即执行（不保证顺序）。
   - `defer`：脚本在 HTML 解析完成后按顺序执行。

   ```html
   <head>
     <script async src="ads.js"></script>
     <!-- 独立脚本（如广告） -->
     <script defer src="main.js"></script>
     <!-- 依赖 DOM 的脚本 -->
   </head>
   ```

2. **HTTP/2 服务器推送**：  
   对于关键资源（如 CSS/JS），服务器可主动推送，减少延迟。

3. **代码分割（Code Splitting）**：  
   使用 Webpack 等工具拆分代码，按需加载非关键 JS。

---

### **总结**

- **默认规则**：CSS 置顶，JS 置底——确保快速渲染和交互。
- **例外场景**：异步加载、关键资源优化、性能调优。
- **现代优化**：利用 `async/defer`、预加载、代码分割提升性能。

遵循这些原则，能在绝大多数场景下优化加载性能，同时灵活应对特殊需求。

## What is progressive rendering? 什么是渐进式渲染？

渐进式渲染（Progressive Rendering）是一种优化网页加载性能的策略，其核心思想是**优先展示用户可见的关键内容**，随后逐步加载和渲染非关键资源，以提升用户感知速度和交互体验。以下是其核心原理、技术实现与典型应用场景：

---

### **一、核心原理**

- **关键渲染路径优先**：优先加载并渲染首屏内容（Above the Fold），减少用户等待时间。
- **分阶段加载**：将页面拆分为多个区块，按优先级分批加载，避免一次性加载所有资源。
- **流式传输**：服务器分块（Chunked）传输 HTML/CSS，浏览器逐步解析渲染。

---

### **二、技术实现**

#### **1. 服务端策略**

- **分块输出（Chunked Transfer Encoding）**：  
  服务器将 HTML 拆分为多个片段（如头部、主体、尾部），逐步发送到浏览器。

  ```html
  <!-- 首屏内容 -->
  <!DOCTYPE html>
  <html>
    <head>
      ...
    </head>
    <body>
      <div id="header">...</div>
      <div id="main-content">...</div>
      <!-- 后续内容由服务器流式推送 -->
    </body>
  </html>
  ```

- **服务端渲染（SSR）优先关键内容**：  
  动态生成首屏 HTML，异步加载剩余数据（如评论、推荐列表）。

#### **2. 前端优化**

- **懒加载（Lazy Loading）**：  
  延迟加载图片、视频、非关键脚本：

  ```html
  <img src="placeholder.jpg" data-src="real-image.jpg" loading="lazy" />
  ```

  ```javascript
  // Intersection Observer API 实现
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });
  ```

- **占位符（Skeleton Screens）**：  
  用 CSS 或 SVG 绘制加载骨架，缓解内容加载前的空白。

  ```html
  <div class="skeleton" style="width: 100%; height: 200px;"></div>
  ```

- **代码分割（Code Splitting）**：  
  使用 Webpack 等工具拆分 JavaScript，按需加载路由或组件：

  ```javascript
  // React 动态导入
  const Comments = React.lazy(() => import("./Comments"));
  ```

#### **3. 资源优先级控制**

- **预加载关键资源**：

  ```html
  <link rel="preload" href="critical.css" as="style" />
  <link rel="preload" href="main.js" as="script" />
  ```

- **异步非关键脚本**：

  ```html
  <script async src="analytics.js"></script>
  ```

---

### **三、应用场景**

1. **长列表/瀑布流**（如社交媒体动态）：  
   优先渲染前 10 条内容，滚动时加载后续条目。

2. **电商产品页**：  
   优先展示图片、价格、购买按钮，延迟加载用户评论、推荐商品。

3. **新闻网站**：  
   首屏输出文章主体，异步加载广告、相关新闻。

---

### **四、优势与挑战**

#### **优势**

- **更快的首屏时间（FCP）**：用户更快看到可交互内容。
- **降低跳出率**：减少用户因等待而离开的概率。
- **节省带宽**：减少非必要资源的传输。

#### **挑战**

- **SEO 风险**：异步加载内容可能不被搜索引擎抓取（需结合 SSR 或预渲染）。
- **布局偏移（CLS）**：动态加载内容可能导致页面抖动（需预留占位空间）。
- **状态管理复杂性**：异步加载可能破坏数据依赖顺序。

---

### **五、工具与最佳实践**

- **性能监控**：使用 Lighthouse、WebPageTest 评估优化效果。
- **框架支持**：
  - **Next.js**：自动代码分割 + 流式渲染。
  - **Vue/Nuxt.js**：`<client-only>` 组件延迟加载非关键模块。
- **CDN 边缘计算**：通过边缘节点动态优化内容分发。

---

### **总结**

渐进式渲染通过**分阶段加载、流式传输和资源优先级控制**，在资源有限的环境下最大化用户体验。它尤其适合内容密集型网站（如媒体、电商），但需结合具体场景平衡性能与功能完整性。

## `canvas`与`svg`的区别

Canvas 和 SVG 是两种在网页上绘制图形的技术，但它们在实现方式、适用场景及特性上有显著区别。以下是详细的对比：

---

### **1. 核心原理**

| **特性**     | **Canvas**                                                            | **SVG**                                                          |
| ------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **类型**     | **位图（栅格图形）**：基于像素绘制，放大后会失真。                    | **矢量图形**：基于数学公式描述形状，无限缩放不失真。             |
| **渲染方式** | 通过 JavaScript 动态生成像素，需要逐帧绘制。                          | 通过 XML 标签定义图形，浏览器解析后渲染。                        |
| **DOM 结构** | 单元素：整个 Canvas 是 `<canvas>` 一个节点，内部图形无独立 DOM 元素。 | 多元素：每个图形（如 `<rect>`、`<circle>`）都是独立的 DOM 节点。 |

---

### **2. 性能与适用场景**

| **场景**     | **Canvas**                                                       | **SVG**                                                            |
| ------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| **动态内容** | 高性能：适合频繁更新的动态图形（如游戏、实时数据可视化、动画）。 | 性能较低：DOM 操作开销大，不适合大量动态元素。                     |
| **复杂度**   | 处理大量元素更高效（如粒子效果、图像滤镜）。                     | 元素过多时性能下降（如超过 1000 个独立形状）。                     |
| **交互性**   | 需手动实现交互（如点击检测），适合简单交互或全屏操作。           | 原生支持事件绑定（如点击、悬停），适合复杂交互（如图表工具提示）。 |

---

### **3. 开发与维护**

| **特性**       | **Canvas**                                     | **SVG**                                                       |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| **开发方式**   | 代码驱动：需编写 JavaScript 控制绘制逻辑。     | 声明式：通过 XML/CSS 定义图形，直观易调试。                   |
| **可访问性**   | 默认不可访问：需额外 ARIA 标签辅助屏幕阅读器。 | 原生可访问：文本和图形可直接被搜索引擎和辅助工具解析。        |
| **SEO 友好性** | 不支持：绘制内容无法被搜索引擎抓取。           | 支持：文本和结构可被索引，适合需要 SEO 的图形（如信息图表）。 |

---

### **4. 代码示例**

#### **Canvas（绘制蓝色矩形）**

```html
<canvas id="myCanvas" width="200" height="200"></canvas>
<script>
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "blue";
  ctx.fillRect(10, 10, 100, 100); // 坐标 (10,10) 处绘制 100x100 矩形
</script>
```

#### **SVG（绘制蓝色矩形）**

```html
<svg width="200" height="200">
  <rect x="10" y="10" width="100" height="100" fill="blue" />
</svg>
```

---

### **5. 如何选择？**

- **选 Canvas**：

  - 需要高性能渲染（如游戏、数据可视化仪表盘）。
  - 处理像素级操作（如图像编辑器、滤镜效果）。
  - 不需要复杂交互或 SEO 优化。

- **选 SVG**：
  - 需要可缩放图形（如 Logo、图标、地图）。
  - 需要复杂交互或无障碍访问（如可点击的图表）。
  - 图形结构简单且需 SEO 友好。

---

### **总结**

- **Canvas** 是“画布”，适合动态、高性能的像素操作。
- **SVG** 是“矢量图形”，适合静态、可交互、可缩放的界面元素。
- **混合使用**：复杂项目可结合两者（如用 SVG 做 UI，Canvas 做背景动画）。
