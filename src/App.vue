<script setup lang="ts">
import {useStore} from "@/stores";
import {useThemeStore} from "@/stores/theme_store";
import {useUserStore} from "@/stores/user_store";

const store = useStore()
const themeStore = useThemeStore()
const userStore = useUserStore()
userStore.loadToken()
themeStore.loadTheme()
userStore.getSettingsInfo()
store.initChatWs(userStore.userInfo.token)
store.initGroupWs(userStore.userInfo.token)
</script>

<template>
  <div class="fim_body">
    <router-view/>
  </div>
</template>

<style>
.fim_body {
  width: 100%;
  height: 100vh;
  overflow-y: hidden;
  background-color: var(--bg);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
