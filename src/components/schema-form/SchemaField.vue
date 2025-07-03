<template>
  <div class="schema-field">
    <!-- 隐藏的字段 -->
    <template v-if="uiSchema?.['ui:hidden']">
      <!-- 隐藏字段不渲染任何内容 -->
    </template>

    <!-- 正常渲染的字段 -->
    <template v-else>
      <n-form-item
        v-if="showFormItem"
        :label="fieldLabel"
        :required="required"
        :path="fieldPath"
        :validation-status="validationStatus"
        :feedback="validationMessage"
      >
        <component
          :is="resolvedWidget"
          :value="value"
          :schema="schema"
          :ui-schema="uiSchema"
          :root-form-data="rootFormData"
          :path="path"
          :required="required"
          :disabled="computedDisabled"
          :readonly="computedReadonly"
          @update:value="handleValueUpdate"
        />
      </n-form-item>

      <!-- 对于 object 和 array，可能不需要 form-item 包装 -->
      <component
        v-else
        :is="resolvedWidget"
        :value="value"
        :schema="schema"
        :ui-schema="uiSchema"
        :root-form-data="rootFormData"
        :path="path"
        :required="required"
        :disabled="computedDisabled"
        :readonly="computedReadonly"
        @update:value="handleValueUpdate"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { NFormItem } from 'naive-ui'
import { computed, ref, watch } from 'vue'

import type { CustomWidgetProps, JsonSchemaValue } from '@/types/schema'
import { widgetRegistry } from './WidgetRegistry'

// 内置控件
import ArrayWidget from './widgets/ArrayWidget.vue'
import BooleanWidget from './widgets/BooleanWidget.vue'
import NumberWidget from './widgets/NumberWidget.vue'
import ObjectWidget from './widgets/ObjectWidget.vue'
import SelectWidget from './widgets/SelectWidget.vue'
import StringWidget from './widgets/StringWidget.vue'

const props = defineProps<CustomWidgetProps>()

const emit = defineEmits<{
  'update:value': [value: JsonSchemaValue]
}>()

// 注册内置控件
if (!widgetRegistry.get('StringWidget')) {
  widgetRegistry.register('StringWidget', StringWidget)
  widgetRegistry.register('NumberWidget', NumberWidget)
  widgetRegistry.register('BooleanWidget', BooleanWidget)
  widgetRegistry.register('SelectWidget', SelectWidget)
  widgetRegistry.register('ArrayWidget', ArrayWidget)
  widgetRegistry.register('ObjectWidget', ObjectWidget)
}

// 添加默认解析器
// eslint-disable-next-line @typescript-eslint/no-unused-vars
widgetRegistry.addResolver((schema, uiSchema) => {
  // 如果有 enum，使用 select 控件
  if (schema.enum && schema.enum.length > 0) {
    return 'SelectWidget'
  }
  return undefined
})

const resolvedWidget = computed(() => {
  const widgetName = widgetRegistry.resolve(props.schema, props.uiSchema)
  const widget = widgetRegistry.get(widgetName)

  if (!widget) {
    console.warn(`Widget "${widgetName}" not found, using StringWidget as fallback`)
    return widgetRegistry.get('StringWidget')!
  }

  return widget
})

const fieldLabel = computed(() => {
  return props.schema.title || props.path[props.path.length - 1] || ''
})

const fieldPath = computed(() => {
  return props.path[props.path.length - 1] || ''
})

const showFormItem = computed(() => {
  // object 和 array 类型不需要 form-item 包装，它们会自己处理布局
  return props.schema.type !== 'object' && props.schema.type !== 'array'
})

const computedDisabled = computed(() => {
  return props.disabled || props.uiSchema?.['ui:disabled'] || false
})

const computedReadonly = computed(() => {
  return props.readonly || props.uiSchema?.['ui:readonly'] || false
})

// 手动验证状态管理
const validationStatus = ref<'error' | 'warning' | 'success' | undefined>(undefined)
const validationMessage = ref<string>('')

// 验证函数
const validateField = (value: JsonSchemaValue): { valid: boolean; message: string } => {
  // 必填校验
  if (props.required) {
    if (value === null || value === undefined || value === '') {
      return { valid: false, message: `${fieldLabel.value}是必填项` }
    }
  }

  // 字符串验证
  if (props.schema.type === 'string' && typeof value === 'string') {
    if (props.schema.minLength !== undefined && value.length < props.schema.minLength) {
      return { valid: false, message: `${fieldLabel.value}最少需要${props.schema.minLength}个字符` }
    }

    if (props.schema.maxLength !== undefined && value.length > props.schema.maxLength) {
      return { valid: false, message: `${fieldLabel.value}最多允许${props.schema.maxLength}个字符` }
    }

    if (props.schema.pattern) {
      const regex = new RegExp(props.schema.pattern)
      if (!regex.test(value)) {
        return { valid: false, message: `${fieldLabel.value}格式不正确` }
      }
    }
  }

  // 数字验证
  if (
    (props.schema.type === 'number' || props.schema.type === 'integer') &&
    typeof value === 'number'
  ) {
    if (props.schema.minimum !== undefined && value < props.schema.minimum) {
      return { valid: false, message: `${fieldLabel.value}不能小于${props.schema.minimum}` }
    }

    if (props.schema.maximum !== undefined && value > props.schema.maximum) {
      return { valid: false, message: `${fieldLabel.value}不能大于${props.schema.maximum}` }
    }
  }

  return { valid: true, message: '' }
}

// 更新验证状态
const updateValidationStatus = (value: JsonSchemaValue) => {
  const result = validateField(value)

  validationStatus.value = result.valid ? undefined : 'error'
  validationMessage.value = result.message
}

// 监听值变化，验证（不包括初始状态）
watch(
  () => props.value,
  (newValue) => {
    updateValidationStatus(newValue)
  },
)

const handleValueUpdate = (newValue: JsonSchemaValue) => {
  // 立即验证新值
  updateValidationStatus(newValue)
  emit('update:value', newValue)
}

// 重置验证状态（可供外部调用）
const resetValidation = () => {
  hasUserInteracted.value = false
  validationStatus.value = undefined
  validationMessage.value = ''
}

// 暴露重置方法，以便父组件可以调用
defineExpose({
  resetValidation,
})
</script>

<style scoped>
.schema-field {
  width: 100%;
}

.field-help {
  color: var(--n-text-color-3);
  font-size: 12px;
  margin-top: 4px;
}
</style>
