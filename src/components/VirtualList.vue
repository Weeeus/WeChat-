<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';

interface Props {
  items: any[];
  itemHeight: number;
  visibleCount?: number;
  buffer?: number;
  dynamicHeight?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visibleCount: 10,
  buffer: 5,
  dynamicHeight: false
});

const emit = defineEmits(['renderItem']);

// 容器元素的引用
const containerRef = ref<HTMLElement | null>(null);
// 列表容器的引用
const listRef = ref<HTMLElement | null>(null);
// 项高度映射
const itemHeightsMap = ref<Map<number, number>>(new Map());

// 虚拟列表的状态
const state = reactive({
  startIndex: 0,
  endIndex: 0,
  scrollTop: 0,
  containerHeight: 0,
  isScrolling: false,
  lastMeasuredIndex: -1, // 最后测量的索引
});

// 获取项高度
const getItemHeight = (index: number): number => {
  return itemHeightsMap.value.get(index) || props.itemHeight;
};

// 获取项位置信息
const getItemPos = (index: number) => {
  let height = 0;
  let top = 0;

  if (props.dynamicHeight) {
    for (let i = 0; i < index; i++) {
      top += getItemHeight(i);
    }
    height = getItemHeight(index);
  } else {
    top = index * props.itemHeight;
    height = props.itemHeight;
  }

  return {
    height,
    top
  };
};

// 更新项高度
const updateItemHeight = (index: number, height: number) => {
  if (props.dynamicHeight && height !== itemHeightsMap.value.get(index)) {
    itemHeightsMap.value.set(index, height);
    state.lastMeasuredIndex = Math.max(state.lastMeasuredIndex, index);
    // 当高度变化时，更新可见范围
    updateVisibleRange();
  }
};

// 计算可见的数据项
const visibleItems = computed(() => {
  return props.items.slice(state.startIndex, state.endIndex + 1).map((item, index) => {
    const realIndex = state.startIndex + index;
    const { top, height } = getItemPos(realIndex);
    
    return {
      item,
      index: realIndex,
      top,
      height
    };
  });
});

// 计算总高度
const totalHeight = computed(() => {
  if (!props.dynamicHeight) {
    return props.items.length * props.itemHeight;
  }

  // 对于动态高度，计算已测量项的高度总和，加上未测量项的估计高度
  let height = 0;
  for (let i = 0; i < props.items.length; i++) {
    height += getItemHeight(i);
  }
  
  return height;
});

// 计算偏移量
const offsetY = computed(() => state.startIndex * props.itemHeight);

// 更新可见的索引范围
const updateVisibleRange = () => {
  if (!containerRef.value) return;
  
  // 根据滚动位置计算起始索引
  const scrollTop = containerRef.value.scrollTop;
  state.scrollTop = scrollTop;
  
  // 计算开始索引
  let startIndex = 0;
  if (props.dynamicHeight) {
    let accumulatedHeight = 0;
    for (let i = 0; i < props.items.length; i++) {
      const height = getItemHeight(i);
      if (accumulatedHeight + height > scrollTop) {
        startIndex = i;
        break;
      }
      accumulatedHeight += height;
    }
  } else {
    startIndex = Math.floor(scrollTop / props.itemHeight);
  }
  
  // 计算可见区域内的项数
  const visibleCount = props.visibleCount;
  
  // 计算结束索引
  const endIndex = Math.min(
    props.items.length - 1,
    startIndex + visibleCount + props.buffer * 2
  );
  
  // 更新状态
  state.startIndex = Math.max(0, startIndex - props.buffer);
  state.endIndex = endIndex;
};

// 滚动事件处理
const handleScroll = () => {
  if (!state.isScrolling) {
    state.isScrolling = true;

    window.requestAnimationFrame(() => {
      updateVisibleRange();
      state.isScrolling = false;
    });
  }
};

// 滚动到指定索引
const scrollToIndex = (index: number) => {
  if (!containerRef.value) return;
  if (props.dynamicHeight) {
    const { top } = getItemPos(index);
    containerRef.value.scrollTop = top;
  } else {
    containerRef.value.scrollTop = index * props.itemHeight;
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (!containerRef.value) return;
  containerRef.value.scrollTop = totalHeight.value;
};

// 重置列表
const reset = () => {
  if (!containerRef.value) return;
  containerRef.value.scrollTop = 0;
  updateVisibleRange();
};

// 计算容器高度
const calculateContainerHeight = () => {
  if (!containerRef.value) return;
  state.containerHeight = containerRef.value.clientHeight;
  // 更新可见数量
  updateVisibleRange();
};

// 监听数据变化
watch(() => props.items.length, () => {
  nextTick(() => {
    updateVisibleRange();
  });
});

// 挂载时初始化
onMounted(() => {
  calculateContainerHeight();
  window.addEventListener('resize', calculateContainerHeight);
  updateVisibleRange();
});

// 组件销毁前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateContainerHeight);
});

// 暴露方法给父组件
defineExpose({
  scrollToIndex,
  scrollToBottom,
  reset,
  updateItemHeight,
  getVisibleIndices: () => {
    if (!containerRef.value) return [];
    const visibleIndices = [];
    const scrollTop = containerRef.value.scrollTop;
    const viewportBottom = scrollTop + state.containerHeight;
    
    let accumulatedHeight = 0;
    for (let i = 0; i < props.items.length; i++) {
      const itemHeight = getItemHeight(i);
      const itemTop = props.dynamicHeight 
        ? accumulatedHeight 
        : i * props.itemHeight;
      const itemBottom = itemTop + itemHeight;
      
      // 如果项在视口内
      if (itemBottom > scrollTop && itemTop < viewportBottom) {
        visibleIndices.push(i);
      }
      
      accumulatedHeight += itemHeight;
    }
    
    return visibleIndices;
  }
});
</script>

<template>
  <div ref="containerRef" class="virtual-list-container" @scroll="handleScroll">
    <div ref="listRef" class="virtual-list" :style="{ height: `${totalHeight}px` }">
      <div 
        v-for="{ item, index, top, height } in visibleItems" 
        :key="index" 
        class="virtual-list-item"
        :style="{ 
          transform: `translateY(${top}px)`, 
          height: `${height}px` 
        }"
      >
        <slot :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-list-container {
  position: relative;
  overflow-y: auto;
  height: 100%;
  width: 100%;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(144, 147, 153, 0.3) transparent; /* Firefox */
}

/* Webkit浏览器的滚动条样式 (Chrome, Safari, Edge等) */
.virtual-list-container::-webkit-scrollbar {
  width: 6px;
}

.virtual-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.virtual-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

.virtual-list-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(144, 147, 153, 0.5);
}

.virtual-list {
  position: relative;
  width: 100%;
}

.virtual-list-item {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  box-sizing: border-box;
}
</style> 