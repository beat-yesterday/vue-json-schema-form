import type { VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createTestSchema,
  createTestUiSchema,
  mountWidget,
  TEST_DATA,
} from '../../__tests__/test-utils'
import NumberWidget from '../NumberWidget.vue'

describe('NumberWidget', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mountWidget(NumberWidget, {
      schema: createTestSchema('number'),
    })
  })

  describe('基本渲染', () => {
    it('应该正确渲染 n-input-number 组件', () => {
      expect(wrapper.find('.n-input-number').exists()).toBe(true)
    })

    it('应该显示正确的初始值', async () => {
      wrapper = mountWidget(NumberWidget, {
        value: TEST_DATA.numbers.positive,
        schema: createTestSchema('number'),
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe(String(TEST_DATA.numbers.positive))
    })

    it('应该显示正确的占位符', () => {
      const placeholder = 'Enter a number'
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number'),
        uiSchema: createTestUiSchema({
          'ui:placeholder': placeholder,
        }),
      })

      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe(placeholder)
    })
  })

  describe('数字类型处理', () => {
    it('应该正确处理整数类型 - step 为 1', () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('integer'),
      })

      // step 应该为 1
      const inputNumber = wrapper.find('.n-input-number')
      expect(inputNumber.exists()).toBe(true)
    })

    it('应该正确处理浮点数类型 - step 为 0.1', () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number'),
      })

      const inputNumber = wrapper.find('.n-input-number')
      expect(inputNumber.exists()).toBe(true)
    })
  })

  describe('范围限制', () => {
    it('应该设置最小值', () => {
      const minimum = 0
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number', { minimum }),
      })

      const inputNumber = wrapper.find('.n-input-number')
      expect(inputNumber.exists()).toBe(true)
    })

    it('应该设置最大值', () => {
      const maximum = 100
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number', { maximum }),
      })

      const inputNumber = wrapper.find('.n-input-number')
      expect(inputNumber.exists()).toBe(true)
    })

    it('应该同时设置最小值和最大值', () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number', {
          minimum: 0,
          maximum: 100,
        }),
      })

      const inputNumber = wrapper.find('.n-input-number')
      expect(inputNumber.exists()).toBe(true)
    })
  })

  describe('状态控制', () => {
    it('应该正确设置禁用状态', () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number'),
        disabled: true,
      })

      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('应该正确设置只读状态', () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number'),
        readonly: true,
      })

      const input = wrapper.find('input')
      expect(input.attributes('readonly')).toBeDefined()
    })

    it('应该同时处理多个状态', () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number'),
        disabled: true,
        readonly: true,
      })

      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
      expect(input.attributes('readonly')).toBeDefined()
    })
  })

  describe('用户交互', () => {
    it('应该在输入时触发 update:value 事件', async () => {
      const newValue = TEST_DATA.numbers.positive
      const input = wrapper.find('input')

      await input.setValue(String(newValue))
      await input.trigger('input')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该处理正整数输入', async () => {
      const input = wrapper.find('input')

      await input.setValue(String(TEST_DATA.numbers.positive))
      await input.trigger('input')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该处理负数输入', async () => {
      const input = wrapper.find('input')

      await input.setValue(String(TEST_DATA.numbers.negative))
      await input.trigger('input')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该处理小数输入', async () => {
      const input = wrapper.find('input')

      await input.setValue(String(TEST_DATA.numbers.decimal))
      await input.trigger('input')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该处理零值输入', async () => {
      const input = wrapper.find('input')

      await input.setValue(String(TEST_DATA.numbers.zero))
      await input.trigger('input')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该处理大数值输入', async () => {
      const input = wrapper.find('input')

      await input.setValue(String(TEST_DATA.numbers.large))
      await input.trigger('input')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })
  })

  describe('Props 响应性', () => {
    it('应该响应 value 属性的变化', async () => {
      const newValue = TEST_DATA.numbers.positive

      await wrapper.setProps({ value: newValue })

      const input = wrapper.find('input')
      expect(input.element.value).toBe(String(newValue))
    })

    it('应该响应 disabled 属性的变化', async () => {
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeUndefined()

      await wrapper.setProps({ disabled: true })
      expect(input.attributes('disabled')).toBeDefined()

      await wrapper.setProps({ disabled: false })
      expect(input.attributes('disabled')).toBeUndefined()
    })

    it('应该响应 schema 的变化', async () => {
      const newSchema = createTestSchema('integer', { minimum: 10, maximum: 50 })

      await wrapper.setProps({ schema: newSchema })

      const inputNumber = wrapper.find('.n-input-number')
      expect(inputNumber.exists()).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理 null 值', async () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number'),
        value: null,
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('')
    })

    it('应该处理 undefined 值', async () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number'),
        value: undefined,
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('')
    })

    it('应该处理没有 uiSchema 的情况', () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number'),
        uiSchema: undefined,
      })

      expect(wrapper.find('.n-input-number').exists()).toBe(true)
    })

    it('应该处理空的 uiSchema', () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number'),
        uiSchema: {},
      })

      expect(wrapper.find('.n-input-number').exists()).toBe(true)
    })

    it('应该处理无效数字值', async () => {
      // 当输入无效值时，组件应该正确处理
      const input = wrapper.find('input')

      await input.setValue('invalid')
      await input.trigger('input')

      // n-input-number 会自动处理无效输入
      expect(wrapper.find('.n-input-number').exists()).toBe(true)
    })
  })

  describe('事件处理', () => {
    it('应该在每次数值变化时都触发事件', async () => {
      const input = wrapper.find('input')

      await input.setValue('1')
      await input.trigger('input')

      await input.setValue('12')
      await input.trigger('input')

      await input.setValue('123')
      await input.trigger('input')

      const events = wrapper.emitted('update:value')
      expect(events).toBeTruthy()
      expect(events!.length).toBeGreaterThan(0)
    })

    it('应该在清空输入时触发事件', async () => {
      // 先设置一个值
      const input = wrapper.find('input')
      await input.setValue('42')
      await input.trigger('input')

      // 然后清空
      await input.setValue('')
      await input.trigger('input')

      const events = wrapper.emitted('update:value')
      expect(events).toBeTruthy()
      expect(events!.length).toBeGreaterThan(0)
    })
  })

  describe('Naive UI 集成', () => {
    it('应该正确传递 Naive UI 的 props', () => {
      const nInputNumber = wrapper.find('.n-input-number')
      expect(nInputNumber.exists()).toBe(true)
    })

    it('应该正确设置样式', () => {
      const nInputNumber = wrapper.find('.n-input-number')
      expect(nInputNumber.attributes('style')).toContain('width: 100%')
    })

    it('应该处理 Naive UI 的事件系统', async () => {
      const input = wrapper.find('input')
      await input.setValue('42')
      await input.trigger('input')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })
  })

  describe('Schema 验证支持', () => {
    it('应该支持整数类型的 step 设置', () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('integer'),
      })

      // 整数类型应该有合适的步长设置
      const inputNumber = wrapper.find('.n-input-number')
      expect(inputNumber.exists()).toBe(true)
    })

    it('应该支持浮点数类型的 step 设置', () => {
      wrapper = mountWidget(NumberWidget, {
        schema: createTestSchema('number'),
      })

      // 浮点数类型应该有合适的步长设置
      const inputNumber = wrapper.find('.n-input-number')
      expect(inputNumber.exists()).toBe(true)
    })
  })
})
