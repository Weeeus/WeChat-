<script setup lang="ts">

import {useStore} from "@/stores";
import {useRoute} from "vue-router";
import {reactive, ref, watch} from "vue";
import type {listResponse, paramsType} from "@/api/idnex";
import {userSearchApi, type userSearchResponse} from "@/api/user_api";
import {ElMessage} from "element-plus";
import router from "@/router";
import {showAddUserModal} from "@/components/add_user_modal";
import {useSearchStore} from "@/stores/search_store";

const store = useStore()
const searchStore = useSearchStore()
const route = useRoute()

const params = reactive<paramsType>({
  key: "",
  limit: 8,
  page: 1,
})
const data = reactive<listResponse<userSearchResponse>>({
  list: [],
  count: 0
})

async function getData() {
  let res = await userSearchApi(params)
  if (res.code) {
    ElMessage.error(res.msg)
  }
  Object.assign(data, res.data)
}

watch(()=>searchStore.searchData, ()=>{
  params.key = searchStore.searchData.value
  getData()
}, {immediate: true, deep: true})

function currentPage() {
  getData()
}

const activeUserInfo = reactive<userSearchResponse>({
  userID: 0,
  nickname: "",
  abstract: "",
  avatar: "",
  isFriend: false,
})
const visible = ref(false)

function addFriend(record: userSearchResponse){
  visible.value = true
  Object.assign(activeUserInfo, record)
  showAddUserModal(activeUserInfo)
}

function goUserChat(item: userSearchResponse){
  router.push({
    name: "session_user_chat",
    params: {
      id: item.userID,
    }
  })
}

</script>

<template>
<div class="search_user_view">
<!--  <search_dialog v-model:visible="visible" :user-info="activeUserInfo" mode="user"></search_dialog>-->
  <div class="search_user_list">
    <div class="item" v-for="item in data.list">
      <el-avatar :size="50" :src="item.avatar"></el-avatar>
      <div class="info">
        <div class="nickname">
          <el-text style="width: 5rem;" truncated>{{ item.nickname }}</el-text>
        </div>
        <el-button v-if="item.isFriend" @click="goUserChat(item)" type="primary" size="small">去聊天</el-button>
        <el-button v-else type="primary" @click="addFriend(item)" size="small">加好友</el-button>
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
.search_user_view {
  .search_user_list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 20px;

    .item {
      width: 100%;
      display: flex;

      .info {
        width: calc(100% - 50px);
        margin-left: 10px;
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