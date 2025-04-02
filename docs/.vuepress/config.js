module.exports = {
  title: "邓攀的技术博客",
  base: "/knowledge/",
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "Github", link: "https://github.com/MyDAIDAI" },
      // {
      //   text: "冴羽的 JavaScript 博客",
      //   items: [
      //     { text: "Github", link: "https://github.com/MyDAIDAI" },
      //     {
      //       text: "掘金",
      //       link: "",
      //     },
      //   ],
      // },
    ],
    sidebar: [
      {
        title: "欢迎",
        path: "/",
        collapsable: false, // 不折叠
      },
      {
        title: "Vue",
        path: "/vue",
        collapsable: false, // 不折叠
        children: [
          { title: "响应式", path: "/vue/响应式.md" },
          { title: "编译", path: "/vue/编译.md" },
        ],
      },
      {
        title: "React",
        path: "/react",
        collapsable: false, // 不折叠
        children: [{ title: "JSX", path: "/react/JSX.md" }],
      },
      {
        title: "TypeScript",
        path: "/typescript",
        collapsable: false, // 不折叠
        children: [
          { title: "类型体操", path: "/typescript/type-challenges.md" },
        ],
      },
      {
        title: "算法",
        path: "/algorithm",
        collapsable: false, // 不折叠
        children: [{ title: "二分查找", path: "/algorithm/二分查找.md" }],
      },
      {
        title: "系统设计",
        path: "/system-design",
        collapsable: false, // 不折叠
        children: [{ title: "news feed", path: "/system-design/news-feed.md" }],
      },
    ],
  },
};
