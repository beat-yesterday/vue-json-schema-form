<template>
  <n-input
    :value="value as string"
    :placeholder="uiSchema?.['ui:placeholder'] as string"
    :disabled="disabled"
    :readonly="readonly"
    :type="inputType"
    @update:value="handleChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NInput } from 'naive-ui'
import type { CustomWidgetProps, JsonSchemaValue } from '@/types/schema'

const props = defineProps<CustomWidgetProps>()

const emit = defineEmits<{
  'update:value': [value: JsonSchemaValue]
}>()

const inputType = computed(() => {
  const format = props.schema.format
  switch (format) {
    case 'email':
      return 'text'
    case 'password':
      return 'password'
    default:
      return 'text'
  }
})

const handleChange = (newValue: string) => {
  emit('update:value', newValue)
}
</script>
