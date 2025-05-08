# 如何处理错误

> 错误可以被划分为两种：预期错误以及未捕获的错误，本页将引导您了解如何在 Next.js 应用程序中处理这些错误。

## 处理预期的错误

预期错误是指在应用程序正常运行期间可能发生的错误，例如来自服务器端表单验证或失败请求的错误。应显式处理这些错误并将其返回给客户端。

### `Server Functions`

在 `Server Functions` 中，您可以使用`useActionState`来处理预期错误。对于这些错误，应该避免使用`try/catch`块来包裹以及抛出错误，而应该将预期错误作为条件并将对应值返回

```ts
"use server";

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get("title");
  const content = formData.get("content");

  const res = await fetch("https://api.vercel.app/posts", {
    method: "POST",
    body: { title, content },
  });
  const json = await res.json();

  // 预期错误，直接返回错误信息
  if (!res.ok) {
    return { message: "Failed to create post" };
  }
}
```

可以传递`action`给`useActionState`，然后使用返回的`state`来展示错误信息

```ts
"use client";

import { useActionState } from "react";
import { createPost } from "@/app/actions";

const initialState = {
  message: "",
};

export function Form() {
  const [state, formAction, pending] = useActionState(createPost, initialState);

  return (
    <form action={formAction}>
      <label htmlFor="title">Title</label>
      <input type="text" id="title" name="title" required />
      <label htmlFor="content">Content</label>
      <textarea id="content" name="content" required />
      {state?.message && <p aria-live="polite">{state.message}</p>}
      <button disabled={pending}>Create Post</button>
    </form>
  );
}
```

### `Server Components`

在服务器组件里面请求数据，可以直接使用响应数据进行错误信息渲染或者重定向

```ts
export default async function Page() {
  const res = await fetch(`https://...`)
  const data = await res.json()
 
  if (!res.ok) {
    return 'There was an error.'
  }
 
  return '...'
}
```

## 处理未捕获的错误

未捕获的异常是意外错误，表示在应用程序的正常流程中不应发生的错误或问题。这些应该通过抛出错误来处理，然后由错误边界捕获。

### 嵌套错误边界

`Next.js`使用错误边界去处理未捕获的错误，错误边界捕获子组件内的错误并且展示一个回退UI，而不是崩溃的组件树。

在路由中创建一个`error.js`文件，导出一个组件

```ts
'use client' // Error boundaries must be Client Components
 
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  )
}
```

错误会冒泡到最近的父层级的错误边界组件中，这允许通过将 error.tsx 文件放置在路由层次结构中的不同级别来进行精细的错误处理。
