<template>
  <n-checkbox :checked="value as boolean" :disabled="disabled" @update:checked="handleChange">
    {{ schema.title || uiSchema?.['ui:placeholder'] }}
  </n-checkbox>
</template>

<script setup lang="ts">
import { NCheckbox } from 'naive-ui'
import type { CustomWidgetProps, JsonSchemaValue } from '@/types/schema'

defineProps<CustomWidgetProps>()

const emit = defineEmits<{
  'update:value': [value: JsonSchemaValue]
}>()

const handleChange = (checked: boolean) => {
  emit('update:value', checked)
}
</script>
