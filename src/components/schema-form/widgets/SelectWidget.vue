<template>
  <n-select
    :value="value"
    :options="options"
    :placeholder="uiSchema?.['ui:placeholder'] as string"
    :disabled="disabled"
    :loading="loading"
    @update:value="handleChange"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NSelect } from 'naive-ui'
import type { CustomWidgetProps, JsonSchemaValue } from '@/types/schema'

const props = defineProps<CustomWidgetProps>()

const emit = defineEmits<{
  'update:value': [value: JsonSchemaValue]
}>()

const loading = ref(false)

const options = computed(() => {
  if (props.schema.enum) {
    return props.schema.enum.map((value) => ({
      label: String(value),
      value: value,
    }))
  }

  // 从 uiSchema 中获取选项
  const uiOptions = props.uiSchema?.['ui:options'] as Record<string, JsonSchemaValue> | undefined
  if (uiOptions?.enumOptions) {
    const enumOptions = uiOptions.enumOptions as Array<{ label: string; value: JsonSchemaValue }>
    return enumOptions
  }

  return []
})

const handleChange = (newValue: JsonSchemaValue) => {
  emit('update:value', newValue)
}
</script>
