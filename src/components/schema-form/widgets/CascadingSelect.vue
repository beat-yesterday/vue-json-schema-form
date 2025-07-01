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

// 静态选项过滤逻辑
const filterStaticOptions = (dependentVal: JsonSchemaValue) => {
  const staticOptions = uiOptions.value.enumOptions as
    | Array<{ label: string; value: JsonSchemaValue; dependsOnValue?: JsonSchemaValue }>
    | undefined

  console.log('🔄 CascadingSelect: 过滤静态选项', {
    dependsOn: dependsOn.value,
    dependentVal,
    staticOptions: staticOptions?.length,
  })

  if (!staticOptions) {
    options.value = []
    return
  }

  if (!dependsOn.value) {
    // 没有依赖关系，显示所有选项
    console.log('📋 CascadingSelect: 无依赖关系，显示所有选项')
    options.value = staticOptions
    return
  }

  if (!dependentVal) {
    // 依赖值为空，清空选项
    console.log('🚫 CascadingSelect: 依赖值为空，清空选项')
    options.value = []
    return
  }

  // 根据依赖值过滤选项
  const filteredOptions = staticOptions.filter((option) => {
    if (option.dependsOnValue !== undefined) {
      return option.dependsOnValue === dependentVal
    }
    // 如果没有指定 dependsOnValue，则显示该选项（向后兼容）
    return true
  })

  console.log('✅ CascadingSelect: 过滤完成', {
    原始选项数: staticOptions.length,
    过滤后选项数: filteredOptions.length,
    过滤后选项: filteredOptions.map((o) => o.label),
  })

  options.value = filteredOptions
}

watch(
  dependentValue,
  async (newVal, oldVal) => {
    console.log('👀 CascadingSelect: 依赖值变化', {
      字段: dependsOn.value,
      旧值: oldVal,
      新值: newVal,
      当前值: props.value,
    })

    if (newVal !== oldVal) {
      if (props.value) {
        console.log('🧹 CascadingSelect: 清空当前值')
        emit('update:value', null)
      }

      if (newVal) {
        // 优先使用静态选项，然后是API端点
        const staticOptions = uiOptions.value.enumOptions
        if (staticOptions) {
          console.log('📊 CascadingSelect: 使用静态选项')
          filterStaticOptions(newVal)
        } else {
          console.log('🌐 CascadingSelect: 使用API端点')
          await fetchOptions(newVal)
        }
      } else {
        console.log('🚫 CascadingSelect: 依赖值为空，清空所有选项')
        options.value = []
      }
    }
  },
  { immediate: true },
)

onMounted(() => {
  console.log('🚀 CascadingSelect: 组件初始化', {
    字段路径: props.path,
    依赖字段: dependsOn.value,
    当前依赖值: dependentValue.value,
    有静态选项: !!uiOptions.value.enumOptions,
    有API端点: !!endpoint.value,
  })

  const staticOptions = uiOptions.value.enumOptions as
    | Array<{ label: string; value: JsonSchemaValue }>
    | undefined

  if (staticOptions) {
    if (!dependsOn.value) {
      // 没有依赖，显示所有静态选项
      console.log('📋 CascadingSelect: 初始化 - 显示所有静态选项')
      options.value = staticOptions
    } else {
      // 有依赖，根据当前依赖值过滤
      console.log('🔗 CascadingSelect: 初始化 - 根据依赖值过滤选项')
      filterStaticOptions(dependentValue.value)
    }
  } else if (!dependsOn.value && endpoint.value && !endpoint.value.includes('{')) {
    console.log('🌐 CascadingSelect: 初始化 - 加载API数据')
    fetchOptions('')
  } else {
    console.log('⏳ CascadingSelect: 初始化 - 等待依赖值')
  }
})

const handleChange = (newValue: JsonSchemaValue) => {
  emit('update:value', newValue)
}
</script>
