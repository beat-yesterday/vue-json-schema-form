<template>
  <div class="schema-form-demo">
    <n-card title="JSON Schema 动态表单演示" style="margin-bottom: 24px">
      <p>
        这是一个基于 Vue 3 和 Naive UI 的动态表单库演示，支持分组、动态数组、字段依赖等高级功能。
      </p>
    </n-card>

    <n-tabs type="line" animated>
      <n-tab-pane name="basic" tab="基础功能">
        <div class="demo-section">
          <n-card title="基础表单示例" style="margin-bottom: 24px">
            <JsonSchemaForm
              v-model="basicFormData"
              :schema="basicSchema"
              :ui-schema="basicUiSchema"
              @update:modelValue="handleBasicFormChange"
            />

            <n-divider />

            <n-card title="表单数据" size="small">
              <n-code :code="JSON.stringify(basicFormData, null, 2)" language="json" />
            </n-card>
          </n-card>
        </div>
      </n-tab-pane>

      <n-tab-pane name="groups" tab="分组功能">
        <div class="demo-section">
          <n-card title="分组表单示例" style="margin-bottom: 24px">
            <JsonSchemaForm
              v-model="groupFormData"
              :schema="groupSchema"
              :ui-schema="groupUiSchema"
              @update:modelValue="handleGroupFormChange"
            />

            <n-divider />

            <n-card title="表单数据" size="small">
              <n-code :code="JSON.stringify(groupFormData, null, 2)" language="json" />
            </n-card>
          </n-card>
        </div>
      </n-tab-pane>

      <n-tab-pane name="array" tab="动态数组">
        <div class="demo-section">
          <n-card title="动态数组示例" style="margin-bottom: 24px">
            <JsonSchemaForm
              v-model="arrayFormData"
              :schema="arraySchema"
              :ui-schema="arrayUiSchema"
              @update:modelValue="handleArrayFormChange"
            />

            <n-divider />

            <n-card title="表单数据" size="small">
              <n-code :code="JSON.stringify(arrayFormData, null, 2)" language="json" />
            </n-card>
          </n-card>
        </div>
      </n-tab-pane>

      <n-tab-pane name="cascading" tab="级联选择">
        <div class="demo-section">
          <n-card title="级联选择示例" style="margin-bottom: 24px">
            <JsonSchemaForm
              v-model="cascadingFormData"
              :schema="cascadingSchema"
              :ui-schema="cascadingUiSchema"
              @update:modelValue="handleCascadingFormChange"
            />

            <n-divider />

            <n-card title="表单数据" size="small">
              <n-code :code="JSON.stringify(cascadingFormData, null, 2)" language="json" />
            </n-card>
          </n-card>
        </div>
      </n-tab-pane>

      <n-tab-pane name="complex" tab="综合示例">
        <div class="demo-section">
          <n-card title="综合功能示例" style="margin-bottom: 24px">
            <JsonSchemaForm
              v-model="complexFormData"
              :schema="complexSchema"
              :ui-schema="complexUiSchema"
              @update:modelValue="handleComplexFormChange"
            />

            <n-divider />

            <n-card title="表单数据" size="small">
              <n-code :code="JSON.stringify(complexFormData, null, 2)" language="json" />
            </n-card>
          </n-card>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { JsonSchemaForm, widgetRegistry } from '@/components/schema-form'
import CascadingSelect from '@/components/schema-form/widgets/CascadingSelect.vue'
import type { JsonSchema, JsonSchemaValue, UiSchema } from '@/types/schema'
import { NCard, NCode, NDivider, NTabPane, NTabs } from 'naive-ui'
import { ref } from 'vue'

// 注册级联选择控件
widgetRegistry.register('CascadingSelect', CascadingSelect)

// 基础表单示例
const basicFormData = ref<Record<string, JsonSchemaValue>>({
  name: '',
  age: null,
  email: '',
  active: false,
  gender: null,
  tags: [
    { name: 'tag1', type: 'tag' },
    { name: 'tag2', type: 'tag' },
  ],
})

const basicSchema: JsonSchema = {
  type: 'object',
  title: '用户信息',
  required: ['name', 'email'],
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      minLength: 2,
      maxLength: 10,
    },
    tags: {
      type: 'array',
      title: '标签',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: '标签名称',
          },
          type: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
    age: {
      type: 'integer',
      title: '年龄',
      minimum: 0,
      maximum: 150,
    },
    email: {
      type: 'string',
      title: '邮箱',
      format: 'email',
      pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
    },
    active: {
      type: 'boolean',
      title: '激活状态',
    },
    gender: {
      type: 'string',
      title: '性别',
      enum: ['male', 'female', 'other'],
    },
  },
}

const basicUiSchema: Record<string, UiSchema> = {
  name: {
    'ui:placeholder': '请输入姓名',
  },
  age: {
    'ui:placeholder': '请输入年龄',
  },
  email: {
    'ui:placeholder': '请输入邮箱地址',
  },
  gender: {
    'ui:options': {
      enumOptions: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
    },
  },
}

// 分组表单示例
const groupFormData = ref<Record<string, JsonSchemaValue>>({
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  country: '',
})

const groupSchema: JsonSchema = {
  type: 'object',
  title: '用户详细信息',
  required: ['firstName', 'lastName'],
  properties: {
    firstName: {
      type: 'string',
      title: '名字',
    },
    lastName: {
      type: 'string',
      title: '姓氏',
    },
    phone: {
      type: 'string',
      title: '电话号码',
    },
    address: {
      type: 'string',
      title: '详细地址',
    },
    city: {
      type: 'string',
      title: '城市',
    },
    country: {
      type: 'string',
      title: '国家',
    },
  },
}

const groupUiSchema: Record<string, UiSchema> = {
  firstName: {
    'ui:group': '基本信息',
  },
  lastName: {
    'ui:group': '基本信息',
  },
  phone: {
    'ui:group': '联系方式',
  },
  address: {
    'ui:group': '地址信息',
  },
  city: {
    'ui:group': '地址信息',
  },
  country: {
    'ui:group': '地址信息',
  },
}

// 动态数组示例
const arrayFormData = ref<Record<string, JsonSchemaValue>>({
  title: '',
  tags: [],
  users: [],
})

const arraySchema: JsonSchema = {
  type: 'object',
  title: '项目配置',
  properties: {
    title: {
      type: 'string',
      title: '项目标题',
    },
    tags: {
      type: 'array',
      title: '标签列表',
      items: {
        type: 'string',
        title: '标签',
      },
    },
    users: {
      type: 'array',
      title: '用户列表',
      items: {
        type: 'object',
        title: '用户',
        properties: {
          name: {
            type: 'string',
            title: '姓名',
          },
          role: {
            type: 'string',
            title: '角色',
            enum: ['admin', 'user', 'guest'],
          },
          active: {
            type: 'boolean',
            title: '激活',
          },
        },
      },
    },
  },
}

const arrayUiSchema: Record<string, UiSchema> = {
  role: {
    'ui:options': {
      enumOptions: [
        { label: '管理员', value: 'admin' },
        { label: '用户', value: 'user' },
        { label: '访客', value: 'guest' },
      ],
    },
  },
}

// 级联选择示例
const cascadingFormData = ref<Record<string, JsonSchemaValue>>({
  deviceType: null,
  device: null,
  property: null,
})

const cascadingSchema: JsonSchema = {
  type: 'object',
  title: '设备配置',
  properties: {
    deviceType: {
      type: 'string',
      title: '设备类型',
      enum: ['sensor', 'actuator', 'controller'],
    },
    device: {
      type: 'string',
      title: '设备',
    },
    property: {
      type: 'string',
      title: '属性',
    },
  },
}

const cascadingUiSchema: Record<string, UiSchema> = {
  deviceType: {
    'ui:options': {
      enumOptions: [
        { label: '传感器', value: 'sensor' },
        { label: '执行器', value: 'actuator' },
        { label: '控制器', value: 'controller' },
      ],
    },
  },
  device: {
    'ui:widget': 'CascadingSelect',
    'ui:options': {
      dependsOn: 'deviceType',
      enumOptions: [
        // 传感器类型的设备
        { label: '温度传感器', value: 'temp_sensor', dependsOnValue: 'sensor' },
        { label: '湿度传感器', value: 'humidity_sensor', dependsOnValue: 'sensor' },
        { label: '压力传感器', value: 'pressure_sensor', dependsOnValue: 'sensor' },
        // 执行器类型的设备
        { label: '继电器', value: 'relay', dependsOnValue: 'actuator' },
        { label: '电机', value: 'motor', dependsOnValue: 'actuator' },
        { label: '阀门', value: 'valve', dependsOnValue: 'actuator' },
        // 控制器类型的设备
        { label: 'PLC', value: 'plc', dependsOnValue: 'controller' },
        { label: '单片机', value: 'mcu', dependsOnValue: 'controller' },
        { label: '工控机', value: 'ipc', dependsOnValue: 'controller' },
      ],
    },
  },
  property: {
    'ui:widget': 'CascadingSelect',
    'ui:options': {
      dependsOn: 'device',
      enumOptions: [
        // 温度传感器的属性
        { label: '温度值', value: 'temperature', dependsOnValue: 'temp_sensor' },
        { label: '温度报警', value: 'temp_alarm', dependsOnValue: 'temp_sensor' },
        // 湿度传感器的属性
        { label: '湿度值', value: 'humidity', dependsOnValue: 'humidity_sensor' },
        { label: '湿度报警', value: 'humidity_alarm', dependsOnValue: 'humidity_sensor' },
        // 压力传感器的属性
        { label: '压力值', value: 'pressure', dependsOnValue: 'pressure_sensor' },
        { label: '压力报警', value: 'pressure_alarm', dependsOnValue: 'pressure_sensor' },
        // 继电器的属性
        { label: '开关状态', value: 'switch_status', dependsOnValue: 'relay' },
        { label: '工作时间', value: 'work_time', dependsOnValue: 'relay' },
        // 电机的属性
        { label: '转速', value: 'speed', dependsOnValue: 'motor' },
        { label: '扭矩', value: 'torque', dependsOnValue: 'motor' },
        { label: '功率', value: 'power', dependsOnValue: 'motor' },
        // 阀门的属性
        { label: '开度', value: 'opening', dependsOnValue: 'valve' },
        { label: '流量', value: 'flow', dependsOnValue: 'valve' },
        // PLC的属性
        { label: 'CPU使用率', value: 'cpu_usage', dependsOnValue: 'plc' },
        { label: '内存使用率', value: 'memory_usage', dependsOnValue: 'plc' },
        { label: '运行状态', value: 'run_status', dependsOnValue: 'plc' },
        // 单片机的属性
        { label: 'GPIO状态', value: 'gpio_status', dependsOnValue: 'mcu' },
        { label: 'ADC值', value: 'adc_value', dependsOnValue: 'mcu' },
        // 工控机的属性
        { label: '系统状态', value: 'system_status', dependsOnValue: 'ipc' },
        { label: '网络状态', value: 'network_status', dependsOnValue: 'ipc' },
      ],
    },
  },
}

// 综合示例
const complexFormData = ref<Record<string, JsonSchemaValue>>({
  projectName: '',
  description: '',
  startDate: '',
  team: {
    leader: '',
    members: [],
  },
  settings: {
    notifications: true,
    public: false,
  },
  tasks: [],
})

const complexSchema: JsonSchema = {
  type: 'object',
  title: '项目管理',
  required: ['projectName'],
  properties: {
    projectName: {
      type: 'string',
      title: '项目名称',
      minLength: 3,
    },
    description: {
      type: 'string',
      title: '项目描述',
    },
    startDate: {
      type: 'string',
      title: '开始日期',
      format: 'date',
    },
    team: {
      type: 'object',
      title: '团队信息',
      properties: {
        leader: {
          type: 'string',
          title: '团队负责人',
        },
        members: {
          type: 'array',
          title: '团队成员',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                title: '姓名',
              },
              role: {
                type: 'string',
                title: '角色',
                enum: ['developer', 'designer', 'tester'],
              },
            },
          },
        },
      },
    },
    settings: {
      type: 'object',
      title: '项目设置',
      properties: {
        notifications: {
          type: 'boolean',
          title: '启用通知',
        },
        public: {
          type: 'boolean',
          title: '公开项目',
        },
      },
    },
    tasks: {
      type: 'array',
      title: '任务列表',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            title: '任务标题',
          },
          priority: {
            type: 'string',
            title: '优先级',
            enum: ['low', 'medium', 'high'],
          },
          completed: {
            type: 'boolean',
            title: '已完成',
          },
        },
      },
    },
  },
}

const complexUiSchema: Record<string, UiSchema> = {
  projectName: {
    'ui:group': '基本信息',
  },
  description: {
    'ui:group': '基本信息',
  },
  startDate: {
    'ui:group': '基本信息',
  },
  priority: {
    'ui:options': {
      enumOptions: [
        { label: '低', value: 'low' },
        { label: '中', value: 'medium' },
        { label: '高', value: 'high' },
      ],
    },
  },
  role: {
    'ui:options': {
      enumOptions: [
        { label: '开发者', value: 'developer' },
        { label: '设计师', value: 'designer' },
        { label: '测试员', value: 'tester' },
      ],
    },
  },
}

// 事件处理
const handleBasicFormChange = (data: Record<string, JsonSchemaValue>) => {
  console.log('Basic form changed:', data)
}

const handleGroupFormChange = (data: Record<string, JsonSchemaValue>) => {
  console.log('Group form changed:', data)
}

const handleArrayFormChange = (data: Record<string, JsonSchemaValue>) => {
  console.log('Array form changed:', data)
}

const handleCascadingFormChange = (data: Record<string, JsonSchemaValue>) => {
  console.log('Cascading form changed:', data)
}

const handleComplexFormChange = (data: Record<string, JsonSchemaValue>) => {
  console.log('Complex form changed:', data)
}
</script>

<style scoped>
.schema-form-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.demo-section {
  padding: 0;
}
</style>
