import type { VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createTestSchema,
  createTestUiSchema,
  expectEventEmitted,
  mountWidget,
  TEST_DATA,
} from '../../__tests__/test-utils'
import StringWidget from '../StringWidget.vue'

describe('StringWidget', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mountWidget(StringWidget)
  })

  describe('基本渲染', () => {
    it('应该正确渲染 n-input 组件', () => {
      expect(wrapper.find('.n-input').exists()).toBe(true)
    })

    it('应该显示正确的初始值', async () => {
      wrapper = mountWidget(StringWidget, {
        value: TEST_DATA.strings.short,
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe(TEST_DATA.strings.short)
    })

    it('应该显示正确的占位符', () => {
      const placeholder = 'Enter your name'
      wrapper = mountWidget(StringWidget, {
        uiSchema: createTestUiSchema({
          'ui:placeholder': placeholder,
        }),
      })

      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe(placeholder)
    })
  })

  describe('输入类型处理', () => {
    it('应该根据 format 设置正确的输入类型 - text', () => {
      wrapper = mountWidget(StringWidget, {
        schema: createTestSchema('string', { format: 'email' }),
      })

      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('text')
    })

    it('应该根据 format 设置正确的输入类型 - password', () => {
      wrapper = mountWidget(StringWidget, {
        schema: createTestSchema('string', { format: 'password' }),
      })

      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('password')
    })

    it('应该默认使用 text 类型', () => {
      wrapper = mountWidget(StringWidget, {
        schema: createTestSchema('string'),
      })

      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('text')
    })
  })

  describe('状态控制', () => {
    it('应该正确设置禁用状态', () => {
      wrapper = mountWidget(StringWidget, {
        disabled: true,
      })

      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('应该正确设置只读状态', () => {
      wrapper = mountWidget(StringWidget, {
        readonly: true,
      })

      const input = wrapper.find('input')
      expect(input.attributes('readonly')).toBeDefined()
    })

    it('应该同时处理多个状态', () => {
      wrapper = mountWidget(StringWidget, {
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
      const newValue = TEST_DATA.strings.short
      const input = wrapper.find('input')

      await input.setValue(newValue)
      await input.trigger('input')

      expectEventEmitted(wrapper, 'update:value', newValue)
      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该处理空字符串输入', async () => {
      const input = wrapper.find('input')

      await input.setValue(TEST_DATA.strings.empty)
      await input.trigger('input')

      expectEventEmitted(wrapper, 'update:value', TEST_DATA.strings.empty)
      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该处理长文本输入', async () => {
      const input = wrapper.find('input')

      await input.setValue(TEST_DATA.strings.long)
      await input.trigger('input')

      expectEventEmitted(wrapper, 'update:value', TEST_DATA.strings.long)
      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该处理特殊字符输入', async () => {
      const input = wrapper.find('input')

      await input.setValue(TEST_DATA.strings.special)
      await input.trigger('input')

      expectEventEmitted(wrapper, 'update:value', TEST_DATA.strings.special)
      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该处理中文字符输入', async () => {
      const input = wrapper.find('input')

      await input.setValue(TEST_DATA.strings.chinese)
      await input.trigger('input')

      expectEventEmitted(wrapper, 'update:value', TEST_DATA.strings.chinese)
      expect(wrapper.emitted('update:value')).toBeTruthy()
    })
  })

  describe('Props 响应性', () => {
    it('应该响应 value 属性的变化', async () => {
      const newValue = TEST_DATA.strings.short

      await wrapper.setProps({ value: newValue })

      const input = wrapper.find('input')
      expect(input.element.value).toBe(newValue)
    })

    it('应该响应 disabled 属性的变化', async () => {
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeUndefined()

      await wrapper.setProps({ disabled: true })
      expect(input.attributes('disabled')).toBeDefined()

      await wrapper.setProps({ disabled: false })
      expect(input.attributes('disabled')).toBeUndefined()
    })

    it('应该响应 placeholder 的变化', async () => {
      const newPlaceholder = 'New placeholder'

      await wrapper.setProps({
        uiSchema: createTestUiSchema({
          'ui:placeholder': newPlaceholder,
        }),
      })

      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe(newPlaceholder)
    })
  })

  describe('边界情况', () => {
    it('应该处理 null 值', async () => {
      wrapper = mountWidget(StringWidget, {
        value: null,
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('')
    })

    it('应该处理 undefined 值', async () => {
      wrapper = mountWidget(StringWidget, {
        value: undefined,
      })

      const input = wrapper.find('input')
      expect(input.element.value).toBe('')
    })

    it('应该处理没有 uiSchema 的情况', () => {
      wrapper = mountWidget(StringWidget, {
        uiSchema: undefined,
      })

      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('应该处理空的 uiSchema', () => {
      wrapper = mountWidget(StringWidget, {
        uiSchema: {},
      })

      expect(wrapper.find('input').exists()).toBe(true)
    })
  })

  describe('事件处理', () => {
    it('应该在每次输入变化时都触发事件', async () => {
      const input = wrapper.find('input')

      await input.setValue('a')
      await input.trigger('input')

      await input.setValue('ab')
      await input.trigger('input')

      await input.setValue('abc')
      await input.trigger('input')

      const events = wrapper.emitted('update:value')
      expect(events).toHaveLength(3)
      expect(events![0][0]).toBe('a')
      expect(events![1][0]).toBe('ab')
      expect(events![2][0]).toBe('abc')
    })

    it('应该在清空输入时触发空字符串事件', async () => {
      // 先设置一个值
      const input = wrapper.find('input')
      await input.setValue('test')
      await input.trigger('input')

      // 然后清空
      await input.setValue('')
      await input.trigger('input')

      const events = wrapper.emitted('update:value')
      expect(events).toHaveLength(2)
      expect(events![1][0]).toBe('')
    })
  })

  describe('Naive UI 集成', () => {
    it('应该正确传递 Naive UI 的 props', () => {
      // 测试组件是否正确使用了 n-input 组件
      const nInput = wrapper.find('.n-input')
      expect(nInput.exists()).toBe(true)
    })

    it('应该处理 Naive UI 的事件系统', async () => {
      // 测试是否正确绑定了 @update:value 事件
      const input = wrapper.find('input')
      await input.setValue('test')
      await input.trigger('input')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })
  })
})
