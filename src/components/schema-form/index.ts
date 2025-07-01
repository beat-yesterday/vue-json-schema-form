export { default as JsonSchemaForm } from './JsonSchemaForm.vue'
export { default as SchemaField } from './SchemaField.vue'

export { default as ArrayWidget } from './widgets/ArrayWidget.vue'
export { default as BooleanWidget } from './widgets/BooleanWidget.vue'
export { default as CascadingSelect } from './widgets/CascadingSelect.vue'
export { default as NumberWidget } from './widgets/NumberWidget.vue'
export { default as ObjectWidget } from './widgets/ObjectWidget.vue'
export { default as SelectWidget } from './widgets/SelectWidget.vue'
export { default as StringWidget } from './widgets/StringWidget.vue'

export { WidgetRegistry, widgetRegistry } from './WidgetRegistry'

export type {
  CustomWidgetEvents,
  CustomWidgetProps,
  FieldGroup,
  FormContext,
  JsonSchema,
  JsonSchemaValue,
  UiSchema,
  ValidationError,
} from '@/types/schema'
