# git commit

## 关于`git commit`的信息提交规范

### 提交格式

```plaintext
<类型>[可选范围]: <主题>
[空行]
[正文]
[空行]
[脚注]
```

示例：

```plaintext
feat(auth): 添加用户登录功能

新增基于JWT的登录验证逻辑，支持邮箱和手机号登录。
添加相关单元测试。

Closes #123
BREAKING CHANGE: 移除旧版API `/login-legacy`
```

### 相关类型说明

1. `feat`: 新增功能
2. `fix`: 修复问题/Bug
3. `docs`: 文档更新，如`README`
4. `style`: 代码格式调整，不改变逻辑
5. `refactor`: 代码重构，既非新增功能，也非修复Bug
6. `test`: 添加或者修改测试用例
7. `chore`: 构建/工具/依赖变更，如更新依赖，修改CI配置
8. `perf`: 性能优化
9. `ci`: 持续集成相关修改
10. `build`: 构建系统或者外部依赖变更，如`webpack`或者`Gulp`
11. `revert`: 回滚某次提交

**范围（Scope，可选）**
说明影响的具体模块（如 feat(login): ...、fix(api): ...）。

团队可自定义范围（如组件名、功能模块）。

**主题（Subject）**
简明扼要描述修改内容，使用祈使语气（如“添加”而非“添加了”）。

首字母小写，结尾无标点。

正文（Body，可选）
详细描述修改的动机、实现细节或与之前行为的对比。

每行不超过 72 字符，段落间用空行分隔。

**脚注（Footer，可选）**
关联 Issue：如 Closes #123、Fixes #45。

破坏性变更：用 BREAKING CHANGE: 开头，说明不兼容变动。

### 工具支持

- Commitlint: 校验提交信息是否符合规范。
- Commitizen: 交互式生成规范提交信息。
- Husky: 通过 Git Hook 强制检查提交信息。
- Standard Version: 自动生成 CHANGELOG 和版本号。
