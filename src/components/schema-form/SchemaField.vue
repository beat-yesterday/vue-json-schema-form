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
        :rule="validationRule"
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

        <template v-if="uiSchema?.['ui:help']" #feedback>
          <div class="field-help">{{ uiSchema['ui:help'] }}</div>
        </template>
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
import { computed } from 'vue'
import { NFormItem } from 'naive-ui'
import type { FormItemRule } from 'naive-ui'
import type { CustomWidgetProps, JsonSchemaValue } from '@/types/schema'
import { widgetRegistry } from './WidgetRegistry'

// 内置控件
import StringWidget from './widgets/StringWidget.vue'
import NumberWidget from './widgets/NumberWidget.vue'
import BooleanWidget from './widgets/BooleanWidget.vue'
import SelectWidget from './widgets/SelectWidget.vue'
import ArrayWidget from './widgets/ArrayWidget.vue'
import ObjectWidget from './widgets/ObjectWidget.vue'

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
widgetRegistry.addResolver((schema, _uiSchema) => {
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

const validationRule = computed((): FormItemRule | undefined => {
  const rules: FormItemRule[] = []

  // 必填校验
  if (props.required) {
    rules.push({
      required: true,
      message: `${fieldLabel.value}是必填项`,
      trigger: ['blur', 'input'],
    })
  }

  // 字符串长度校验
  if (props.schema.type === 'string') {
    if (props.schema.minLength !== undefined) {
      rules.push({
        min: props.schema.minLength,
        message: `${fieldLabel.value}最少需要${props.schema.minLength}个字符`,
        trigger: ['blur', 'input'],
      })
    }

    if (props.schema.maxLength !== undefined) {
      rules.push({
        max: props.schema.maxLength,
        message: `${fieldLabel.value}最多允许${props.schema.maxLength}个字符`,
        trigger: ['blur', 'input'],
      })
    }

    if (props.schema.pattern) {
      rules.push({
        pattern: new RegExp(props.schema.pattern),
        message: `${fieldLabel.value}格式不正确`,
        trigger: ['blur', 'input'],
      })
    }
  }

  // 数字范围校验
  if (props.schema.type === 'number' || props.schema.type === 'integer') {
    if (props.schema.minimum !== undefined) {
      rules.push({
        type: 'number',
        min: props.schema.minimum,
        message: `${fieldLabel.value}不能小于${props.schema.minimum}`,
        trigger: ['blur', 'input'],
      })
    }

    if (props.schema.maximum !== undefined) {
      rules.push({
        type: 'number',
        max: props.schema.maximum,
        message: `${fieldLabel.value}不能大于${props.schema.maximum}`,
        trigger: ['blur', 'input'],
      })
    }
  }

  return rules.length > 0 ? rules : undefined
})

const validationStatus = computed(() => {
  // 这里可以根据实际的验证状态返回 'error', 'warning', 'success' 等
  return undefined
})

const validationMessage = computed(() => {
  // 这里可以返回具体的验证错误信息
  return undefined
})

const handleValueUpdate = (newValue: JsonSchemaValue) => {
  emit('update:value', newValue)
}
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
