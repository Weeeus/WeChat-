<script setup lang="ts">

</script>

<template>
<div>
  <div class="fim_info_body">
    <div class="head">
      <router-link :to="{name: 'my_info'}">个人资料</router-link>
      <router-link :to="{name: 'base_info'}">基本信息</router-link>
      <router-link :to="{name: 'safe_info'}">安全设置</router-link>
      <router-link :to="{name: 'role_info'}">权限设置</router-link>
      <router-link :to="{name: 'settings'}">系统设置</router-link>
    </div>
    <div class="body">
      <router-view/>
    </div>
  </div>
</div>
</template>

<style scoped>
.fim_info_body{
  width: 100%;
  padding: 20px;

  .head{
    border-bottom: 1px solid var(--border_color);
    padding: 0 0 20px 0;

    a{
      margin-right: 20px;

      &.router-link-exact-active{
        color: var(--active);
      }
    }
  }

  .body {
    padding: 20px 0;
    overflow-y: auto;
    height: calc(600px - 70px);

    .el-form-item {
      margin-bottom: 8px;
    }
  }
}


</style>
