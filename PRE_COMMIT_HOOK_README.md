# Pre-commit Hook 使用说明

这个 pre-commit hook 可以在每次 Git 提交前自动运行指定目录下的单元测试。如果测试失败，提交将被阻止。

## 🚀 快速开始

### 方法1：使用管理脚本（推荐）

```bash
# 安装 pre-commit hook
./scripts/manage-pre-commit-hook.sh install

# 查看状态
./scripts/manage-pre-commit-hook.sh status

# 测试 hook 是否正常工作
./scripts/manage-pre-commit-hook.sh test
```

### 方法2：直接使用（已安装）

如果你看到这个文档，说明 pre-commit hook 已经安装并启用了。

## 📋 功能特性

- ✅ **自动测试**：每次提交前自动运行指定目录的单元测试
- ✅ **可配置**：支持自定义测试目录、测试命令等
- ✅ **智能跳过**：测试目录不存在时自动跳过
- ✅ **彩色输出**：清晰的彩色提示信息
- ✅ **易于管理**：提供完整的管理脚本
- ✅ **错误提示**：测试失败时提供详细的修复建议

## 🛠️ 管理命令

使用管理脚本来控制 pre-commit hook：

```bash
# 查看所有可用命令
./scripts/manage-pre-commit-hook.sh help

# 安装 hook
./scripts/manage-pre-commit-hook.sh install

# 卸载 hook
./scripts/manage-pre-commit-hook.sh uninstall

# 启用 hook
./scripts/manage-pre-commit-hook.sh enable

# 禁用 hook
./scripts/manage-pre-commit-hook.sh disable

# 查看状态
./scripts/manage-pre-commit-hook.sh status

# 编辑配置
./scripts/manage-pre-commit-hook.sh config

# 测试 hook
./scripts/manage-pre-commit-hook.sh test
```

## ⚙️ 配置说明

配置文件位于 `.git/hooks/pre-commit-config`，包含以下选项：

```bash
# 要测试的目录（用空格分隔多个目录）
TEST_DIRS="src/components/schema-form/widgets/__tests__"

# 测试命令
TEST_COMMAND="pnpm run test:unit"

# 是否启用hook（true/false）
ENABLED=true

# 是否显示详细输出（true/false）
VERBOSE=false
```

### 配置选项详解

| 选项           | 说明             | 默认值                                         | 示例                                   |
| -------------- | ---------------- | ---------------------------------------------- | -------------------------------------- |
| `TEST_DIRS`    | 要测试的目录列表 | `src/components/schema-form/widgets/__tests__` | `"src/tests src/components/__tests__"` |
| `TEST_COMMAND` | 测试命令         | `pnpm run test:unit`                           | `"pnpm test"` 或 `"yarn test"`         |
| `ENABLED`      | 是否启用hook     | `true`                                         | `true` 或 `false`                      |
| `VERBOSE`      | 是否显示详细输出 | `false`                                        | `true` 或 `false`                      |

## 🔧 自定义配置示例

### 测试多个目录

```bash
TEST_DIRS="src/components/__tests__ src/utils/__tests__ src/services/__tests__"
```

### 使用不同的测试命令

```bash
# 使用 pnpm
TEST_COMMAND="pnpm test"

# 使用 yarn
TEST_COMMAND="yarn test"

# 只运行特定的测试
TEST_COMMAND="pnpm run test:unit -- --reporter=verbose"
```

### 启用详细输出

```bash
VERBOSE=true
```

## 🚨 使用场景

### 正常提交流程

```bash
git add .
git commit -m "feat: add new feature"
# Pre-commit hook 会自动运行测试
# 如果测试通过，提交成功
# 如果测试失败，提交被阻止
```

### 跳过 hook（不推荐）

```bash
# 紧急情况下跳过测试
git commit -m "fix: urgent fix" --no-verify
```

### 测试失败时的处理

当测试失败时，你会看到类似的提示：

```
❌ 测试失败！提交被阻止。
请修复测试错误后重新提交。

提示:
  - 运行 'pnpm run test:unit' 查看详细测试结果
  - 编辑 '.git/hooks/pre-commit-config' 修改测试配置
  - 运行 'git commit --no-verify' 跳过此hook（不推荐）
```

## 📝 常见问题

### Q: 如何临时禁用 hook？

```bash
# 方法1：使用管理脚本
./scripts/manage-pre-commit-hook.sh disable

# 方法2：修改配置文件
echo "ENABLED=false" >> .git/hooks/pre-commit-config

# 方法3：单次跳过
git commit -m "message" --no-verify
```

### Q: 如何添加更多测试目录？

```bash
# 编辑配置文件
./scripts/manage-pre-commit-hook.sh config

# 或者直接修改
vim .git/hooks/pre-commit-config
```

### Q: 测试命令失败怎么办？

1. 检查测试命令是否正确：`pnpm run test:unit`
2. 检查测试目录是否存在
3. 查看详细输出：设置 `VERBOSE=true`

### Q: 如何在团队中共享这个配置？

由于 `.git/hooks/` 目录不会被 Git 追踪，你可以：

1. 将 `scripts/manage-pre-commit-hook.sh` 提交到仓库
2. 在 README 中添加安装说明
3. 在 CI/CD 中自动安装 hook

## 🔄 更新和维护

### 更新 hook

```bash
# 重新安装会自动更新
./scripts/manage-pre-commit-hook.sh install
```

### 备份配置

```bash
# 备份配置文件
cp .git/hooks/pre-commit-config .git/hooks/pre-commit-config.backup
```

### 完全重置

```bash
# 卸载并重新安装
./scripts/manage-pre-commit-hook.sh uninstall
./scripts/manage-pre-commit-hook.sh install
```

## 🎯 最佳实践

1. **保持测试快速**：只包含必要的测试文件
2. **定期检查**：使用 `status` 命令检查 hook 状态
3. **团队协作**：确保团队成员都安装了 hook
4. **合理配置**：根据项目需求调整测试目录和命令
5. **监控性能**：如果测试太慢，考虑优化测试或调整范围

## 📚 相关文档

- [Git Hooks 官方文档](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Vitest 测试框架文档](https://vitest.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)

## 🤝 贡献

如果你发现问题或有改进建议，欢迎：

1. 创建 Issue 报告问题
2. 提交 Pull Request 改进代码
3. 分享使用经验和最佳实践

---

**注意**：这个 hook 是为了提高代码质量，请不要频繁使用 `--no-verify` 跳过测试。
