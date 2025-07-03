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
            <LayoutContainer
              :layout="group.layout || globalLayout"
              :items="getGroupLayoutItems(group.fields)"
            >
              <template #default="{ item }">
                <SchemaField
                  :value="getFieldValue(item.fieldName as string)"
                  :schema="schema.properties![item.fieldName as string]"
                  :ui-schema="getFieldUiSchema(item.fieldName as string)"
                  :root-form-data="formData"
                  :path="[item.fieldName as string]"
                  :required="isFieldRequired(item.fieldName as string)"
                  :disabled="disabled"
                  :readonly="readonly"
                  @update:value="updateFieldValue(item.fieldName as string, $event)"
                />
              </template>
            </LayoutContainer>
          </n-card>

          <!-- 无标题分组 -->
          <div v-else style="margin-bottom: 16px">
            <LayoutContainer
              :layout="group.layout || globalLayout"
              :items="getGroupLayoutItems(group.fields)"
            >
              <template #default="{ item }">
                <SchemaField
                  :value="getFieldValue(item.fieldName as string)"
                  :schema="schema.properties![item.fieldName as string]"
                  :ui-schema="getFieldUiSchema(item.fieldName as string)"
                  :root-form-data="formData"
                  :path="[item.fieldName as string]"
                  :required="isFieldRequired(item.fieldName as string)"
                  :disabled="disabled"
                  :readonly="readonly"
                  @update:value="updateFieldValue(item.fieldName as string, $event)"
                />
              </template>
            </LayoutContainer>
          </div>
        </div>
      </template>

      <!-- 无分组的情况 -->
      <template v-else>
        <LayoutContainer :layout="globalLayout" :items="getAllFieldsLayoutItems()">
          <template #default="{ item }">
            <SchemaField
              :value="getFieldValue(item.fieldName as string)"
              :schema="schema.properties![item.fieldName as string]"
              :ui-schema="getFieldUiSchema(item.fieldName as string)"
              :root-form-data="formData"
              :path="[item.fieldName as string]"
              :required="isFieldRequired(item.fieldName as string)"
              :disabled="disabled"
              :readonly="readonly"
              @update:value="updateFieldValue(item.fieldName as string, $event)"
            />
          </template>
        </LayoutContainer>
      </template>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import type {
  FieldGroup,
  JsonSchema,
  JsonSchemaValue,
  LayoutConfig,
  UiSchema,
} from '@/types/schema'
import type { FormInst } from 'naive-ui'
import { NCard, NForm } from 'naive-ui'
import { computed, ref } from 'vue'
import SchemaField from './SchemaField.vue'
import LayoutContainer from './components/LayoutContainer.vue'

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

// 全局布局配置
const globalLayout = computed((): LayoutConfig | undefined => {
  return props.uiSchema?.['*']?.['ui:layout'] as LayoutConfig | undefined
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
      layout: globalLayout.value,
    })
  }

  // 添加分组的字段
  Object.keys(groups).forEach((groupTitle) => {
    // 获取分组的布局配置（如果有的话）
    const groupLayout = props.uiSchema?.[`group:${groupTitle}`]?.['ui:layout'] as
      | LayoutConfig
      | undefined

    result.push({
      title: groupTitle,
      fields: groups[groupTitle],
      layout: groupLayout || globalLayout.value,
    })
  })

  return result
})

const hasGroups = computed(() => {
  return fieldGroups.value.some((group) => group.title !== '')
})

// 为分组字段创建布局项目
const getGroupLayoutItems = (fields: string[]) => {
  return fields.map((fieldName) => ({
    key: fieldName,
    fieldName,
    layout: getFieldUiSchema(fieldName)?.['ui:layout'] as LayoutConfig | undefined,
  }))
}

// 为所有字段创建布局项目
const getAllFieldsLayoutItems = () => {
  return Object.keys(orderedProperties.value).map((fieldName) => ({
    key: fieldName,
    fieldName,
    layout: getFieldUiSchema(fieldName)?.['ui:layout'] as LayoutConfig | undefined,
  }))
}

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
  const valid = true

  if (!props.schema.properties) {
    return { valid: true, errors: {} }
  }

  // TODO: 实现字段验证逻辑

  return { valid, errors }
}

// 重置表单
const reset = () => {
  const resetData: Record<string, JsonSchemaValue> = {}

  if (props.schema.properties) {
    Object.keys(props.schema.properties).forEach((key) => {
      const fieldSchema = props.schema.properties![key]
      resetData[key] = fieldSchema.default || null
    })
  }

  emit('update:modelValue', resetData)
}

defineExpose({
  validate,
  reset,
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

.group-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
