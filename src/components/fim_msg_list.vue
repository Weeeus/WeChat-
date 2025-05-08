<script setup lang="ts">
import Fim_msg from "@/components/fim_msg.vue";
import type {msgChatType} from "@/types/msg";
import {ref, onMounted, nextTick, watch, onUpdated} from "vue";
import {useRoute} from "vue-router";
import {chatDeleteApi} from "@/api/chat_api";
import {groupChatDeleteApi} from "@/api/group_api";
import {ElMessage} from "element-plus";
import type {fimMsgListExpose} from "@/types/msg_list";
import type {baseResponse} from "@/api/idnex";
import VirtualList from "@/components/VirtualList.vue";

const route = useRoute()

interface Props {
  msgList: msgChatType[]
  type: "user" | "group"
  showNickname?: boolean
  moreVisible?: boolean
}

const props = defineProps<Props>()

const emits = defineEmits(["checkShow", "loadMore"])

const checkShowVisible = ref(false)
const virtualListRef = ref<any>(null)
const isLoading = ref(false) // 添加加载状态，防止多次触发
const previousScrollHeight = ref(0) // 记录加载前的滚动高度
const previousScrollTop = ref(0) // 记录加载前的滚动位置

// 估计的消息项高度，不同类型的消息高度可能不同
const defaultItemHeight = 80

// 消息DOM引用，用于测量实际高度
const msgItemRefs = ref<Map<number, HTMLElement>>(new Map())

function checkShow() {
  checkShowVisible.value = true
  emits("checkShow")
}

function loadMore() {
  if (isLoading.value) return
  
  // 简化：只需记录当前滚动容器的高度和位置
  const container = virtualListRef.value?.$el;
  if (container) {
    previousScrollHeight.value = container.scrollHeight;
    previousScrollTop.value = container.scrollTop;
  }
  
  isLoading.value = true
  emits("loadMore")
}

// 处理滚动事件，当滚动到顶部时触发加载更多
function handleScroll(event: Event) {
  const container = event.target as HTMLElement
  if (container.scrollTop <= 10 && props.moreVisible) {
    loadMore()
  }
}

const useMsgIDList = ref<number[]>([])

function check(type: string, msgID: number) {
  if (type === "add") {
    useMsgIDList.value.push(msgID)
    return
  }
  if (type === "remove") {
    const index = useMsgIDList.value.findIndex((value) => value === msgID)
    if (index === -1) return;
    useMsgIDList.value.splice(index, 1)
  }
}

interface checkType {
  closeCheck: () => void
}

const fimMsgRef = ref<checkType[]>([])

function close() {
  useMsgIDList.value = []
  checkShowVisible.value = false
  for (const argument of fimMsgRef.value) {
    argument.closeCheck()
  }
}

async function chatDelete() {
  let res: baseResponse<string>
  if (props.type === "user") {
    res = await chatDeleteApi(useMsgIDList.value)
  } else {
    res = await groupChatDeleteApi(Number(route.params.id), useMsgIDList.value)
  }
  if (res.code) {
    ElMessage.error(res.msg)
    return false
  }
  useMsgIDList.value = []
  if (props.type === "user") {
    ElMessage.success("删除对话聊天记录成功")
  } else {
    ElMessage.success("删除群聊天记录成功")
  }
  return true
}

// 设置消息项引用
function setMsgItemRef(index: number, el: any) {
  if (el) {
    msgItemRefs.value.set(index, el);
  }
}

// 更新消息项高度
function updateItemHeights() {
  if (!virtualListRef.value) return;
  
  msgItemRefs.value.forEach((el, index) => {
    if (el) {
      const height = el.offsetHeight;
      virtualListRef.value.updateItemHeight(index, height);
    }
  });
}

// 恢复加载前的滚动位置
function restoreScrollPosition() {
  const container = virtualListRef.value?.$el;
  if (!container) return;

  // 计算新旧高度差
  const heightDifference = container.scrollHeight - previousScrollHeight.value;
  
  // 设置新的滚动位置，保持相对位置不变
  container.scrollTop = previousScrollTop.value + heightDifference;
  
  // 重置加载标记
  isLoading.value = false;
}

// 组件更新后测量元素高度
onUpdated(() => {
  nextTick(() => {
    updateItemHeights();
  });
});

// 当消息列表变化时，更新高度并处理滚动位置
watch(() => props.msgList.length, (newVal, oldVal) => {
  nextTick(() => {
    updateItemHeights();
    // 如果是加载更多历史消息（消息增加且正在加载）
    if (newVal > oldVal && isLoading.value) {
      restoreScrollPosition();
    } 
  });
});

defineExpose({
  close,
  chatDelete,
  scrollToBottom: () => {
    if (virtualListRef.value) {
      virtualListRef.value.scrollToBottom();
    }
  }
} as fimMsgListExpose)
</script>

<template>
  <div class="fim_msg_list_container">
    <!-- 加载动画 -->
    <div v-if="isLoading && props.moreVisible" class="loading-indicator">
      <div class="loading-spinner"></div>
    </div>    
    
    <VirtualList
      ref="virtualListRef"
      :items="props.msgList"
      :itemHeight="defaultItemHeight"
      :visibleCount="10"
      :buffer="3"
      :dynamicHeight="true"
      class="virtual-msg-list"
      @scroll="handleScroll"
    >
      <template v-slot="{ item, index }">
        <div :ref="(el) => setMsgItemRef(index, el)" class="msg-item-wrapper">
          <fim_msg
            :key="item.id"
            ref="fimMsgRef"
            @check="check"
            @check-show="checkShow"
            :check-show="checkShowVisible"
            :type="props.type"
            :show-nickname="props.showNickname"
            :data="item"
          ></fim_msg>
        </div>
      </template>
    </VirtualList>
  </div>
</template>

<style lang="scss" scoped>
.fim_msg_list_container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.virtual-msg-list {
  flex: 1;
}

.msg-item-wrapper {
  width: 100%;
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  padding: 8px 0;
  background-color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #409EFF;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>