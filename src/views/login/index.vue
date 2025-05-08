<script setup lang="ts">
import {reactive, ref} from "vue";
import Qq_color from "@/components/fim_login/fim_login.vue"
import {authLoginApi, type authLoginRequest, authOpenLoginApi} from "@/api/auth_api";
import {ElMessage, type FormRules } from "element-plus";
// import {useStore} from "@/stores";
import router from "@/router";
import {useRoute} from "vue-router";
import {useUserStore} from "@/stores/user_store";

const route = useRoute()
const userStore = useUserStore()
const form = reactive({
  userName: "",
  password: "",
})

const formRef = ref()

// async function initRouter(){
//   const flag = route.query?.flag
//   const code = route.query?.code
//   if (flag && code){
//     let res = await authOpenLoginApi({
//       code: code as string,
//       flag: flag as string
//     })
//     if (res.code){
//       ElMessage.error(res.msg)
//       return
//     }
//     ElMessage.success("登陆成功")
//     await userStore.setToken(res.data.token)
//     await router.push({
//       name: "web",
//     })
//   }
// }
// initRouter()

async function login() {
  let val = await formRef.value.validate()
  if (!val) {
    return
  }

  let res = await authLoginApi(form)
  if(res.code) {
    ElMessage.error(res.msg)
    return
  }
  console.log(res.data)
  await userStore.setToken(res.data.token)
  ElMessage.success(res.msg)

  const redirectUrl = route?.query.redirect_url
  if(redirectUrl) {
    await router.push({
      path: redirectUrl as string
    })
    return
  }
  await router.push({
    name: "web",
  })
}

const rules = reactive<FormRules>({
  userName: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
  ]
})

function gotoQQLogin(){
  window.open(userStore.settingsInfo.qq?.webPath, "_self")
}

</script>

<template>
  <div class="fim_login">
    <div class="banner">
      <Qq_color/>
      <h1 class="login_title">We Chat</h1>
    </div>
    <div class="login_form">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item class="item_username" prop="userName">
          <el-input v-model="form.userName" placeholder="用户名">
            <template #prefix>
              <i class="iconfont icon-yonghuming"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="item_password" prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码">
            <template #prefix>
              <i class="iconfont icon-mima"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="item_action" >
          <el-checkbox>记住密码</el-checkbox>
        </el-form-item>
        <el-form-item class="item_btn">
          <el-button style="width: 100%" type="primary" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="other_login">
        <div class="label">第三方登录</div>
        <div class="icons">
          <i class="iconfont icon-QQ" v-if="userStore.settingsInfo.qq?.enable" @click="gotoQQLogin"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fim_login{
  width: 500px;
  height: 400px;
  background-color: white;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 0 5px 3px rgba(0, 0, 0, .05);

  .banner{
    height: 140px;
    width: 100%;
    background-color: #f9f9f9;
    overflow: hidden;
    position: relative;

    .login_title{
      position: absolute;
      top: 50%;
      left: 50%;
      //z-index: 1;
      color: white;
      transform:translate(-50%,-50%);
    }
  }

  .login_form{
    padding: 20px 80px;

    .item_password, .item_action, .item_btn{
      margin-bottom: 6px;
    }

    .other_login{
      display: flex;
      flex-direction: column;
      align-items: center;

      .label{
        font-size: 14px;
        color: #555;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        &::before, &::after{
          content: '';
          display: inline-flex;
          width: 35%;
          height: 1px;
          background-color: #8b8686;
        }
      }

      .icons{
        margin-top: 5px;
        i{
          font-size: 36px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
