<script setup lang="ts">
import router from "@/router";
import {useRoute} from "vue-router";
import type {friendType} from "@/api/user_api";

const route = useRoute()
interface Props {
  list: friendType[]
}

const props = defineProps<Props>()

function goFriend(record: friendType){
  router.push({
    name: 'user_detail',
    params: {
      id: record.userID,
    },
  })
}

</script>

<template>
  <div class="friend_list">
    <div
        :class="{active: parseInt(route.params.id as string) === item.userID && route.name === 'user_detail'}"
         class="item" v-for="item in props.list"
         @click="goFriend(item)"
    >
      <div class="avatar">
        <img :src="item.avatar" alt="">
        <div class="online_status" :class="{online: item.isOnline}"></div>
      </div>
      <div class="info">
        <div class="nickname">
          <el-text style="max-width: 5rem" truncated>{{ item.nickname }}</el-text>
          （<el-text style="max-width: 4rem" truncated>{{ item.notice === "" ? "-" : item.notice }}</el-text>）
        </div>
        <el-text class="w-150px mb-2" truncated>
          {{ item.abstract }}
        </el-text>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friend_list{
  width: 100%;
  .item{
    height: 50px;
    display: flex;
    padding: 10px;
    align-items: center;
    cursor: pointer;

    &:hover{
      background-color: var(--item_hover);
    }
    &.active{
      background-color: var(--item_hover);
    }

    .avatar{
      position: relative;
      width: 40px;
      display: flex;
      align-items: center;

      img{
        width: 35px;
        height: 35px;
        border-radius: 5px;
        object-fit: cover;
      }

      .online_status {
        position: absolute;
        right: 6px;
        bottom: 2px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: #737373;

        &.online {
          background-color: #5af50e;
        }
      }
    }

    .info{
      width: calc(100% - 45px);
      font-size: 14px;
      .nickname{
        font-weight: 600;
        display: flex;
        align-items: center;
        color: var(--el-text-color-regular);
      }
      .abstract{
        color: #555;
      }
    }
  }
}
</style>
