<template>
  <n-input-number
    :value="value as number"
    :placeholder="uiSchema?.['ui:placeholder'] as string"
    :disabled="disabled"
    :readonly="readonly"
    :min="schema.minimum"
    :max="schema.maximum"
    :step="step"
    style="width: 100%"
    @update:value="handleChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NInputNumber } from 'naive-ui'
import type { CustomWidgetProps, JsonSchemaValue } from '@/types/schema'

const props = defineProps<CustomWidgetProps>()

const emit = defineEmits<{
  'update:value': [value: JsonSchemaValue]
}>()

const step = computed(() => {
  return props.schema.type === 'integer' ? 1 : 0.1
})

const handleChange = (newValue: number | null) => {
  emit('update:value', newValue)
}
</script>
