import {defineStore} from "pinia";
import {ElMessage} from "element-plus";
import { type groupHistoryType } from "@/api/group_api";
import type {chatHistoryType} from "@/api/chat_api";
import type {msgChatType} from "@/types/msg";
import {useUserStore} from "@/stores/user_store";
import {eventStore} from "@/stores/event_store";

const chatMsgData: chatHistoryType = {
    id: 0,
    sendUser: {
        id: 0,
        nickName: "",
        avatar: "",
    },
    revUser: {
        id: 0,
        nickName: "",
        avatar: "",
    },
    isMe: false,
    created_at: "",
    msg: {
        type: 0
    },
    systemMsg: null,
    msgPreview: "",
    showDate: false
}
const groupMsgData: groupHistoryType = {
    groupID: 0,
    "userID": 0,
    "userNickname": "",
    "userAvatar": "",
    "msg": {
        "type": 0,
        textMsg: undefined,
    },
    "id": 0,
    "msgType": 0,
    "createdAt": "",
    "isMe": false,
    "memberNickname": "",
    msgPreview: "",
    showDate: false
}

let chatWs: WebSocket
let groupWs: WebSocket

interface useStoreType {
    chatMsgData: chatHistoryType
    groupMsgData: groupHistoryType
    chatWs: WebSocket
    groupWs: WebSocket
    chatContent: string
    replayChatMsgData?: msgChatType
    showMsgDate: boolean
}


export const useStore = defineStore('counter', {
    state: (): useStoreType => {
        return {
            chatMsgData: chatMsgData,
            groupMsgData: groupMsgData,
            chatWs: chatWs,
            groupWs: groupWs,
            chatContent: "",
            showMsgDate: false
        }
    },
    actions: {
        showMsgDateMethod(){
            this.showMsgDate = true
            setTimeout(() => {
                this.showMsgDate = false
            }, 3000)
        },
        setChatContent(content: string) {
            this.chatContent = ""
            setTimeout(() => {
                this.chatContent = content
            })
        },
        initChatWs(token: string) {
            const userStore = useUserStore();
            const es = eventStore();

            if (!userStore.isLogin) {
                ElMessage("用戶未登錄，無法初始化 chatWs")
                return
            }
            let proto = "ws"
            if (location.protocol === "https:") {
                proto = "wss"
            }
            const ws = new WebSocket(`${proto}://${location.host}/api/chat/ws/chat?token=${token}`)
            ws.onopen = (ev: Event) => {
                console.log("ws连接成功", ev)
            }
            ws.onmessage = (ev: MessageEvent) => {
                try {
                    this.chatMsgData = JSON.parse(ev.data)
                    console.log("chatMsgData::::::>>>>>>", this.chatMsgData)
                    es.setEventKey("sessionList")
                } catch (e) {
                    console.log(e)
                    return
                }
            }
            ws.onerror = (ev: Event) => {
                console.log(ev)
            }
            this.chatWs = ws
        },
        initGroupWs(token: string) {
            const userStore = useUserStore()
            const es = eventStore();
            
            if (!userStore.isLogin) {
                console.log("用戶未登錄，無法初始化 groupWs")
                return
            }
            let proto = "ws"
            if (location.protocol === "https:") {
                proto = "wss"
            }
            const ws = new WebSocket(`${proto}://${location.host}/api/group/ws/chat?token=${token}`)
            ws.onopen = (ev: Event) => {
                console.log("group ws连接成功")
            }
            ws.onmessage = (ev: MessageEvent) => {
                try {
                    this.groupMsgData = JSON.parse(ev.data)
                    es.setEventKey("sessionList")
                } catch (e) {
                    console.log(e)
                    return
                }
            }
            ws.onerror = (ev: Event) => {
                console.log(ev)
            }
            this.groupWs = ws
        },
    },
})