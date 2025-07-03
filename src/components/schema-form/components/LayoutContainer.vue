<template>
  <div :class="containerClass" :style="containerStyle">
    <div v-if="isGridLayout" class="layout-grid" :style="gridStyle">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="getItemClass(item)"
        :style="getItemStyle(item)"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>

    <div v-else-if="isColumnsLayout" class="layout-columns" :style="columnsStyle">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="layout-column-item"
        :style="columnItemStyle"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>

    <!-- 默认布局 -->
    <div v-else class="layout-default">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="getItemClass(item)"
        :style="getItemStyle(item)"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LayoutConfig } from '@/types/schema'
import { computed } from 'vue'

interface LayoutItem {
  key: string
  fieldName: string
  layout?: LayoutConfig
  [key: string]: unknown
}

interface Props {
  layout?: LayoutConfig
  items: LayoutItem[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
})

// 判断是否为栅格布局
const isGridLayout = computed(() => {
  return (
    props.layout?.span !== undefined ||
    props.layout?.xs !== undefined ||
    props.layout?.sm !== undefined ||
    props.layout?.md !== undefined ||
    props.layout?.lg !== undefined ||
    props.layout?.xl !== undefined ||
    props.layout?.xxl !== undefined
  )
})

// 判断是否为列布局
const isColumnsLayout = computed(() => {
  return props.layout?.columns !== undefined && !isGridLayout.value
})

// 容器类名
const containerClass = computed(() => {
  const classes = ['layout-container']

  if (props.layout?.className) {
    classes.push(props.layout.className)
  }

  if (props.layout?.align) {
    classes.push(`layout-align-${props.layout.align}`)
  }

  return classes
})

// 容器样式
const containerStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.layout?.style) {
    Object.assign(style, props.layout.style)
  }

  return style
})

// 栅格样式
const gridStyle = computed(() => {
  const style: Record<string, string> = {
    display: 'grid',
    width: '100%',
  }

  if (props.layout?.gutter) {
    const gutter = Array.isArray(props.layout.gutter)
      ? props.layout.gutter
      : [props.layout.gutter, props.layout.gutter]

    style.columnGap = `${gutter[0]}px`
    style.rowGap = `${gutter[1]}px`
  }

  // 设置响应式栅格
  const breakpoints = [
    { key: 'xxl', value: props.layout?.xxl, minWidth: '1600px' },
    { key: 'xl', value: props.layout?.xl, minWidth: '1200px' },
    { key: 'lg', value: props.layout?.lg, minWidth: '992px' },
    { key: 'md', value: props.layout?.md, minWidth: '768px' },
    { key: 'sm', value: props.layout?.sm, minWidth: '576px' },
    { key: 'xs', value: props.layout?.xs, minWidth: '0px' },
  ]

  // 找到最大的有效断点值作为默认列数
  const defaultColumns = breakpoints.find((bp) => bp.value !== undefined)?.value || 1
  style.gridTemplateColumns = `repeat(${defaultColumns}, 1fr)`

  return style
})

// 列布局样式
const columnsStyle = computed(() => {
  const style: Record<string, string> = {
    display: 'grid',
    width: '100%',
  }

  const columns = props.layout?.columns
  if (columns === 'auto') {
    style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))'
  } else if (typeof columns === 'number') {
    style.gridTemplateColumns = `repeat(${columns}, 1fr)`
  }

  if (props.layout?.gutter) {
    const gutter = Array.isArray(props.layout.gutter)
      ? props.layout.gutter
      : [props.layout.gutter, props.layout.gutter]

    style.columnGap = `${gutter[0]}px`
    style.rowGap = `${gutter[1]}px`
  }

  return style
})

// 列项目样式
const columnItemStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.layout?.verticalAlign) {
    style.alignSelf =
      props.layout.verticalAlign === 'top'
        ? 'start'
        : props.layout.verticalAlign === 'bottom'
          ? 'end'
          : 'center'
  }

  return style
})

// 获取项目类名
const getItemClass = (item: LayoutItem) => {
  const classes = ['layout-item']

  if (item.layout?.className) {
    classes.push(item.layout.className)
  }

  return classes
}

// 获取项目样式
const getItemStyle = (item: LayoutItem) => {
  const style: Record<string, string> = {}

  // 栅格布局项目样式
  if (isGridLayout.value) {
    const itemLayout = item.layout || props.layout

    if (itemLayout?.span) {
      style.gridColumn = `span ${itemLayout.span}`
    }

    if (itemLayout?.offset) {
      style.gridColumnStart = `${itemLayout.offset + 1}`
    }
  }

  if (item.layout?.style) {
    Object.assign(style, item.layout.style)
  }

  if (props.layout?.verticalAlign && !isColumnsLayout.value) {
    style.alignSelf =
      props.layout.verticalAlign === 'top'
        ? 'start'
        : props.layout.verticalAlign === 'bottom'
          ? 'end'
          : 'center'
  }

  return style
}
</script>

<style scoped>
.layout-container {
  width: 100%;
}

.layout-grid,
.layout-columns {
  width: 100%;
}

.layout-default {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.layout-item {
  min-width: 0; /* 防止内容溢出 */
}

.layout-column-item {
  min-width: 0;
}

/* 对齐样式 */
.layout-align-left {
  text-align: left;
}

.layout-align-center {
  text-align: center;
}

.layout-align-right {
  text-align: right;
}

/* 响应式栅格 */
@media (max-width: 575px) {
  .layout-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (min-width: 576px) and (max-width: 767px) {
  .layout-grid[data-sm] {
    grid-template-columns: var(--sm-columns) !important;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .layout-grid[data-md] {
    grid-template-columns: var(--md-columns) !important;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .layout-grid[data-lg] {
    grid-template-columns: var(--lg-columns) !important;
  }
}

@media (min-width: 1200px) and (max-width: 1599px) {
  .layout-grid[data-xl] {
    grid-template-columns: var(--xl-columns) !important;
  }
}

@media (min-width: 1600px) {
  .layout-grid[data-xxl] {
    grid-template-columns: var(--xxl-columns) !important;
  }
}
</style>
