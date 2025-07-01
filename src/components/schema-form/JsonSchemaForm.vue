<template>
  <div class="json-schema-form">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
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
import type { FormInst, FormRules } from 'naive-ui'
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

const formRules = computed((): FormRules => {
  // 这里可以根据 schema 生成表单验证规则
  // 目前验证逻辑在 SchemaField 中处理
  return {}
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

// 暴露表单验证方法
const validate = async () => {
  return formRef.value?.validate()
}

const restoreValidation = () => {
  formRef.value?.restoreValidation()
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
