<script setup lang="ts">

import {useStore} from "@/stores";
import {useRoute} from "vue-router";
import {reactive, ref, watch} from "vue";
import type {listResponse, paramsType} from "@/api/idnex";
import {ElMessage} from "element-plus";
import Search_dialog from "@/components/search_dialog.vue";
import {groupSearchApi, type groupSearchResponse} from "@/api/group_api";
import type {userSearchResponse} from "@/api/user_api";
import router from "@/router";
import {useSearchStore} from "@/stores/search_store";

const store = useStore()
const searchStore = useSearchStore()
const route = useRoute()

const params = reactive<paramsType>({
  key: "",
  limit: 4,
  page: 1,
})
const data = reactive<listResponse<groupSearchResponse>>({
  list: [],
  count: 0
})


async function getData() {
  let res = await groupSearchApi(params)
  if (res.code) {
    ElMessage.error(res.msg)
  }
  // Object.assign(data, res.data)
  data.list = res.data.list || []
  data.count = res.data.count
}

watch(() => searchStore.searchData, () => {
  params.key = searchStore.searchData.value
  getData()
}, {immediate: true, deep: true})

function currentPage() {
  getData()
}

const activeGroupInfo = reactive<groupSearchResponse>({
  "groupId": 0,
  "title": "",
  "abstract": "",
  "avatar": "",
  "isInGroup": false,
  "userCount": 0,
  "userOnlineCount": 0,
})
const visible = ref(false)

function addGroup(record: groupSearchResponse) {
  visible.value = true
  Object.assign(activeGroupInfo, record)
}

function goGroupChat(item: groupSearchResponse){
  router.push({
    name: "session_group_chat",
    params: {
      id: item.groupId,
    }
  })
}

</script>

<template>
  <div class="search_group_view">
    <search_dialog v-model:visible="visible" :group-info="activeGroupInfo" mode="group"></search_dialog>
    <div class="search_group_list">
      <div class="item" v-for="item in data.list">
        <el-avatar :size="60" :src="item.avatar" v-if="item.avatar.startsWith('/api')"></el-avatar>
        <el-avatar :size="60" style="background-color: #529b2e" v-else>{{ item.avatar }}</el-avatar>
        <div class="info">
          <div class="title">
            <el-text style="width: 5rem;" truncated>{{ item.title }}</el-text>
          </div>
          <div class="abstract">
            <el-text style="width: 13rem;" truncated>{{ item.abstract }}</el-text>
          </div>
          <div class="people">
            <i class="iconfont icon-chuangjianqunliao"></i>
            {{ item.userOnlineCount }}/{{ item.userCount }}
          </div>
          <el-button v-if="item.isInGroup"  @click="goGroupChat(item)" type="primary" size="small" >去聊天</el-button>
          <el-button v-else type="primary" @click="addGroup(item)"  size="small">申请加群</el-button>
        </div>
      </div>
    </div>
    <div class="no_data" v-if="data.list?.length === 0">
      <el-empty :image-size="200" description="暂无数据" />
    </div>
    <el-pagination
        class="search_page"
        @current-change="currentPage"
        hide-on-single-page
        v-model:current-page="params.page"
        :default-page-size="params.limit"
        layout="prev, pager, next"
        :total="data.count"/>
  </div>
</template>

<style scoped lang="scss">
.search_group_view {
  width: 100%;

  .search_group_list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 20px;

    .item {
      width: 100%;
      display: flex;
      border: 1px solid var(--border_color);
      border-radius: 5px;
      padding: 10px;
      align-items: center;

      .info {
        width: calc(100% - 60px);
        margin-left: 10px;

        .title {
          font-weight: 600;
        }

        .people {
          color: var(--text_color);
          font-size: 14px;
          margin-bottom: 5px;
        }
      }
    }
  }

  .search_page {
    width: 100%;
    margin-top: 20px;
    justify-content: center;
  }
}
</style>