# getElementsByStyle

实现一个`getElementsByStyle`函数，要求可以实现下面的功能，传入一个`DOM`节点，以及对应的`style`属性以及相应的值，返回包含该属性值的`DOM`标签

```ts
const doc = new DOMParser().parseFromString(
  `<div>
    <span style="font-size: 12px">Span</span>
    <p style="font-size: 12px">Paragraph</p>
    <blockquote style="font-size: 14px">Blockquote</blockquote>
  </div>`,
  'text/html',
);

getElementsByStyle(doc.body, 'font-size', '12px');
// [span, p] <-- This is an array of elements.

```

## Solution

可以用到两个`api`来实现这个函数：

- `Window.getComputedStyle()`：返回一个对象的所有`css`属性的元素值，该值是应用了激活的`stylesheets`以及可能的计算样式值
- `Element.children`：返回一直子元素的`HTMLCollection`集合，也可以使用`Node.childNodes`接口
