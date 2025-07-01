<template>
  <div class="array-widget">
    <div class="array-header" v-if="schema.title">
      <h4>{{ schema.title }}</h4>
      <p v-if="schema.description" class="description">{{ schema.description }}</p>
    </div>

    <div class="array-items">
      <div v-for="(item, index) in arrayValue" :key="index" class="array-item">
        <n-card embedded style="margin-bottom: 8px">
          <template #header>
            <div class="item-header">
              <span>项目 {{ index + 1 }}</span>
              <n-button text type="error" @click="removeItem(index)" :disabled="disabled">
                <template #icon>
                  <n-icon><TrashOutline /></n-icon>
                </template>
              </n-button>
            </div>
          </template>

          <SchemaField
            :value="item"
            :schema="schema.items!"
            :ui-schema="itemUiSchema"
            :root-form-data="rootFormData"
            :path="[...path, index.toString()]"
            :disabled="disabled"
            :readonly="readonly"
            @update:value="updateItem(index, $event)"
          />
        </n-card>
      </div>
    </div>

    <n-button @click="addItem" :disabled="disabled" style="margin-top: 8px" dashed block>
      <template #icon>
        <n-icon><AddOutline /></n-icon>
      </template>
      添加项目
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NButton, NIcon } from 'naive-ui'
import { AddOutline, TrashOutline } from '@vicons/ionicons5'
import type { CustomWidgetProps, JsonSchemaValue, UiSchema } from '@/types/schema'
import SchemaField from '../SchemaField.vue'

const props = defineProps<CustomWidgetProps>()

const emit = defineEmits<{
  'update:value': [value: JsonSchemaValue]
}>()

const arrayValue = computed(() => {
  return Array.isArray(props.value) ? props.value : []
})

const itemUiSchema = computed((): UiSchema | undefined => {
  return props.uiSchema?.items as UiSchema | undefined
})

const getDefaultValue = (): JsonSchemaValue => {
  if (props.schema.items?.default !== undefined) {
    return props.schema.items.default
  }

  switch (props.schema.items?.type) {
    case 'object':
      return {}
    case 'array':
      return []
    case 'string':
      return ''
    case 'number':
    case 'integer':
      return 0
    case 'boolean':
      return false
    default:
      return null
  }
}

const addItem = () => {
  const newArray = [...arrayValue.value, getDefaultValue()]
  emit('update:value', newArray)
}

const removeItem = (index: number) => {
  const newArray = arrayValue.value.filter((_, i) => i !== index)
  emit('update:value', newArray)
}

const updateItem = (index: number, newValue: JsonSchemaValue) => {
  const newArray = [...arrayValue.value]
  newArray[index] = newValue
  emit('update:value', newArray)
}
</script>

<style scoped>
.array-widget {
  width: 100%;
}

.array-header {
  margin-bottom: 16px;
}

.array-header h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.description {
  margin: 0;
  color: var(--n-text-color-2);
  font-size: 14px;
}

.array-item {
  position: relative;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
