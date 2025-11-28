以下是一份全面的 Next.js 面试题清单，涵盖核心概念、进阶特性和实战场景，适合中高级前端开发者：

---

### **一、基础概念**

1. **Next.js 的核心优势是什么？**  
   - 服务端渲染 (SSR) / 静态站点生成 (SSG) / 增量静态再生 (ISR)
   - 文件路由系统 (`pages` 或 `app` 路由)
   - 内置 CSS/Sass 支持、API 路由、中间件
   - 图像优化 (`next/image`)、国际化 (i18n)

2. **`getStaticProps` vs `getServerSideProps` vs `getStaticPaths`**  
   - `getStaticProps`：构建时生成静态页面（SSG），适合内容不变的数据（如博客）。
   - `getServerSideProps`：每次请求时生成页面（SSR），适合动态数据（如用户仪表盘）。
   - `getStaticPaths`：动态路由预生成静态页面（需配合 `getStaticProps`）。

3. **App Router vs Pages Router 的区别？**  
   - **App Router** (Next.js 13+)：基于 React Server Components (RSC)，支持嵌套路由、流式渲染、更细粒度数据获取。
   - **Pages Router**：传统路由，每个页面独立，使用 `getStaticProps` 等函数。

---

### **二、渲染策略**

4. **解释 ISR (Incremental Static Regeneration)**  
   - 示例：`getStaticProps` 中设置 `revalidate: 10` → 页面首次构建后，10秒内请求返回缓存，之后触发后台重新生成新页面。

5. **如何实现按需静态生成 (On-demand ISR)?**  
   - 使用 `res.revalidate()` API：  

     ```javascript
     // API 路由中
     await res.revalidate('/path-to-revalidate');
     ```

6. **客户端渲染 (CSR) 在 Next.js 中如何实现？**  
   - 在组件内用 `useEffect` + `useState` 获取数据（如 SWR 或 React Query）。

---

### **三、进阶特性**

7. **中间件 (Middleware) 的应用场景？**  
   - 身份验证、重定向、路径重写、修改请求头。  
   - 示例：拦截 `/dashboard` 请求，验证 Cookie 后重定向到登录页。

8. **如何优化图片？**  
   - 使用 `<Image src="..." width={500} height={300} alt="..." />`：  
     - 自动懒加载、WebP 格式转换、尺寸优化。

9. **Server Components 与 Client Components 的区别？**  
   - **Server Components**：在服务端渲染，无交互性，可直连数据库（减少 API 层）。  
   - **Client Components**：在客户端渲染，支持 `useState`、`useEffect`。

---

### **四、性能优化**

10. **如何减少首次加载 JS 体积？**  
    - 动态导入组件：`const DynamicComp = dynamic(() => import('./Component'))`  
    - 使用 `next/dynamic` 的 `loading` 属性添加加载状态。

11. **如何提升 Lighthouse 性能评分？**  
    - 预渲染（SSG/ISR）、图片优化、代码分割、减少第三方脚本。

12. **流式渲染 (Streaming) 的作用？**  
    - 逐步发送 HTML 到客户端（配合 `Suspense`），提升首屏速度（App Router 默认支持）。

---

### **五、状态管理与数据获取**

13. **在 Server Component 中如何获取数据？**  
    - 直接编写异步函数：  

      ```jsx
      export default async function Page() {
        const data = await fetchData();
        return <div>{data}</div>;
      }
      ```

14. **如何避免 API 密钥泄露？**  
    - 使用服务端数据获取（不在客户端暴露密钥），或通过 API 路由代理第三方请求。

---

### **六、部署与配置**

15. **`next.config.js` 常用配置有哪些？**  
    - `images.domains`（图片域名白名单）、`rewrites`/`redirects`、`env` 环境变量、`output: 'standalone'`（独立部署包）。

16. **部署到 Vercel 有什么优势？**  
    - 自动 ISR、边缘网络缓存、Serverless Functions、预览环境。

---

### **七、实战场景题**

17. **如何实现多语言 (i18n)？**  
    - Pages Router：配置 `next.config.js` 的 `i18n.locales`。  
    - App Router：使用 `next-intl` 或自定义路由中间件解析语言。

18. **如何处理 404 页面？**  
    - Pages Router：创建 `pages/404.js`。  
    - App Router：在 `app` 目录下添加 `not-found.js`。

19. **如何实现 API 限流？**  
    - 在 API 路由中使用 `rate-limiter-flexible` 或中间件集成 Upstash Redis。

---

### **八、调试与错误处理**

20. **如何捕获全局错误？**  
    - Pages Router：`_error.js` 自定义错误页。  
    - App Router：`app/error.js`（Client Component）捕获客户端错误 + `global-error.js` 捕获服务端错误。

---

### **高频深入问题**

1. **解释 React Server Components (RSC) 在 Next.js 中的工作原理。**
2. **如何用 `generateStaticParams`（App Router）替换 `getStaticPaths`？**
3. **为什么需要 `'use client'` 指令？什么情况下必须使用它？**
4. **Next.js 如何支持 SEO？对比 SPA 的优劣。**

---

### **答题建议**

- **结合项目经验**：如“我在XX项目用 ISR 实现商品页秒开，QPS 峰值提升3倍”。
- **明确版本差异**：如“Next.js 13.4 后 App Router 已稳定推荐使用”。
- **原理深入**：如“`next/link` 预加载路由的原理是监听 `<a>` 标签进入视口”。

掌握这些题目，能覆盖 90% 的 Next.js 面试考点。实际回答时需根据面试岗位侧重调整深度（如偏重 SSR 或优化）。
