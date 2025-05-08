<script setup lang="ts">
import {useThemeStore} from "@/stores/theme_store";
// import {useStore} from "@/stores";
import {useUserStore} from "@/stores/user_store";

// const store = useStore()
const userStore = useUserStore()
const themeStore = useThemeStore()

function themeChange(){
  themeStore.setTheme(themeStore.theme)
}

</script>

<template>
  <div class="my_info_view">
    <el-form-item label="主题设置">
      <el-checkbox @change="themeChange" v-model="themeStore.theme">{{ themeStore.theme ? "白天模式" : "暗黑模式" }}</el-checkbox>
    </el-form-item>
    <el-form-item label="退出登陆">
      <el-button type="danger" size="small" @click="userStore.logout">退出登陆</el-button>
    </el-form-item>
  </div>
</template>