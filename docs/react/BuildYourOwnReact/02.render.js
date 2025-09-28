function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: { nodeValue: text, children: [] },
  };
}
function render(element, container) {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);
  // 遍历 element.props 中的属性，并将其添加到 node 中
  Object.keys(element.props).forEach((key) => {
    if (key !== "children") {
      dom[key] = element.props[key];
    }
  });
  // 遍历 element.props.children 中的元素，并将其添加到 node 中
  element.props.children.forEach((child) => {
    render(child, dom);
  });
  container.appendChild(dom);
}
const Deact = {
  createElement,
  createTextElement,
  render,
};
const element = Deact.createElement(
  "h1",
  { title: "foo" },
  Deact.createElement("a", null, "a"),
  Deact.createElement("div", null, "b"),
  "hello"
);

const container = document.getElementById("root");

Deact.render(element, container);
