<template>
  <div class="object-widget">
    <div class="object-header" v-if="schema.title">
      <h4>{{ schema.title }}</h4>
      <p v-if="schema.description" class="description">{{ schema.description }}</p>
    </div>

    <div class="object-properties">
      <div
        v-for="(propertySchema, propertyName) in orderedProperties"
        :key="propertyName"
        class="property-field"
      >
        <SchemaField
          :value="objectValue[propertyName]"
          :schema="propertySchema"
          :ui-schema="getPropertyUiSchema(propertyName)"
          :root-form-data="rootFormData"
          :path="[...path, propertyName]"
          :required="isRequired(propertyName)"
          :disabled="disabled"
          :readonly="readonly"
          @update:value="updateProperty(propertyName, $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomWidgetProps, JsonSchemaValue, JsonSchema, UiSchema } from '@/types/schema'
import SchemaField from '../SchemaField.vue'

const props = defineProps<CustomWidgetProps>()

const emit = defineEmits<{
  'update:value': [value: JsonSchemaValue]
}>()

const objectValue = computed(() => {
  return (props.value as Record<string, JsonSchemaValue>) || {}
})

const orderedProperties = computed(() => {
  const properties = props.schema.properties || {}
  const uiOrder = props.uiSchema?.['ui:order'] as string[] | undefined

  if (uiOrder) {
    const ordered: Record<string, JsonSchema> = {}
    // 先按指定顺序添加
    uiOrder.forEach((key) => {
      if (properties[key]) {
        ordered[key] = properties[key]
      }
    })
    // 再添加未指定顺序的属性
    Object.keys(properties).forEach((key) => {
      if (!uiOrder.includes(key)) {
        ordered[key] = properties[key]
      }
    })
    return ordered
  }

  return properties
})

const getPropertyUiSchema = (propertyName: string): UiSchema | undefined => {
  const uiSchemaObj = props.uiSchema as Record<string, UiSchema> | undefined
  return uiSchemaObj?.[propertyName]
}

const isRequired = (propertyName: string): boolean => {
  return props.schema.required?.includes(propertyName) || false
}

const updateProperty = (propertyName: string, newValue: JsonSchemaValue) => {
  const newObject = { ...objectValue.value, [propertyName]: newValue }
  emit('update:value', newObject)
}
</script>

<style scoped>
.object-widget {
  width: 100%;
}

.object-header {
  margin-bottom: 16px;
}

.object-header h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.description {
  margin: 0;
  color: var(--n-text-color-2);
  font-size: 14px;
}

.property-field {
  margin-bottom: 16px;
}

.property-field:last-child {
  margin-bottom: 0;
}
</style>
