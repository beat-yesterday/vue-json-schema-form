# Widget 单元测试指南

本文档详细说明了如何为每个 Widget 组件运行和维护单元测试。

## 测试结构概览

我们为 JSON Schema 动态表单库的所有核心 Widget 组件创建了全面的单元测试：

### 已创建的测试文件

```
src/components/schema-form/
├── __tests__/
│   └── test-utils.ts              # 通用测试工具函数
└── widgets/
    └── __tests__/
        ├── StringWidget.spec.ts   # 字符串输入组件测试
        ├── NumberWidget.spec.ts   # 数字输入组件测试
        ├── BooleanWidget.spec.ts  # 布尔选择组件测试
        ├── SelectWidget.spec.ts   # 下拉选择组件测试
        └── ArrayWidget.spec.ts    # 动态数组组件测试
```

## 测试工具函数

### test-utils.ts 提供的功能

- **mountWidget()**: 挂载 Widget 组件的标准化方法
- **createTestSchema()**: 创建测试用的 JSON Schema
- **createTestUiSchema()**: 创建测试用的 UI Schema
- **expectEventEmitted()**: 验证事件触发的辅助函数
- **TEST_DATA**: 预定义的测试数据集合
- **createMockFetch()**: 创建模拟 API 请求

## 各 Widget 测试覆盖范围

### 1. StringWidget 测试

**测试文件**: `StringWidget.spec.ts`

**覆盖功能**:

- ✅ 基本渲染和显示
- ✅ 不同输入类型支持（text, password, email 等）
- ✅ 占位符和初始值显示
- ✅ 禁用和只读状态
- ✅ 用户输入和事件触发
- ✅ Props 响应性
- ✅ 边界情况处理（null, undefined, 特殊字符）
- ✅ Naive UI 集成测试

**重点测试场景**:

```typescript
// 测试不同类型的字符串输入
;-普通文本 - 长文本 - 特殊字符 - 中文字符 - 邮箱格式 - 密码格式
```

### 2. NumberWidget 测试

**测试文件**: `NumberWidget.spec.ts`

**覆盖功能**:

- ✅ 数字输入基本功能
- ✅ 整数 vs 浮点数处理
- ✅ 最小值/最大值限制
- ✅ 步长设置
- ✅ 负数和零值处理
- ✅ 无效输入处理
- ✅ 大数值支持
- ✅ Schema 验证集成

**重点测试场景**:

```typescript
// 测试不同类型的数字
- 正整数、负整数、零
- 小数
- 大数值
- 范围限制
- 无效输入验证
```

### 3. BooleanWidget 测试

**测试文件**: `BooleanWidget.spec.ts`

**覆盖功能**:

- ✅ 复选框基本渲染
- ✅ 真值/假值处理
- ✅ 标签文本显示
- ✅ 键盘和鼠标交互
- ✅ 禁用状态处理
- ✅ 可访问性支持
- ✅ 真值转换逻辑
- ✅ 快速连续点击处理

**重点测试场景**:

```typescript
// 测试不同的真值/假值
- 标准布尔值 (true/false)
- 字符串真值 ('true', 'yes', '1')
- 字符串假值 ('false', 'no', '0')
- 数字真假值 (1, 0)
- null/undefined 处理
```

### 4. SelectWidget 测试

**测试文件**: `SelectWidget.spec.ts`

**覆盖功能**:

- ✅ 下拉选择基本功能
- ✅ enum 和 enumNames 处理
- ✅ oneOf 选项支持
- ✅ 多选模式支持
- ✅ 数字和字符串枚举
- ✅ 大量选项性能测试
- ✅ 长文本选项处理
- ✅ 可访问性支持

**重点测试场景**:

```typescript
// 测试不同的选项配置
- 简单枚举值
- 枚举值 + 显示名称
- oneOf 复杂选项
- 多选数组
- 混合类型枚举
- 性能压力测试
```

### 5. ArrayWidget 测试

**测试文件**: `ArrayWidget.spec.ts`

**覆盖功能**:

- ✅ 动态数组渲染
- ✅ 添加/删除项目功能
- ✅ 项目更新和响应性
- ✅ 嵌套结构支持
- ✅ 不同数据类型数组
- ✅ 状态控制（禁用/只读）
- ✅ 大量数据性能测试
- ✅ UI Schema 传递

**重点测试场景**:

```typescript
// 测试不同的数组操作
- 字符串数组操作
- 对象数组操作
- 嵌套数组支持
- 混合类型数组
- 大规模数组（100+ 项）
- 边界条件处理
```

## 运行测试

### 基本测试命令

```bash
# 运行所有测试
pnpm run test:unit

# 运行特定 Widget 测试
pnpm run test:unit StringWidget
pnpm run test:unit NumberWidget
pnpm run test:unit BooleanWidget
pnpm run test:unit SelectWidget
pnpm run test:unit ArrayWidget

# 运行所有 Widget 测试
pnpm run test:unit widgets

# 监听模式运行测试
pnpm run test:unit -- --watch

# 生成测试覆盖率报告
pnpm run test:unit -- --coverage
```

### 调试测试

```bash
# 运行特定测试并显示详细输出
pnpm run test:unit -- --reporter=verbose

# 运行失败的测试
pnpm run test:unit -- --run-failed

# 运行特定测试文件中的特定测试
pnpm run test:unit -- --grep "应该正确渲染"
```

## 测试最佳实践

### 1. 测试命名规范

```typescript
describe('WidgetName', () => {
  describe('功能分类', () => {
    it('应该 + 具体行为描述', () => {
      // 测试实现
    })
  })
})
```

### 2. 测试结构

每个测试文件都遵循以下结构：

- **基本渲染**: 组件能正确挂载和显示
- **状态控制**: disabled/readonly 等状态
- **用户交互**: 输入、点击、键盘操作
- **Props 响应性**: 属性变化时的响应
- **边界情况**: null/undefined/错误输入
- **事件处理**: 事件触发和传递
- **UI 框架集成**: Naive UI 特定功能
- **可访问性**: 键盘导航、ARIA 属性
- **性能测试**: 大数据量、复杂场景

### 3. 断言模式

```typescript
// 基本存在性检查
expect(wrapper.find('.component').exists()).toBe(true)

// 属性验证
expect(input.attributes('disabled')).toBeDefined()
expect(input.element.value).toBe('expected')

// 事件验证
expectEventEmitted(wrapper, 'update:value', expectedValue)
expect(wrapper.emitted('update:value')).toBeTruthy()

// 数组和对象比较
expect(events![0][0]).toEqual(expectedArray)
```

## 持续集成

### 自动化测试流程

```yaml
# GitHub Actions 示例
name: Widget Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: pnpm install
      - run: pnpm run test:unit
      - run: pnpm run test:unit -- --coverage
```

### 测试质量指标

- **代码覆盖率**: 目标 90%+
- **测试数量**: 每个 Widget 20+ 测试用例
- **边界测试**: 完整覆盖 null/undefined/错误输入
- **集成测试**: 验证与 Naive UI 的集成
- **性能测试**: 大数据量场景验证

## 故障排除

### 常见问题

1. **组件挂载失败**

   ```typescript
   // 确保提供所有必需的 props
   wrapper = mountWidget(Component, {
     schema: createTestSchema('string'),
     value: 'test',
   })
   ```

2. **事件未触发**

   ```typescript
   // 使用正确的事件触发方式
   await input.setValue('value')
   await input.trigger('input')
   await wrapper.vm.$nextTick()
   ```

3. **异步操作处理**

   ```typescript
   // 等待 DOM 更新
   await wrapper.vm.$nextTick()
   await waitForUpdate(wrapper)
   ```

4. **类型错误**
   ```typescript
   // 确保 Schema 类型正确
   schema: createTestSchema('string', {
     enum: ['option1', 'option2'],
   })
   ```

### 调试技巧

```typescript
// 输出组件 HTML 结构
console.log(wrapper.html())

// 输出触发的事件
console.log(wrapper.emitted())

// 输出组件 props
console.log(wrapper.props())

// 检查元素是否存在
console.log(wrapper.find('.selector').exists())
```

## 扩展测试

### 添加新的 Widget 测试

1. 在 `widgets/__tests__/` 目录创建新的测试文件
2. 遵循现有的测试结构和命名规范
3. 使用通用测试工具函数
4. 覆盖所有核心功能和边界情况
5. 添加特定于该 Widget 的特殊测试

### 测试数据扩展

在 `test-utils.ts` 中的 `TEST_DATA` 对象添加新的测试数据：

```typescript
export const TEST_DATA = {
  // 现有数据...

  // 新的测试数据类型
  customType: {
    valid: 'valid data',
    invalid: 'invalid data',
    edge: 'edge case',
  },
}
```

## 总结

这套测试框架为 JSON Schema 动态表单库提供了全面的质量保障：

- **全覆盖**: 所有核心 Widget 组件
- **深度测试**: 每个组件的各个功能点
- **边界安全**: 完整的边界情况处理
- **集成验证**: 与 Naive UI 的集成测试
- **性能保障**: 大数据量和复杂场景测试
- **可维护性**: 标准化的测试结构和工具

通过这些测试，我们确保每个 Widget 在各种使用场景下都能稳定可靠地工作，为用户提供一致的体验。
