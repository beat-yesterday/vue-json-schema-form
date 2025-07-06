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

      const checkbox = wrapper.find('.n-checkbox')
      expect(checkbox.classes()).toContain('n-checkbox--checked')
    })

    it('应该显示正确的初始值 - false', async () => {
      wrapper = mountWidget(BooleanWidget, {
        value: false,
        schema: createTestSchema('boolean'),
      })

      const checkbox = wrapper.find('.n-checkbox')
      expect(checkbox.classes()).not.toContain('n-checkbox--checked')
    })

    it('应该显示正确的标签文本 - schema.title', () => {
      const title = 'Enable notifications'
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean', { title }),
      })

      const label = wrapper.find('.n-checkbox__label')
      expect(label.text()).toBe(title)
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

      const checkbox = wrapper.find('.n-checkbox')
      expect(checkbox.classes()).toContain('n-checkbox--disabled')
    })

    it('应该在禁用状态下不响应点击', async () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        disabled: true,
        value: false,
      })

      const checkbox = wrapper.find('.n-checkbox')
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

      const checkbox = wrapper.find('.n-checkbox')
      await checkbox.trigger('click')

      expectEventEmitted(wrapper, 'update:value', true)
      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该在点击时触发 update:value 事件 - true to false', async () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        value: true,
      })

      const checkbox = wrapper.find('.n-checkbox')
      await checkbox.trigger('click')

      expectEventEmitted(wrapper, 'update:value', false)
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

      let checkbox = wrapper.find('.n-checkbox')
      expect(checkbox.classes()).not.toContain('n-checkbox--checked')

      await wrapper.setProps({ value: true })

      checkbox = wrapper.find('.n-checkbox')
      expect(checkbox.classes()).toContain('n-checkbox--checked')
    })

    it('应该响应 value 属性的变化 - true to false', async () => {
      await wrapper.setProps({ value: true })

      let checkbox = wrapper.find('.n-checkbox')
      expect(checkbox.classes()).toContain('n-checkbox--checked')

      await wrapper.setProps({ value: false })

      checkbox = wrapper.find('.n-checkbox')
      expect(checkbox.classes()).not.toContain('n-checkbox--checked')
    })

    it('应该响应 disabled 属性的变化', async () => {
      const checkbox = wrapper.find('.n-checkbox')
      expect(checkbox.classes()).not.toContain('n-checkbox--disabled')

      await wrapper.setProps({ disabled: true })
      expect(checkbox.classes()).toContain('n-checkbox--disabled')

      await wrapper.setProps({ disabled: false })
      expect(checkbox.classes()).not.toContain('n-checkbox--disabled')
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

      const checkbox = wrapper.find('.n-checkbox')
      expect(checkbox.classes()).not.toContain('n-checkbox--checked')
    })

    it('应该处理 undefined 值', async () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean'),
        value: undefined,
      })

      const checkbox = wrapper.find('.n-checkbox')
      expect(checkbox.classes()).not.toContain('n-checkbox--checked')
    })

    it('应该处理没有 title 和 placeholder 的情况', () => {
      wrapper = mountWidget(BooleanWidget, {
        schema: createTestSchema('boolean', { title: undefined }),
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
      const componentInstance = wrapper.vm as unknown as typeof BooleanWidget

      // 直接调用 handleChange 方法
      componentInstance.handleChange(true)
      componentInstance.handleChange(false)
      componentInstance.handleChange(true)

      const events = wrapper.emitted('update:value')
      expect(events).toBeTruthy()
      expect(events!.length).toBe(3)
      expect(events![0][0]).toBe(true)
      expect(events![1][0]).toBe(false)
      expect(events![2][0]).toBe(true)
    })

    it('应该正确处理快速连续点击', async () => {
      const checkbox = wrapper.find('.n-checkbox')

      // 快速连续点击
      await checkbox.trigger('click')
      await checkbox.trigger('click')
      await checkbox.trigger('click')
      await checkbox.trigger('click')

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
      const checkbox = wrapper.find('.n-checkbox')
      await checkbox.trigger('click')

      expect(wrapper.emitted('update:value')).toBeTruthy()
    })

    it('应该支持 Naive UI 的样式系统', () => {
      const nCheckbox = wrapper.find('.n-checkbox')
      expect(nCheckbox.classes()).toContain('n-checkbox')
    })
  })

  describe('可访问性', () => {
    it('应该支持键盘导航', async () => {
      const checkbox = wrapper.find('.n-checkbox')

      // 验证元素具有使其可聚焦的属性
      expect(checkbox.exists()).toBe(true)
      expect(checkbox.attributes('tabindex')).toBeDefined()
    })

    it('应该有正确的 ARIA 属性', () => {
      const checkbox = wrapper.find('.n-checkbox')

      expect(checkbox.attributes('role')).toBe('checkbox')
      expect(checkbox.attributes('aria-checked')).toBeDefined()
      expect(checkbox.attributes('aria-checked')).toBe('false')
    })
  })
})
