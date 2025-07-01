import type { VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createTestSchema,
  createTestUiSchema,
  expectEventEmitted,
  mountWidget,
} from '../../__tests__/test-utils'
import BooleanWidget from '../BooleanWidget.vue'

describe('BooleanWidget', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mountWidget(BooleanWidget, {
      schema: createTestSchema('boolean'),
    })
  })

  describe('基本渲染', () => {
    it('应该正确渲染 n-checkbox 组件', () => {
      expect(wrapper.find('.n-checkbox').exists()).toBe(true)
    })

    it('应该显示正确的初始值 - true', async () => {
      wrapper = mountWidget(BooleanWidget, {
        value: true,
        schema: createTestSchema('boolean'),
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(true)
    })

    it('应该显示正确的初始值 - false', async () => {
      wrapper = mountWidget(BooleanWidget, {
        value: false,
        schema: createTestSchema('boolean'),
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(false)
    })

    it('应该显示正确的标签文本 - schema.title', () => {
      const title = 'Enable notifications'
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean', { title }),
      })

      const label = wrapper.find('.n-checkbox__label')
      expect(label.text()).toBe(title)
    })

    it('应该显示正确的标签文本 - ui:placeholder', () => {
      const placeholder = 'Check this option'
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        uiSchema: createTestUiSchema({
          'ui:placeholder': placeholder,
        }),
      })

      const label = wrapper.find('.n-checkbox__label')
      expect(label.text()).toBe(placeholder)
    })

    it('应该优先显示 schema.title 而不是 ui:placeholder', () => {
      const title = 'Schema Title'
      const placeholder = 'UI Placeholder'

      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean', { title }),
        uiSchema: createTestUiSchema({
          'ui:placeholder': placeholder,
        }),
      })

      const label = wrapper.find('.n-checkbox__label')
      expect(label.text()).toBe(title)
    })
  })

  describe('状态控制', () => {
    it('应该正确设置禁用状态', () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        disabled: true,
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.attributes('disabled')).toBeDefined()
    })

    it('应该在禁用状态下不响应点击', async () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        disabled: true,
        value: false,
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      await checkbox.trigger('click')

      // 禁用状态下不应该触发 update:value 事件
      expect(wrapper.emitted('update:value')).toBeFalsy()
    })
  })

  describe('用户交互', () => {
    it('应该在点击时触发 update:value 事件 - false to true', async () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        value: false,
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      await checkbox.setChecked(true)

      expectEventEmitted(wrapper, 'update:value', true)
      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该在点击时触发 update:value 事件 - true to false', async () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        value: true,
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      await checkbox.setChecked(false)

      expectEventEmitted(wrapper, 'update:value', false)
      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该通过键盘操作触发事件', async () => {
      const checkbox = wrapper.find('input[type="checkbox"]')

      await checkbox.trigger('keydown.space')

      // 应该触发状态变化
      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该支持标签点击切换状态', async () => {
      const label = wrapper.find('.n-checkbox')

      await label.trigger('click')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })
  })

  describe('Props 响应性', () => {
    it('应该响应 value 属性的变化 - false to true', async () => {
      await wrapper.setProps({ value: false })

      let checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(false)

      await wrapper.setProps({ value: true })

      checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(true)
    })

    it('应该响应 value 属性的变化 - true to false', async () => {
      await wrapper.setProps({ value: true })

      let checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(true)

      await wrapper.setProps({ value: false })

      checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(false)
    })

    it('应该响应 disabled 属性的变化', async () => {
      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.attributes('disabled')).toBeUndefined()

      await wrapper.setProps({ disabled: true })
      expect(checkbox.attributes('disabled')).toBeDefined()

      await wrapper.setProps({ disabled: false })
      expect(checkbox.attributes('disabled')).toBeUndefined()
    })

    it('应该响应 schema.title 的变化', async () => {
      const newTitle = 'New checkbox label'

      await wrapper.setProps({
        schema: createTestSchema('boolean', { title: newTitle }),
      })

      const label = wrapper.find('.n-checkbox__label')
      expect(label.text()).toBe(newTitle)
    })
  })

  describe('边界情况', () => {
    it('应该处理 null 值', async () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        value: null,
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(false)
    })

    it('应该处理 undefined 值', async () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        value: undefined,
      })

      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(false)
    })

    it('应该处理没有 title 和 placeholder 的情况', () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        uiSchema: {},
      })

      const label = wrapper.find('.n-checkbox__label')
      expect(label.text()).toBe('')
    })

    it('应该处理没有 uiSchema 的情况', () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        uiSchema: undefined,
      })

      expect(wrapper.find('.n-checkbox').exists()).toBe(true)
    })

    it('应该处理空的 schema.title', () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean', { title: '' }),
        uiSchema: createTestUiSchema({
          'ui:placeholder': 'Fallback text',
        }),
      })

      const label = wrapper.find('.n-checkbox__label')
      expect(label.text()).toBe('Fallback text')
    })
  })

  describe('事件处理', () => {
    it('应该在每次状态变化时都触发事件', async () => {
      const checkbox = wrapper.find('input[type="checkbox"]')

      // 第一次点击
      await checkbox.setChecked(true)

      // 第二次点击
      await checkbox.setChecked(false)

      // 第三次点击
      await checkbox.setChecked(true)

      const events = wrapper.emitted('update:value')
      expect(events).toBeTruthy()
      expect(events!.length).toBe(3)
      expect(events![0][0]).toBe(true)
      expect(events![1][0]).toBe(false)
      expect(events![2][0]).toBe(true)
    })

    it('应该正确处理快速连续点击', async () => {
      const checkbox = wrapper.find('input[type="checkbox"]')

      // 快速连续点击
      await checkbox.setChecked(true)
      await checkbox.setChecked(false)
      await checkbox.setChecked(true)
      await checkbox.setChecked(false)

      const events = wrapper.emitted('update:value')
      expect(events).toBeTruthy()
      expect(events!.length).toBe(4)
    })
  })

  describe('Naive UI 集成', () => {
    it('应该正确传递 Naive UI 的 props', () => {
      const nCheckbox = wrapper.find('.n-checkbox')
      expect(nCheckbox.exists()).toBe(true)
    })

    it('应该处理 Naive UI 的事件系统', async () => {
      const checkbox = wrapper.find('input[type="checkbox"]')
      await checkbox.setChecked(true)

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该支持 Naive UI 的样式系统', () => {
      const nCheckbox = wrapper.find('.n-checkbox')
      expect(nCheckbox.classes()).toContain('n-checkbox')
    })
  })

  describe('可访问性', () => {
    it('应该支持键盘导航', async () => {
      const checkbox = wrapper.find('input[type="checkbox"]')

      // 模拟 Tab 键聚焦
      await checkbox.trigger('focus')
      expect(document.activeElement).toBe(checkbox.element)
    })

    it('应该支持空格键切换', async () => {
      const checkbox = wrapper.find('input[type="checkbox"]')

      await checkbox.trigger('keydown.space')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该有正确的 ARIA 属性', () => {
      const checkbox = wrapper.find('input[type="checkbox"]')

      expect(checkbox.attributes('type')).toBe('checkbox')
      expect(checkbox.attributes('role')).toBe(undefined) // native checkbox 不需要额外的 role
    })
  })

  describe('真值处理', () => {
    it('应该将真值转换为 true', async () => {
      const truthyValues = [1, '1', 'true', 'yes', 'on']

      for (const value of truthyValues) {
        wrapper = mountWidget(BooleanWidget, {
          schema: createTestSchema('boolean'),
          value: value,
        })

        const checkbox = wrapper.find('input[type="checkbox"]')
        expect(checkbox.element.checked).toBe(true)
      }
    })

    it('应该将假值转换为 false', async () => {
      const falsyValues = [0, '0', 'false', 'no', 'off', '', null, undefined]

      for (const value of falsyValues) {
        wrapper = mountWidget(BooleanWidget, {
          schema: createTestSchema('boolean'),
          value: value,
        })

        const checkbox = wrapper.find('input[type="checkbox"]')
        expect(checkbox.element.checked).toBe(false)
      }
    })
  })
})
