import type { CustomWidgetProps, JsonSchema, JsonSchemaValue, UiSchema } from '@/types/schema'
import { mount, VueWrapper } from '@vue/test-utils'
import { expect, vi } from 'vitest'
import type { Component } from 'vue'

/**
 * 创建 Widget 的默认 props
 */
export function createDefaultWidgetProps(
  overrides: Partial<CustomWidgetProps> = {},
): CustomWidgetProps {
  return {
    value: null,
    schema: {
      type: 'string',
      title: 'Test Field',
    },
    uiSchema: {},
    rootFormData: {},
    path: ['testField'],
    required: false,
    disabled: false,
    readonly: false,
    ...overrides,
  }
}

/**
 * 挂载 Widget 组件的辅助函数
 */
export function mountWidget(
  component: Component,
  props: Partial<CustomWidgetProps> = {},
): VueWrapper {
  const defaultProps = createDefaultWidgetProps(props)

  return mount(component, {
    props: defaultProps,
    global: {
      stubs: {
        // 可以在这里添加需要 stub 的组件
      },
    },
  })
}

/**
 * 创建测试用的 Schema
 */
export function createTestSchema(
  type: JsonSchema['type'],
  overrides: Partial<JsonSchema> = {},
): JsonSchema {
  const baseSchema: JsonSchema = {
    type,
    title: `Test ${type} Field`,
    ...overrides,
  }

  return baseSchema
}

/**
 * 创建测试用的 UiSchema
 */
export function createTestUiSchema(overrides: Partial<UiSchema> = {}): UiSchema {
  return {
    'ui:placeholder': 'Test placeholder',
    ...overrides,
  }
}

/**
 * 等待组件更新
 */
export async function waitForUpdate(wrapper: VueWrapper): Promise<void> {
  await wrapper.vm.$nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * 模拟输入事件
 */
export async function triggerInput(
  wrapper: VueWrapper,
  selector: string,
  value: JsonSchemaValue,
): Promise<void> {
  const input = wrapper.find(selector)
  if (input.exists()) {
    await input.setValue(value)
    await input.trigger('input')
    await waitForUpdate(wrapper)
  }
}

/**
 * 模拟点击事件
 */
export async function triggerClick(wrapper: VueWrapper, selector: string): Promise<void> {
  const element = wrapper.find(selector)
  if (element.exists()) {
    await element.trigger('click')
    await waitForUpdate(wrapper)
  }
}

/**
 * 验证事件是否被触发
 */
export function expectEventEmitted(
  wrapper: VueWrapper,
  eventName: string,
  expectedValue?: JsonSchemaValue,
): void {
  const events = wrapper.emitted(eventName)
  expect(events).toBeTruthy()

  if (expectedValue !== undefined && events) {
    const lastEvent = events[events.length - 1]
    expect(lastEvent[0]).toEqual(expectedValue)
  }
}

/**
 * 创建复杂对象用于测试
 */
export const TEST_DATA = {
  // 字符串测试数据
  strings: {
    empty: '',
    short: 'test',
    long: 'This is a very long test string that exceeds normal length',
    special: 'Test with special chars: @#$%^&*()',
    chinese: '测试中文字符',
    email: 'test@example.com',
    invalidEmail: 'invalid-email',
  },

  // 数字测试数据
  numbers: {
    zero: 0,
    positive: 42,
    negative: -10,
    decimal: 3.14159,
    large: 1000000,
    invalid: NaN,
  },

  // 数组测试数据
  arrays: {
    empty: [],
    strings: ['item1', 'item2', 'item3'],
    objects: [
      { name: 'John', age: 25 },
      { name: 'Jane', age: 30 },
    ],
    mixed: ['string', 42, true, null],
  },

  // 对象测试数据
  objects: {
    empty: {},
    simple: { name: 'test', value: 123 },
    nested: {
      user: {
        profile: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    },
  },
}

/**
 * 创建模拟的 fetch 函数
 */
export function createMockFetch(response: Record<string, unknown>, delay = 0) {
  return vi.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve(response),
          })
        }, delay)
      }),
  )
}
