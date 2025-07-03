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

// 布局配置接口
export interface LayoutConfig {
  // 列数配置
  columns?: number | 'auto'
  // 栅格配置 (24栅格系统)
  span?: number
  offset?: number
  // 响应式配置
  xs?: number // <576px
  sm?: number // ≥576px
  md?: number // ≥768px
  lg?: number // ≥992px
  xl?: number // ≥1200px
  xxl?: number // ≥1600px
  // 自定义样式类
  className?: string
  // 内容对齐
  align?: 'left' | 'center' | 'right'
  // 垂直对齐
  verticalAlign?: 'top' | 'middle' | 'bottom'
  // 间距控制
  gutter?: number | [number, number] // [水平间距, 垂直间距]
  // 字段容器样式
  style?: Record<string, string | number>
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
  // 新增布局配置
  'ui:layout'?: LayoutConfig
  // 允许任意其他属性
  [key: string]: JsonSchemaValue | LayoutConfig | undefined
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
  layout?: LayoutConfig // 分组级别的布局配置
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
