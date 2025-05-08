import {defineStore} from "pinia";
import {parseToken} from "@/utils/parseToken";
import {userInfoApi, type userConfType} from "@/api/user_api";
import {logoutApi} from "@/api/auth_api";
import router from "@/router";
import {ElMessage} from "element-plus";
import type {settingsType} from "@/api/settings_api";
import {settingsInfoApi} from "@/api/settings_api";

interface userInfoType {
    exp: number;
    nickname: string;
    role: number;
    userID: number;
    token: string;
    avatar: string;
}

const defaultUserInfo: userInfoType = {
    exp: 0,
    nickname: "",
    role: 0,
    userID: 0,
    token: "",
    avatar: "",
};

const defaultSettingsInfo: settingsType = {
}

const defaultUserConfInfo: userConfType = {
    userID: 0,
    nickname: "",
    abstract: "",
    avatar: "",
    friendOnline: false,
    sound: false,
    secureLink: false,
    savePwd: false,
    searchUser: 0,
    verification: 0,
}

interface useUserStoreType {
    userInfo: userInfoType,
    settingsInfo: settingsType,
    userConfInfo: userConfType,
}

export const useUserStore = defineStore("userStore", {
    state: (): useUserStoreType => ({
        userInfo: defaultUserInfo,
        settingsInfo: defaultSettingsInfo,
        userConfInfo: defaultUserConfInfo,
    }),

    actions: {
        async setToken(token: string) {
            const payload = parseToken(token)
            this.userInfo.token = token
            this.userInfo.exp = payload.exp
            this.userInfo.nickname = payload.nickname
            this.userInfo.role = payload.role
            this.userInfo.userID = payload.userID
            // 获取用户信息
            await this.getUserConf()
            this.userInfo.avatar = this.userConfInfo.avatar
            // 持久化
            this.saveToken()
            // 去连ws
            // this.initChatWs()
            // this.initGroupWs()
        },
        saveToken() {
            localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
        },
        loadToken() {
            const val = localStorage.getItem("userInfo")
            if (!val) {
                // 没有登陆，或者登陆失效
                return
            }
            try {
                this.userInfo = JSON.parse(val)
            } catch (e) {
                localStorage.removeItem("userInfo")
                return;
            }
        },
        async logout(){
            await logoutApi()
            this.userInfo = defaultUserInfo
            this.userConfInfo = defaultUserConfInfo
            localStorage.removeItem("userInfo")
            // 跳转到登陆页
            await router.push({
                name: "login"
            })
            ElMessage.success("注销成功")
        },

        // 获取用户信息
        async getUserConf() {
            let res = await userInfoApi()
            if (res.code) {
                ElMessage.error(res.msg)
                return
            }
            this.userConfInfo = res.data
        },
        async getSettingsInfo(): Promise<void>{
            let res = await settingsInfoApi()
            if(res.code){
                ElMessage.error(res.msg)
                return
            }
            this.settingsInfo = res.data
        },
    },
    getters: {
        isLogin(): boolean {
            return this.userInfo.token !== "";
        }
    }
});
