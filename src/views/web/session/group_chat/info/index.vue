<script setup lang="ts">
import {useGroupStore} from "@/stores/group_store";

const groupStore = useGroupStore()
</script>

<template>
  <div class="group_info_view">
    <div class="head">
      <router-link :to="{name: 'group_information'}">群资料</router-link>
      <router-link :to="{name: 'group_member'}">群成员</router-link>
      <router-link v-if="groupStore.groupData.role !== 3" :to="{name: 'group_settings'}">群设置</router-link>
    </div>
    <div class="body">
      <router-view/>
    </div>
  </div>
</template>

<style lang="scss">
.group_info_view {
  padding: 10px;

  .head {
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border_color);
    a {
      margin-right: 20px;

      &.router-link-exact-active{
        color: var(--active);
      }
    }
  }
  .body{
    margin-top: 10px;
  }
}
</style>