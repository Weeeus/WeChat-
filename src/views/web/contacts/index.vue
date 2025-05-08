<script setup lang="ts">

import {computed, reactive} from "vue";
import type {listResponse} from "@/api/idnex";
import {friendListApi, type friendType} from "@/api/user_api";
import {groupMyListApi, type groupType} from "@/api/group_api";
import Group_list from "@/views/web/contacts/group_list.vue";
import router from "@/router";
import {useRoute} from "vue-router";
import Fim_slide_head from "@/components/fim_slide_head.vue";
import Fim_event from "@/components/fim_event.vue";
import User_list from "@/views/web/contacts/user_list.vue";

const friendData = reactive<listResponse<friendType>>({
  list: [],
  count: 0,
})

const route = useRoute()

async function getFriend(){
  let res = await friendListApi({limit: -1})
  friendData.list = res.data.list || []
  friendData.count = res.data.count
}

const friendOnlineCount = computed(() => {
  return friendData.list.filter(item => item.isOnline).length
})

const myJoinGroupData = reactive<listResponse<groupType>>({
  list: [],
  count: 0
})

async function getGroup() {
  let res = await groupMyListApi(2)
  myJoinGroupData.list = res.data.list || []
  myJoinGroupData.count = res.data.count
}


const myCreateGroupData = reactive<listResponse<groupType>>({
  list: [],
  count: 0
})

async function getMyCreateGroup() {
  let res = await groupMyListApi(1)
  myCreateGroupData.list = res.data.list || []
  myCreateGroupData.count = res.data.count
}

getMyCreateGroup()
getGroup()

function list(){
  getMyCreateGroup()
  getGroup()
}

getFriend()


</script>
<template>
  <div class="contact_view">
    <fim_event event-key="groupList" @event="list"></fim_event>
    <fim_event event-key="friendList" @event="getFriend"></fim_event>
    <div class="contact_slide">
      <div class="head">
        <fim_slide_head></fim_slide_head>
      </div>
      <div class="contact_menu">
        <el-scrollbar height="100%">
          <el-menu :default-openeds="['3']">
            <el-sub-menu index="1">
              <template #title>
                <span>我创建的群聊 {{ myCreateGroupData.count }}</span>
              </template>
              <group_list :list="myCreateGroupData.list"></group_list>
            </el-sub-menu>
            <el-sub-menu index="2">
              <template #title>
                <span>我加入的群聊 {{ myJoinGroupData.count }}</span>
              </template>
              <group_list :list="myJoinGroupData.list"></group_list>
            </el-sub-menu>
            <el-sub-menu index="3">
              <template #title>
                <span>我的好友 {{ friendOnlineCount }}/{{ friendData.count }}</span>
              </template>
              <user_list :list="friendData.list"></user_list>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </div>
    </div>
    <div class="contact_main">
      <router-view></router-view>
    </div>
  </div>
</template>
<style lang="scss">
.contact_view{
  width: 100%;
  height: 100%;
  display: flex;

  .contact_slide{
    width: 240px;
    border-right: 1px solid var(--border_color);
    height: 100%;
    color: var(--text_color);

    .head{
      height: 40px;
      width: 100%;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid  var(--border_color);

      span{
        cursor: pointer;

        i{
          margin-right: 5px;
        }
      }


    }

    .contact_menu{
      height: calc(100% - 40px);
      //overflow-y: auto;

      .el-menu{
        border-right: none;

        .el-sub-menu__title{
          height: 40px;
          font-weight: 600;
          padding: 0 10px;
        }
      }
    }
  }

  .contact_main {
    width: calc(100% - 240px);
  }

}
</style>
