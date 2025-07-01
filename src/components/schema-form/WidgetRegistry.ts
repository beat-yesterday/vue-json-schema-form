import type { JsonSchema, UiSchema } from '@/types/schema'
import type { Component } from 'vue'

export interface WidgetResolver {
  (schema: JsonSchema, uiSchema?: UiSchema): string | undefined
}

export class WidgetRegistry {
  private widgets: Map<string, Component> = new Map()
  private resolvers: WidgetResolver[] = []

  /**
   * 注册一个自定义控件
   */
  register(name: string, component: Component): void {
    this.widgets.set(name, component)
  }

  /**
   * 获取指定名称的控件
   */
  get(name: string): Component | undefined {
    return this.widgets.get(name)
  }

  /**
   * 添加一个控件解析器
   */
  addResolver(resolver: WidgetResolver): void {
    this.resolvers.push(resolver)
  }

  /**
   * 根据 schema 和 uiSchema 解析出应该使用的控件名称
   */
  resolve(schema: JsonSchema, uiSchema?: UiSchema): string {
    // 优先使用 uiSchema 中明确指定的控件
    if (uiSchema?.['ui:widget']) {
      return uiSchema['ui:widget']
    }

    // 使用自定义解析器
    for (const resolver of this.resolvers) {
      const result = resolver(schema, uiSchema)
      if (result) {
        return result
      }
    }

    // 默认的类型映射
    const typeMapping: Record<string, string> = {
      string: 'StringWidget',
      number: 'NumberWidget',
      integer: 'NumberWidget',
      boolean: 'BooleanWidget',
      object: 'ObjectWidget',
      array: 'ArrayWidget',
    }

    return typeMapping[schema.type] || 'StringWidget'
  }

  /**
   * 获取所有已注册的控件名称
   */
  getWidgetNames(): string[] {
    return Array.from(this.widgets.keys())
  }
}

// 创建全局注册表实例
export const widgetRegistry = new WidgetRegistry()
