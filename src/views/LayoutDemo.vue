<template>
  <div class="layout-demo">
    <n-space vertical size="large">
      <n-card title="表单布局演示">
        <n-tabs>
          <n-tab-pane name="columns" tab="列布局">
            <JsonSchemaForm
              v-model="formData.columns"
              :schema="schemas.columns"
              :ui-schema="uiSchemas.columns"
            />
          </n-tab-pane>

          <n-tab-pane name="grid" tab="栅格布局">
            <JsonSchemaForm
              v-model="formData.grid"
              :schema="schemas.grid"
              :ui-schema="uiSchemas.grid"
            />
          </n-tab-pane>

          <n-tab-pane name="responsive" tab="响应式布局">
            <JsonSchemaForm
              v-model="formData.responsive"
              :schema="schemas.responsive"
              :ui-schema="uiSchemas.responsive"
            />
          </n-tab-pane>

          <n-tab-pane name="grouped" tab="分组布局">
            <JsonSchemaForm
              v-model="formData.grouped"
              :schema="schemas.grouped"
              :ui-schema="uiSchemas.grouped"
            />
          </n-tab-pane>
        </n-tabs>
      </n-card>

      <n-card title="表单数据">
        <n-tabs>
          <n-tab-pane name="columns-data" tab="列布局数据">
            <n-code
              :code="JSON.stringify(formData.columns, null, 2)"
              language="json"
              show-line-numbers
            />
          </n-tab-pane>

          <n-tab-pane name="grid-data" tab="栅格布局数据">
            <n-code
              :code="JSON.stringify(formData.grid, null, 2)"
              language="json"
              show-line-numbers
            />
          </n-tab-pane>

          <n-tab-pane name="responsive-data" tab="响应式布局数据">
            <n-code
              :code="JSON.stringify(formData.responsive, null, 2)"
              language="json"
              show-line-numbers
            />
          </n-tab-pane>

          <n-tab-pane name="grouped-data" tab="分组布局数据">
            <n-code
              :code="JSON.stringify(formData.grouped, null, 2)"
              language="json"
              show-line-numbers
            />
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import JsonSchemaForm from '@/components/schema-form/JsonSchemaForm.vue'
import type { JsonSchema, UiSchema } from '@/types/schema'
import { NCard, NCode, NSpace, NTabPane, NTabs } from 'naive-ui'
import { reactive } from 'vue'

// 表单数据
const formData = reactive({
  columns: {
    name: '',
    email: '',
    phone: '',
    address: '',
  },
  grid: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  },
  responsive: {
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
  },
  grouped: {
    // 基本信息
    name: '',
    email: '',
    // 联系方式
    phone: '',
    address: '',
    // 其他信息
    bio: '',
    interests: [],
  },
})

// Schema 定义
const schemas: Record<string, JsonSchema> = {
  // 列布局 Schema
  columns: {
    type: 'object',
    title: '用户信息表单',
    properties: {
      name: {
        type: 'string',
        title: '姓名',
      },
      email: {
        type: 'string',
        title: '邮箱',
        format: 'email',
      },
      phone: {
        type: 'string',
        title: '手机号',
      },
      address: {
        type: 'string',
        title: '地址',
      },
    },
    required: ['name', 'email'],
  },

  // 栅格布局 Schema
  grid: {
    type: 'object',
    title: '详细信息表单',
    properties: {
      firstName: {
        type: 'string',
        title: '名',
      },
      lastName: {
        type: 'string',
        title: '姓',
      },
      email: {
        type: 'string',
        title: '邮箱',
        format: 'email',
      },
      phone: {
        type: 'string',
        title: '手机号',
      },
      address: {
        type: 'string',
        title: '地址',
      },
      city: {
        type: 'string',
        title: '城市',
      },
    },
    required: ['firstName', 'lastName', 'email'],
  },

  // 响应式布局 Schema
  responsive: {
    type: 'object',
    title: '响应式表单',
    properties: {
      name: {
        type: 'string',
        title: '姓名',
      },
      email: {
        type: 'string',
        title: '邮箱',
        format: 'email',
      },
      phone: {
        type: 'string',
        title: '手机号',
      },
      address: {
        type: 'string',
        title: '地址',
      },
      bio: {
        type: 'string',
        title: '个人简介',
      },
    },
    required: ['name', 'email'],
  },

  // 分组布局 Schema
  grouped: {
    type: 'object',
    title: '分组表单',
    properties: {
      name: {
        type: 'string',
        title: '姓名',
      },
      email: {
        type: 'string',
        title: '邮箱',
        format: 'email',
      },
      phone: {
        type: 'string',
        title: '手机号',
      },
      address: {
        type: 'string',
        title: '地址',
      },
      bio: {
        type: 'string',
        title: '个人简介',
      },
      interests: {
        type: 'array',
        title: '兴趣爱好',
        items: {
          type: 'string',
          enum: ['阅读', '运动', '音乐', '旅游', '编程'],
        },
      },
    },
    required: ['name', 'email'],
  },
}

// UI Schema 定义
const uiSchemas: Record<string, Record<string, UiSchema>> = {
  // 列布局配置
  columns: {
    '*': {
      'ui:layout': {
        columns: 2,
        gutter: [16, 16],
        align: 'left',
      },
    },
    address: {
      'ui:layout': {
        span: 2, // 地址字段占两列
      },
    },
  },

  // 栅格布局配置
  grid: {
    '*': {
      'ui:layout': {
        md: 3,
        sm: 2,
        xs: 1,
        gutter: [16, 16],
      },
    },
    firstName: {
      'ui:layout': {
        span: 1,
      },
    },
    lastName: {
      'ui:layout': {
        span: 1,
      },
    },
    email: {
      'ui:layout': {
        span: 1,
      },
    },
    phone: {
      'ui:layout': {
        span: 1,
      },
    },
    address: {
      'ui:layout': {
        span: 2,
      },
    },
    city: {
      'ui:layout': {
        span: 1,
      },
    },
  },

  // 响应式布局配置
  responsive: {
    '*': {
      'ui:layout': {
        xxl: 4,
        xl: 3,
        lg: 2,
        md: 2,
        sm: 1,
        xs: 1,
        gutter: [16, 16],
      },
    },
    bio: {
      'ui:layout': {
        span: 4, // 简介字段在大屏下占满整行
      },
    },
  },

  // 分组布局配置
  grouped: {
    name: {
      'ui:group': '基本信息',
    },
    email: {
      'ui:group': '基本信息',
    },
    phone: {
      'ui:group': '联系方式',
    },
    address: {
      'ui:group': '联系方式',
    },
    bio: {
      'ui:group': '其他信息',
    },
    interests: {
      'ui:group': '其他信息',
    },
    'group:基本信息': {
      'ui:layout': {
        columns: 2,
        gutter: [16, 16],
      },
    },
    'group:联系方式': {
      'ui:layout': {
        columns: 1,
        gutter: [16, 16],
      },
    },
    'group:其他信息': {
      'ui:layout': {
        columns: 1,
        gutter: [16, 16],
      },
    },
  },
}
</script>

<style scoped>
.layout-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
