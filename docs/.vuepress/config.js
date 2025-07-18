module.exports = {
  title: '邓攀的技术博客',
  base: '/knowledge/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Github', link: 'https://github.com/MyDAIDAI' },
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
        title: '欢迎',
        path: '/',
        collapsable: false, // 不折叠
      },
      {
        title: 'Vue',
        path: '/vue',
        collapsable: false, // 不折叠
        children: [
          { title: '响应式', path: '/vue/响应式.md' },
          { title: '编译', path: '/vue/编译.md' },
        ],
      },
      {
        title: 'React',
        path: '/react',
        collapsable: false, // 不折叠
        children: [{ title: 'JSX', path: '/react/JSX.md' }],
      },
      {
        title: 'TypeScript',
        path: '/typescript',
        collapsable: false, // 不折叠
        children: [
          { title: '类型体操', path: '/typescript/type-challenges.md' },
        ],
      },
      {
        title: 'nextjs',
        path: '/nextjs',
        collapsable: false, // 不折叠
        children: [
          { title: '文档', path: '/nextjs/docs.md' },
          { title: '使用', path: '/nextjs/use.md' },
        ],
      },
      {
        title: '算法',
        path: '/algorithm',
        collapsable: false, // 不折叠
        children: [
          { title: '二分查找', path: '/algorithm/二分查找.md' },
          { title: '大数相加', path: '/algorithm/大数相加.md' },
        ],
      },
      {
        title: '系统设计',
        path: '/system-design',
        collapsable: false, // 不折叠
        children: [{ title: 'news feed', path: '/system-design/news-feed.md' }],
      },
      {
        title: '面试相关',
        path: '/interview',
        collapsable: false, // 不折叠
        children: [
          { title: 'HTML', path: '/interview/html.md' },
          { title: 'JavaScript', path: '/interview/JavaScript.md' },
        ],
      },
      {
        title: 'GFE',
        path: '/GFE',
        collapsable: false, // 不折叠
        children: [
          { title: 'Debounce', path: '/GFE/01.debounce/' },
          { title: 'MyReduce', path: '/GFE/02.myReduce/' },
          { title: 'ClassNames', path: '/GFE/03.classnames/' },
          { title: 'Flatten', path: '/GFE/04.flatten/' },
          { title: 'Throttle', path: '/GFE/05.throttle/' },
          { title: 'Type Utilities', path: '/GFE/06.Type Utilities/' },
          { title: 'Type Utilities II', path: '/GFE/07.Type Utilities II/' },
          { title: 'Promise.all', path: '/GFE/08.Promise.all/' },
          { title: 'Data Merging', path: '/GFE/09.Data Merging/' },
          { title: 'Deep Clone', path: '/GFE/10.Deep Clone/' },
          { title: 'Event Emitter', path: '/GFE/11.Event Emitter/' },
          { title: 'getElementsByStyle', path: '/GFE/12.getElementsByStyle/' },
          { title: 'Function.prototype.call', path: '/GFE/13.Function.prototype.call/' },
          { title: 'List Format', path: '/GFE/14.List Format/' },
          { title: 'Map Async Limit', path: '/GFE/15.Map Async Limit/' },
          { title: 'Deep Equal', path: '/GFE/16.Deep Equal/' },
        ],
      },
      {
        title: 'Blind',
        path: '/Blind',
        collapsable: false, // 不折叠
        children: [
          { title: 'Balanced Brackets', path: '/Blind/01.Balanced Brackets/' },
          { title: 'Find Duplicates in Array', path: '/Blind/02.Find Duplicates in Array/' },
          { title: 'Find Missing Number in Sequence', path: '/Blind/03.Find Missing Number in Sequence/' },
        ],
      },
      {
        title: 'Git',
        path: '/git',
        collapsable: false, // 不折叠
        children: [{ title: 'commit', path: '/git/commit.md' }],
      },
    ],
  },
};
