# JSON Schema 动态表单库

基于 Vue 3 和 Naive UI 的强大动态表单库，支持通过 JSON Schema 配置生成复杂的交互式表单。

## 🚀 核心特性

- **基于 Schema 渲染**: 通过 JSON Schema 配置自动生成表单
- **分组功能**: 支持将表单字段分组显示
- **动态数组**: 支持数组类型字段的动态增删
- **字段依赖**: 支持级联选择和字段间的依赖关系
- **高度可定制**: 支持自定义控件和扩展
- **TypeScript 支持**: 完整的类型定义
- **用户注册机制**: 支持注册自定义控件

## 📦 安装和使用

### 基本使用

```vue
<template>
  <JsonSchemaForm v-model="formData" :schema="schema" :ui-schema="uiSchema" />
</template>

<script setup>
import { ref } from 'vue'
import { JsonSchemaForm } from '@/components/schema-form'

const formData = ref({})

const schema = {
  type: 'object',
  title: '用户信息',
  required: ['name', 'email'],
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      minLength: 2,
    },
    email: {
      type: 'string',
      title: '邮箱',
      format: 'email',
    },
    age: {
      type: 'integer',
      title: '年龄',
      minimum: 0,
    },
  },
}

const uiSchema = {
  name: {
    'ui:placeholder': '请输入姓名',
  },
  email: {
    'ui:placeholder': '请输入邮箱',
  },
}
</script>
```

### 分组功能

```javascript
const uiSchema = {
  firstName: {
    'ui:group': '基本信息',
  },
  lastName: {
    'ui:group': '基本信息',
  },
  phone: {
    'ui:group': '联系方式',
  },
  email: {
    'ui:group': '联系方式',
  },
}
```

### 动态数组

```javascript
const schema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: '标签',
      items: {
        type: 'string',
        title: '标签名',
      },
    },
    users: {
      type: 'array',
      title: '用户列表',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '姓名' },
          role: { type: 'string', title: '角色', enum: ['admin', 'user'] },
        },
      },
    },
  },
}
```

### 级联选择

```javascript
import { widgetRegistry } from '@/components/schema-form'
import CascadingSelect from '@/components/schema-form/widgets/CascadingSelect.vue'

// 注册级联选择控件
widgetRegistry.register('CascadingSelect', CascadingSelect)

const uiSchema = {
  device: {
    'ui:widget': 'CascadingSelect',
    'ui:options': {
      dependsOn: 'deviceType',
      enumOptions: [
        { label: '温度传感器', value: 'temp_sensor' },
        { label: '湿度传感器', value: 'humidity_sensor' },
      ],
    },
  },
}
```

## 🛠 自定义控件

### 创建自定义控件

```vue
<!-- MyCustomWidget.vue -->
<template>
  <n-input
    :value="value"
    :placeholder="uiSchema?.['ui:placeholder']"
    @update:value="$emit('update:value', $event)"
  />
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import type { CustomWidgetProps } from '@/types/schema'

defineProps<CustomWidgetProps>()
defineEmits<{
  'update:value': [value: any]
}>()
</script>
```

### 注册自定义控件

```javascript
import { widgetRegistry } from '@/components/schema-form'
import MyCustomWidget from './MyCustomWidget.vue'

widgetRegistry.register('MyCustomWidget', MyCustomWidget)

// 在 uiSchema 中使用
const uiSchema = {
  myField: {
    'ui:widget': 'MyCustomWidget',
  },
}
```

## 📋 Schema 规范

### JsonSchema 支持的属性

```typescript
interface JsonSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'integer'
  title?: string
  description?: string
  properties?: Record<string, JsonSchema>
  items?: JsonSchema
  required?: string[]
  enum?: any[]
  default?: any
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
}
```

### UiSchema 支持的属性

```typescript
interface UiSchema {
  'ui:widget'?: string // 指定使用的控件
  'ui:options'?: object // 控件选项
  'ui:group'?: string // 分组名称
  'ui:hidden'?: boolean // 是否隐藏
  'ui:disabled'?: boolean // 是否禁用
  'ui:readonly'?: boolean // 是否只读
  'ui:placeholder'?: string // 占位符
  'ui:help'?: string // 帮助文本
  'ui:order'?: string[] // 字段排序
}
```

## 🎯 高级特性

### 字段验证

表单自动根据 Schema 进行验证：

- 必填验证（required）
- 字符串长度验证（minLength, maxLength）
- 数字范围验证（minimum, maximum）
- 正则表达式验证（pattern）

### API 级联选择

```javascript
const uiSchema = {
  property: {
    'ui:widget': 'CascadingSelect',
    'ui:options': {
      dependsOn: 'device',
      endpoint: '/api/properties/{device}',
      dataPath: 'data.properties',
      labelField: 'name',
      valueField: 'id',
    },
  },
}
```

### 表单方法

```vue
<template>
  <JsonSchemaForm ref="formRef" v-model="formData" :schema="schema" />
  <n-button @click="validateForm">验证表单</n-button>
</template>

<script setup>
const formRef = ref()

const validateForm = async () => {
  try {
    await formRef.value.validate()
    console.log('验证通过')
  } catch (error) {
    console.log('验证失败')
  }
}
</script>
```

## 📚 示例

查看 `/schema-form-demo` 页面获取完整的使用示例，包括：

- 基础表单
- 分组表单
- 动态数组
- 级联选择
- 综合示例

## 🔧 开发指南

### 项目结构

```
src/
├── components/schema-form/
│   ├── JsonSchemaForm.vue      # 主入口组件
│   ├── SchemaField.vue         # 递归渲染器
│   ├── WidgetRegistry.ts       # 控件注册表
│   │   ├── StringWidget.vue
│   │   ├── NumberWidget.vue
│   │   ├── BooleanWidget.vue
│   │   ├── SelectWidget.vue
│   │   ├── ArrayWidget.vue
│   │   ├── ObjectWidget.vue
│   │   └── CascadingSelect.vue
│   └── index.ts               # 导出文件
├── types/
│   └── schema.ts              # 类型定义
└── views/
    └── SchemaFormDemo.vue     # 演示页面
```

### 扩展指南

1. **创建新控件**: 继承 `CustomWidgetProps` 接口
2. **注册控件**: 使用 `widgetRegistry.register()`
3. **添加解析器**: 使用 `widgetRegistry.addResolver()`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个表单库！

## �� 许可证

MIT License
