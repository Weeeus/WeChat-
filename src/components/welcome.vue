<script setup lang="ts">

</script>

<template>
  <div class="fim_welcome">
    <h1>欢迎使用 WeChat 即时通讯</h1>
    <div class="abstract">
      <p>
        We-Chat即时通讯，是一款基于vue3+ts的网站
      </p>
      <p>
        前端涉及技术：vue3 typescript pinia vite element-plus websocket WebRTC vue-copper
      </p>
      <p>
        前端基本功能
      </p>
      <ul>
        <li>好友单聊功能，支持文字、表情、图片、文件、语音消息、撤回消息</li>
        <li>好友搜索，好友申请功能</li>
        <li>用户群聊功能，群文件、群禁言、管理员、群搜索</li>
        <li>用户视频通话功能</li>
      </ul>
    </div>

    <img class="img_icon" src="../assets/img/undraw_work_from_anywhere_re_s2i6.svg" alt="">
  </div>
</template>

<style lang="scss">
.fim_welcome {
  padding: 80px 40px;
  position: relative;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--active);
    font-family: "AlimamaFangYuanTiVF",serif;
  }

  .abstract {
    margin-top: 20px;
  }

  p, li {
    color: var(--text_color);
    line-height: 1.5rem;
    font-size: 14px;
  }

  .img_icon{
    position: absolute;
    right: 45px;
    height: 200px;
    bottom: -135px;
  }

}
</style>