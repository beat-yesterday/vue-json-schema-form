<template>
  <div class="json-schema-form">
    <n-form
      ref="formRef"
      :model="formData"
      :label-placement="labelPlacement"
      :label-width="labelWidth"
      :size="size"
    >
      <!-- 有分组的情况 -->
      <template v-if="hasGroups">
        <div v-for="group in fieldGroups" :key="group.title" class="field-group">
          <n-card v-if="group.title" :title="group.title" style="margin-bottom: 16px">
            <div class="group-fields">
              <SchemaField
                v-for="fieldName in group.fields"
                :key="fieldName"
                :value="getFieldValue(fieldName)"
                :schema="schema.properties![fieldName]"
                :ui-schema="getFieldUiSchema(fieldName)"
                :root-form-data="formData"
                :path="[fieldName]"
                :required="isFieldRequired(fieldName)"
                :disabled="disabled"
                :readonly="readonly"
                @update:value="updateFieldValue(fieldName, $event)"
              />
            </div>
          </n-card>

          <!-- 无标题分组 -->
          <div v-else class="group-fields" style="margin-bottom: 16px">
            <SchemaField
              v-for="fieldName in group.fields"
              :key="fieldName"
              :value="getFieldValue(fieldName)"
              :schema="schema.properties![fieldName]"
              :ui-schema="getFieldUiSchema(fieldName)"
              :root-form-data="formData"
              :path="[fieldName]"
              :required="isFieldRequired(fieldName)"
              :disabled="disabled"
              :readonly="readonly"
              @update:value="updateFieldValue(fieldName, $event)"
            />
          </div>
        </div>
      </template>

      <!-- 无分组的情况 -->
      <template v-else>
        <SchemaField
          v-for="(propertySchema, fieldName) in orderedProperties"
          :key="fieldName"
          :value="getFieldValue(fieldName)"
          :schema="propertySchema"
          :ui-schema="getFieldUiSchema(fieldName)"
          :root-form-data="formData"
          :path="[fieldName]"
          :required="isFieldRequired(fieldName)"
          :disabled="disabled"
          :readonly="readonly"
          @update:value="updateFieldValue(fieldName, $event)"
        />
      </template>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NForm, NCard } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import type { JsonSchema, UiSchema, JsonSchemaValue, FieldGroup } from '@/types/schema'
import SchemaField from './SchemaField.vue'

interface Props {
  schema: JsonSchema
  uiSchema?: Record<string, UiSchema>
  modelValue: Record<string, JsonSchemaValue>
  disabled?: boolean
  readonly?: boolean
  labelPlacement?: 'left' | 'top'
  labelWidth?: string | number
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  labelPlacement: 'top',
  labelWidth: 'auto',
  size: 'medium',
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, JsonSchemaValue>]
}>()

const formRef = ref<FormInst>()

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const orderedProperties = computed(() => {
  const properties = props.schema.properties || {}
  const globalUiOrder = props.uiSchema?.['*']?.['ui:order'] as string[] | undefined

  if (globalUiOrder) {
    const ordered: Record<string, JsonSchema> = {}
    // 先按指定顺序添加
    globalUiOrder.forEach((key) => {
      if (properties[key]) {
        ordered[key] = properties[key]
      }
    })
    // 再添加未指定顺序的属性
    Object.keys(properties).forEach((key) => {
      if (!globalUiOrder.includes(key)) {
        ordered[key] = properties[key]
      }
    })
    return ordered
  }

  return properties
})

const fieldGroups = computed((): FieldGroup[] => {
  const groups: Record<string, string[]> = {}
  const ungroupedFields: string[] = []

  Object.keys(orderedProperties.value).forEach((fieldName) => {
    const fieldUiSchema = getFieldUiSchema(fieldName)
    const groupName = fieldUiSchema?.['ui:group'] as string | undefined

    if (groupName) {
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(fieldName)
    } else {
      ungroupedFields.push(fieldName)
    }
  })

  const result: FieldGroup[] = []

  // 添加未分组的字段（如果有的话）
  if (ungroupedFields.length > 0) {
    result.push({
      title: '',
      fields: ungroupedFields,
    })
  }

  // 添加分组的字段
  Object.keys(groups).forEach((groupTitle) => {
    result.push({
      title: groupTitle,
      fields: groups[groupTitle],
    })
  })

  return result
})

const hasGroups = computed(() => {
  return fieldGroups.value.some((group) => group.title !== '')
})

const getFieldValue = (fieldName: string): JsonSchemaValue => {
  return formData.value[fieldName]
}

const getFieldUiSchema = (fieldName: string): UiSchema | undefined => {
  return props.uiSchema?.[fieldName]
}

const isFieldRequired = (fieldName: string): boolean => {
  return props.schema.required?.includes(fieldName) || false
}

const updateFieldValue = (fieldName: string, newValue: JsonSchemaValue) => {
  const newFormData = { ...formData.value, [fieldName]: newValue }
  emit('update:modelValue', newFormData)
}

// 手动验证所有字段
const validate = async (): Promise<{ valid: boolean; errors: Record<string, string> }> => {
  const errors: Record<string, string> = {}
  let valid = true

  if (!props.schema.properties) {
    return { valid: true, errors: {} }
  }

  Object.keys(props.schema.properties).forEach((fieldName) => {
    const fieldSchema = props.schema.properties![fieldName]
    const value = formData.value[fieldName]

    // 必填校验
    if (isFieldRequired(fieldName)) {
      if (value === null || value === undefined || value === '') {
        errors[fieldName] = `${fieldSchema.title || fieldName}是必填项`
        valid = false
        return
      }
    }

    // 字符串验证
    if (fieldSchema.type === 'string' && typeof value === 'string') {
      if (fieldSchema.minLength !== undefined && value.length < fieldSchema.minLength) {
        errors[fieldName] =
          `${fieldSchema.title || fieldName}最少需要${fieldSchema.minLength}个字符`
        valid = false
        return
      }

      if (fieldSchema.maxLength !== undefined && value.length > fieldSchema.maxLength) {
        errors[fieldName] =
          `${fieldSchema.title || fieldName}最多允许${fieldSchema.maxLength}个字符`
        valid = false
        return
      }

      if (fieldSchema.pattern) {
        const regex = new RegExp(fieldSchema.pattern)
        if (!regex.test(value)) {
          errors[fieldName] = `${fieldSchema.title || fieldName}格式不正确`
          valid = false
          return
        }
      }
    }

    // 数字验证
    if (
      (fieldSchema.type === 'number' || fieldSchema.type === 'integer') &&
      typeof value === 'number'
    ) {
      if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
        errors[fieldName] = `${fieldSchema.title || fieldName}不能小于${fieldSchema.minimum}`
        valid = false
        return
      }

      if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
        errors[fieldName] = `${fieldSchema.title || fieldName}不能大于${fieldSchema.maximum}`
        valid = false
        return
      }
    }
  })

  return { valid, errors }
}

const restoreValidation = () => {
  // 手动验证模式下，这个方法可以用来重置所有字段的验证状态
  // 这里可以通过事件或其他方式通知子组件重置验证状态
}

defineExpose({
  validate,
  restoreValidation,
  formRef,
})
</script>

<style scoped>
.json-schema-form {
  width: 100%;
}

.field-group {
  margin-bottom: 16px;
}

.field-group:last-child {
  margin-bottom: 0;
}

.group-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
