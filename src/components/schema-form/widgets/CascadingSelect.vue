<template>
  <n-select
    :value="value"
    :options="computedOptions"
    :placeholder="placeholderText"
    :disabled="disabled || computedDisabled"
    :loading="loading"
    :clearable="clearable"
    @update:value="handleChange"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { NSelect } from 'naive-ui'
import type { CustomWidgetProps, JsonSchemaValue } from '@/types/schema'

const props = defineProps<CustomWidgetProps>()

const emit = defineEmits<{
  'update:value': [value: JsonSchemaValue]
}>()

const loading = ref(false)
const options = ref<Array<{ label: string; value: JsonSchemaValue }>>([])

const uiOptions = computed(() => {
  return (props.uiSchema?.['ui:options'] as Record<string, JsonSchemaValue>) || {}
})

const placeholderText = computed(() => {
  return (props.uiSchema?.['ui:placeholder'] as string) || '请选择'
})

const dependsOn = computed(() => {
  return uiOptions.value.dependsOn as string | undefined
})

const endpoint = computed(() => {
  return uiOptions.value.endpoint as string | undefined
})

const clearable = computed(() => {
  return (uiOptions.value.clearable as boolean) ?? true
})

const dependentValue = computed(() => {
  if (!dependsOn.value) return undefined
  return props.rootFormData[dependsOn.value]
})

const computedDisabled = computed(() => {
  return dependsOn.value && !dependentValue.value
})

const computedOptions = computed(() => {
  return options.value
})

const fetchOptions = async (dependentVal: JsonSchemaValue) => {
  if (!endpoint.value || !dependentVal) {
    options.value = []
    return
  }

  loading.value = true
  try {
    const url = endpoint.value.replace(/\{(\w+)\}/g, (match, key) => {
      if (key === dependsOn.value) {
        return String(dependentVal)
      }
      return match
    })

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    const dataPath = uiOptions.value.dataPath as string | undefined
    let optionsData = data

    if (dataPath) {
      const paths = dataPath.split('.')
      for (const path of paths) {
        optionsData = optionsData?.[path]
      }
    }

    if (Array.isArray(optionsData)) {
      const labelField = (uiOptions.value.labelField as string) || 'label'
      const valueField = (uiOptions.value.valueField as string) || 'value'

      options.value = optionsData.map((item) => ({
        label: String(item[labelField] || item),
        value: item[valueField] !== undefined ? item[valueField] : item,
      }))
    } else {
      console.warn('API response is not an array:', optionsData)
      options.value = []
    }
  } catch (error) {
    console.error('Failed to fetch options:', error)
    options.value = []
  } finally {
    loading.value = false
  }
}

watch(
  dependentValue,
  async (newVal, oldVal) => {
    if (newVal !== oldVal) {
      if (props.value) {
        emit('update:value', null)
      }

      if (newVal) {
        await fetchOptions(newVal)
      } else {
        options.value = []
      }
    }
  },
  { immediate: true },
)

onMounted(() => {
  const staticOptions = uiOptions.value.enumOptions as
    | Array<{ label: string; value: JsonSchemaValue }>
    | undefined

  if (staticOptions) {
    options.value = staticOptions
  } else if (!dependsOn.value && endpoint.value && !endpoint.value.includes('{')) {
    fetchOptions('')
  }
})

const handleChange = (newValue: JsonSchemaValue) => {
  emit('update:value', newValue)
}
</script>
