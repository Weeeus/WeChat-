<script setup lang="ts">
// import {useStore} from "@/stores";
import {ref, watch} from "vue";
import {type userConfUpdateType, userInfoUpdateApi} from "@/api/user_api";
import {ElMessage} from "element-plus";
import {useUserStore} from "@/stores/user_store";

// const store = useStore()
const userStore = useUserStore()
userStore.getUserConf()

interface iptType {
  label: string
  val: boolean
  key: "secureLink" | "savePwd"
  help: string
}

const list = ref<iptType[]>([
  {
    label: "安全链接",
    val: userStore.userConfInfo.secureLink,
    key: "secureLink",
    help: "拦截所有外部链接，跳转至安全链接"
  },
  {
    label: "密码",
    val: userStore.userConfInfo.savePwd,
    key: "savePwd",
    help: "记住密码"
  }
])

watch(() => userStore.userConfInfo, () => {
  list.value[0].val = userStore.userConfInfo.secureLink
  list.value[1].val = userStore.userConfInfo.savePwd
}, {deep: true})

async function change(index: number){
  let data: userConfUpdateType = {}

  data[list.value[index].key] = list.value[index].val
  let res = await userInfoUpdateApi(data)
  if (res.code) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success(list.value[index].label + "配置修改成功")
}


</script>

<template>
  <div class="my_info_view">
    <el-form-item :label="item.label" v-for="(item, index) in list">
      <el-checkbox v-model="item.val" :label="item.help" @change="change(index)"></el-checkbox>
    </el-form-item>
  </div>
</template>