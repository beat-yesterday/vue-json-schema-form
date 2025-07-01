export type JsonSchemaValue =
  | string
  | number
  | boolean
  | null
  | JsonSchemaValue[]
  | { [key: string]: JsonSchemaValue }

export interface JsonSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'integer'
  title?: string
  description?: string
  properties?: Record<string, JsonSchema>
  items?: JsonSchema
  required?: string[]
  enum?: JsonSchemaValue[]
  enumNames?: string[]
  oneOf?: Array<{ const: JsonSchemaValue; title?: string }>
  const?: JsonSchemaValue
  default?: JsonSchemaValue
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
}

export interface UiSchema {
  'ui:widget'?: string
  'ui:options'?: Record<string, JsonSchemaValue>
  'ui:group'?: string
  'ui:hidden'?: boolean
  'ui:disabled'?: boolean
  'ui:readonly'?: boolean
  'ui:placeholder'?: string
  'ui:help'?: string
  'ui:order'?: string[]
  [key: string]: JsonSchemaValue | undefined
}

export interface CustomWidgetProps {
  value: JsonSchemaValue
  schema: JsonSchema
  uiSchema?: UiSchema
  rootFormData: Record<string, JsonSchemaValue>
  path: string[]
  required?: boolean
  disabled?: boolean
  readonly?: boolean
}

export interface CustomWidgetEvents {
  'update:value': [value: JsonSchemaValue]
}

export interface FieldGroup {
  title: string
  fields: string[]
}

export interface ValidationError {
  path: string[]
  message: string
}

export interface FormContext {
  formData: Record<string, JsonSchemaValue>
  schema: JsonSchema
  uiSchema?: Record<string, UiSchema>
  errors: ValidationError[]
}
