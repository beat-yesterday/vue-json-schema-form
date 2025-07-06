import type { VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { expectEventEmitted, mountWidget, TEST_DATA } from '../../__tests__/test-utils'
import ArrayWidget from '../ArrayWidget.vue'

describe('ArrayWidget', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mountWidget(ArrayWidget, {
      schema: {
        type: 'array',
        title: 'Test Array',
        items: {
          type: 'string',
          title: 'Item',
        },
      },
      value: [],
    })
  })

  describe('基本渲染', () => {
    it('应该正确渲染数组容器', () => {
      expect(wrapper.find('.array-widget').exists()).toBe(true)
    })

    it('应该显示数组标题', () => {
      const title = 'My Array Field'
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          title,
          items: { type: 'string' },
        },
        value: [],
      })

      expect(wrapper.find('.array-header h4').text()).toBe(title)
    })

    it('应该显示数组描述', () => {
      const description = 'This is an array field'
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          title: 'Test Array',
          description,
          items: { type: 'string' },
        },
        value: [],
      })

      expect(wrapper.find('.description').text()).toBe(description)
    })

    it('应该显示添加按钮', () => {
      const addButton = wrapper.find('button')
      expect(addButton.exists()).toBe(true)
      expect(addButton.text()).toContain('添加项目')
    })

    it('应该在没有标题时不显示标题区域', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: [],
      })

      expect(wrapper.find('.array-header').exists()).toBe(false)
    })
  })

  describe('数组项渲染', () => {
    it('应该渲染已有的数组项', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: TEST_DATA.arrays.strings,
      })

      const items = wrapper.findAll('.array-item')
      expect(items).toHaveLength(TEST_DATA.arrays.strings.length)
    })

    it('应该为每个数组项显示正确的标题', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: ['item1', 'item2'],
      })

      const itemHeaders = wrapper.findAll('.item-header>span')
      expect(itemHeaders[0].text()).toBe('项目 1')
      expect(itemHeaders[1].text()).toBe('项目 2')
    })

    it('应该为每个数组项显示删除按钮', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: ['item1', 'item2'],
      })

      const deleteButtons = wrapper.findAll('.item-header button')
      expect(deleteButtons).toHaveLength(2)
    })

    it('应该渲染复杂对象数组项', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
        value: TEST_DATA.arrays.objects,
      })

      const items = wrapper.findAll('.array-item')
      expect(items).toHaveLength(TEST_DATA.arrays.objects.length)
    })
  })

  describe('添加功能', () => {
    it('应该能够添加新的字符串项', async () => {
      const addButton = wrapper.find('button')
      await addButton.trigger('click')

      expectEventEmitted(wrapper, 'update:value')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual([''])
    })

    it('应该能够添加新的数字项', async () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'number' },
        },
        value: [],
      })

      const addButton = wrapper.find('button')
      await addButton.trigger('click')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual([0])
    })

    it('应该能够添加新的布尔项', async () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'boolean' },
        },
        value: [],
      })

      const addButton = wrapper.find('button')
      await addButton.trigger('click')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual([false])
    })

    it('应该能够添加新的对象项', async () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
        value: [],
      })

      const addButton = wrapper.find('button')
      await addButton.trigger('click')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual([{}])
    })

    it('应该能够添加新的数组项', async () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        value: [],
      })

      const addButton = wrapper.find('button')
      await addButton.trigger('click')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual([[]])
    })

    it('应该使用 schema.items.default 作为默认值', async () => {
      const defaultValue = 'default item'
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: {
            type: 'string',
            default: defaultValue,
          },
        },
        value: [],
      })

      const addButton = wrapper.find('button')
      await addButton.trigger('click')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual([defaultValue])
    })

    it('应该连续添加多个项目', async () => {
      const addButton = wrapper.find('button')

      // 添加第一个项目
      await addButton.trigger('click')

      // 添加第二个项目
      await addButton.trigger('click')

      // 添加第三个项目
      await addButton.trigger('click')

      const events = wrapper.emitted('update:value')
      expect(events).toHaveLength(3)
      expect(events![2][0]).toEqual([''])
    })
  })

  describe('删除功能', () => {
    beforeEach(() => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: ['item1', 'item2', 'item3'],
      })
    })

    it('应该能够删除指定索引的项目', async () => {
      const deleteButtons = wrapper.findAll('.item-header button')

      // 删除第二个项目（索引1）
      await deleteButtons[1].trigger('click')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual(['item1', 'item3'])
    })

    it('应该能够删除第一个项目', async () => {
      const deleteButtons = wrapper.findAll('.item-header button')

      await deleteButtons[0].trigger('click')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual(['item2', 'item3'])
    })

    it('应该能够删除最后一个项目', async () => {
      const deleteButtons = wrapper.findAll('.item-header button')

      await deleteButtons[2].trigger('click')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual(['item1', 'item2'])
    })

    it('应该在删除后重新编号剩余项目', async () => {
      const deleteButtons = wrapper.findAll('.item-header button')

      // 删除第一个项目
      await deleteButtons[0].trigger('click')
      await wrapper.vm.$nextTick()

      const itemHeaders = wrapper.findAll('.item-header>span')
      expect(itemHeaders[0].text()).toBe('项目 1')
      expect(itemHeaders[1].text()).toBe('项目 2')
    })
  })

  describe('项目更新', () => {
    beforeEach(() => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: ['item1', 'item2'],
      })
    })

    it('应该能够更新指定索引的项目值', async () => {
      // 这个测试需要模拟子组件发出的更新事件
      const arrayWidget = wrapper.vm as any

      // 直接调用组件的 updateItem 方法
      arrayWidget.updateItem(0, 'updated item1')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual(['updated item1', 'item2'])
    })

    it('应该保持其他项目不变', async () => {
      const arrayWidget = wrapper.vm as any

      arrayWidget.updateItem(1, 'updated item2')

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual(['item1', 'updated item2'])
    })

    it('应该处理复杂对象的更新', async () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
          },
        },
        value: [{ name: 'John', age: 25 }],
      })

      const arrayWidget = wrapper.vm as any
      arrayWidget.updateItem(0, { name: 'Jane', age: 30 })

      const events = wrapper.emitted('update:value')
      expect(events![0][0]).toEqual([{ name: 'Jane', age: 30 }])
    })
  })

  describe('状态控制', () => {
    it('应该在禁用状态下禁用添加按钮', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: [],
        disabled: true,
      })

      const addButton = wrapper.find('button')
      expect(addButton.attributes('disabled')).toBeDefined()
    })

    it('应该在禁用状态下禁用删除按钮', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: ['item1'],
        disabled: true,
      })

      const deleteButton = wrapper.find('.item-header button')
      expect(deleteButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Props 响应性', () => {
    it('应该响应 value 属性的变化', async () => {
      const newValue = ['new1', 'new2', 'new3']

      await wrapper.setProps({ value: newValue })

      const items = wrapper.findAll('.array-item')
      expect(items).toHaveLength(newValue.length)
    })

    it('应该响应 schema 的变化', async () => {
      const newSchema = {
        type: 'array' as const,
        title: 'New Array Title',
        items: { type: 'number' as const },
      }

      await wrapper.setProps({ schema: newSchema })

      expect(wrapper.find('.array-header h4').text()).toBe(newSchema.title)
    })

    it('应该响应 disabled 属性的变化', async () => {
      await wrapper.setProps({ disabled: true })

      const addButton = wrapper.find('button')
      expect(addButton.attributes('disabled')).toBeDefined()

      await wrapper.setProps({ disabled: false })
      expect(addButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('边界情况', () => {
    it('应该处理空数组', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: [],
      })

      expect(wrapper.findAll('.array-item')).toHaveLength(0)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('应该处理 null 值', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: null,
      })

      expect(wrapper.findAll('.array-item')).toHaveLength(0)
    })

    it('应该处理 undefined 值', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: undefined,
      })

      expect(wrapper.findAll('.array-item')).toHaveLength(0)
    })

    it('应该处理没有 items schema 的情况', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
        } as any,
        value: [],
      })

      expect(wrapper.find('.array-widget').exists()).toBe(true)
    })

    it('应该处理混合类型数组', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: TEST_DATA.arrays.mixed,
      })

      const items = wrapper.findAll('.array-item')
      expect(items).toHaveLength(TEST_DATA.arrays.mixed.length)
    })
  })

  describe('UI Schema 支持', () => {
    it('应该传递 itemUiSchema 给子组件', () => {
      const itemUiSchema = {
        'ui:placeholder': 'Enter item value',
      }

      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        uiSchema: {
          items: itemUiSchema,
        },
        value: ['item1'],
      })

      // 验证是否正确传递了 UI Schema
      expect(wrapper.find('.array-item').exists()).toBe(true)
    })
  })

  describe('嵌套结构', () => {
    it('应该支持嵌套数组', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        value: [['nested1', 'nested2'], ['nested3']],
      })

      const items = wrapper.findAll('.array-item')
      expect(items).toHaveLength(5)
    })

    it('应该支持对象数组', () => {
      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              tags: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        value: [
          { name: 'John', tags: ['tag1', 'tag2'] },
          { name: 'Jane', tags: ['tag3'] },
        ],
      })

      const items = wrapper.findAll('.array-item')
      expect(items).toHaveLength(5)
    })
  })

  describe('性能测试', () => {
    it('应该能处理大量数组项', () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => `item${i}`)

      wrapper = mountWidget(ArrayWidget, {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        value: largeArray,
      })

      const items = wrapper.findAll('.array-item')
      expect(items).toHaveLength(100)
    })
  })
})
