import {defineStore} from "pinia";
import {groupDetailApi, groupUpdateInfoApi, type groupInfoType, type groupUpdateRequest} from "@/api/group_api";
import {ElMessage} from "element-plus";

const defaultGroupData: groupInfoType = {
    groupId: 0,
    title: "",
    abstract: "",
    memberCount: 0,
    memberOnlineCount: 0,
    avatar: "",
    creator: {
        userId: 0,
        avatart: "",
        nickname: "",
    },
    adminList: [],
    role: 0,
    isProhibition: false,
    isSearch: false,
    isInvite: false,
    isTemporarySession: false,
    verification: 1,
}

export const useGroupStore = defineStore("groupStore", {
    state: () => ({
        groupData: defaultGroupData
    }),
    actions: {
        // 获取群信息
        async getGroupData(id: number) {
            // 如果这个群之前有请求了，那就不去请求了，用之前的数据
            if (id === this.groupData.groupId) {
                return
            }
            let res = await groupDetailApi(id)
            if (res.code) {
                ElMessage.error(res.msg)
                return
            }
            console.log("getGroupData::>>>>>", res.data)
            Object.assign(this.groupData, res.data)
        },
        // 更新群
        async updateGroup() {
            if (this.groupData.groupId === 0) {
                return
            }
            const data: groupUpdateRequest = {
                id: this.groupData.groupId,
                avatar: this.groupData.avatar,
                isProhibition: this.groupData.isProhibition,
                title: this.groupData.title,
                abstract: this.groupData.abstract,
            }
            let res = await groupUpdateInfoApi(data)
            if (res.code) {
                ElMessage.error(res.msg)
                return
            }
            ElMessage.success("群信息修改成功")
        },
    }
});
