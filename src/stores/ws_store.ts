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

interface useStoreType {
    chatMsgData: chatHistoryType
    groupMsgData: groupHistoryType
    chatContent: string
    replayChatMsgData?: msgChatType
    showMsgDate: boolean

    // WebSocket相关参数
    chatWs: WebSocket | null
    groupWs: WebSocket | null
    chatHeartbeatTimer: number | null
    groupHeartbeatTimer: number | null
    chatReconnectTimer: number | null
    groupReconnectTimer: number | null
    chatReconnectAttempts: number
    groupReconnectAttempts: number
    maxReconnectAttempts: number
    chatToken: string
    groupToken: string
}


export const useStore = defineStore('counter', {
    state: (): useStoreType => {
        return {
            chatMsgData: chatMsgData,
            groupMsgData: groupMsgData,
            chatWs: null,
            groupWs: null,
            chatContent: "",
            showMsgDate: false,

            // WebSocket心跳和重连参数
            chatHeartbeatTimer: null,
            groupHeartbeatTimer: null,
            chatReconnectTimer: null,
            groupReconnectTimer: null,
            chatReconnectAttempts: 0,
            groupReconnectAttempts: 0,
            maxReconnectAttempts: 5,
            chatToken: "",
            groupToken: ""
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

        // 发送心跳消息
        sendHeartbeat(ws: WebSocket | null) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "heartbeat" }));
            }
        },

        // 启动聊天心跳
        startChatHeartbeat() {
            this.stopChatHeartbeat();
            this.chatHeartbeatTimer = window.setInterval(() => {
                this.sendHeartbeat(this.chatWs);
            }, 30000); // 30秒发送一次心跳
        },

        // 停止聊天心跳
        stopChatHeartbeat() {
            if (this.chatHeartbeatTimer) {
                clearInterval(this.chatHeartbeatTimer);
                this.chatHeartbeatTimer = null;
            }
        },

        // 启动群组心跳
        startGroupHeartbeat() {
            this.stopGroupHeartbeat();
            this.groupHeartbeatTimer = window.setInterval(() => {
                this.sendHeartbeat(this.groupWs);
            }, 30000); // 30秒发送一次心跳
        },

        // 停止群组心跳
        stopGroupHeartbeat() {
            if (this.groupHeartbeatTimer) {
                clearInterval(this.groupHeartbeatTimer);
                this.groupHeartbeatTimer = null;
            }
        },

        // 关闭聊天连接
        closeChatConnection() {
            this.stopChatHeartbeat();
            if (this.chatReconnectTimer) {
                clearTimeout(this.chatReconnectTimer);
                this.chatReconnectTimer = null;
            }

            if (this.chatWs) {
                this.chatWs.close();
                this.chatWs = null;
            }
        },

        // 关闭群组连接
        closeGroupConnection() {
            this.stopGroupHeartbeat();
            if (this.groupReconnectTimer) {
                clearTimeout(this.groupReconnectTimer);
                this.groupReconnectTimer = null;
            }

            if (this.groupWs) {
                this.groupWs.close();
                this.groupWs = null;
            }
        },

        initChatWs(token: string) {
            const userStore = useUserStore();
            const es = eventStore();

            if (!userStore.isLogin) {
                ElMessage("用戶未登錄，無法初始化 chatWs")
                return
            }

            // 保存token用于重连
            this.chatToken = token;

            // 关闭之前的连接
            this.closeChatConnection();

            let proto = "ws"
            if (location.protocol === "https:") {
                proto = "wss"
            }

            const ws = new WebSocket(`${proto}://${location.host}/api/chat/ws/chat?token=${token}`)

            ws.onopen = (ev: Event) => {
                console.log("ws连接成功", ev)
                this.chatReconnectAttempts = 0;
                this.startChatHeartbeat();
            }

            ws.onmessage = (ev: MessageEvent) => {
                try {
                    // 如果是心跳响应则不处理
                    if (ev.data === "pong") {
                        return;
                    }

                    this.chatMsgData = JSON.parse(ev.data)
                    console.log("chatMsgData::::::>>>>>>", this.chatMsgData)
                    es.setEventKey("sessionList")
                } catch (e) {
                    console.log(e)
                    return
                }
            }

            ws.onerror = (ev: Event) => {
                console.log("聊天WebSocket错误:", ev)
                this.reconnectChatWs();
            }

            ws.onclose = (ev: CloseEvent) => {
                console.log("聊天WebSocket关闭:", ev)
                this.stopChatHeartbeat();
                this.reconnectChatWs();
            }

            this.chatWs = ws
        },

        // 重连聊天WebSocket
        reconnectChatWs() {
            // 如果已经在重连或者超过最大重连次数则不再尝试
            if (this.chatReconnectTimer || this.chatReconnectAttempts >= this.maxReconnectAttempts) {
                if (this.chatReconnectAttempts >= this.maxReconnectAttempts) {
                    ElMessage.error("聊天连接失败，请刷新页面重试");
                }
                return;
            }

            // 递增重连次数
            this.chatReconnectAttempts++;

            // 计算重连延迟时间，使用指数退避算法
            const delay = Math.min(1000 * Math.pow(2, this.chatReconnectAttempts - 1), 30000);

            this.chatReconnectTimer = window.setTimeout(() => {
                console.log(`聊天WebSocket尝试第${this.chatReconnectAttempts}次重连...`);
                this.chatReconnectTimer = null;
                this.initChatWs(this.chatToken);
            }, delay);
        },

        initGroupWs(token: string) {
            const userStore = useUserStore()
            const es = eventStore();

            if (!userStore.isLogin) {
                console.log("用戶未登錄，無法初始化 groupWs")
                return
            }

            // 保存token用于重连
            this.groupToken = token;

            // 关闭之前的连接
            this.closeGroupConnection();

            let proto = "ws"
            if (location.protocol === "https:") {
                proto = "wss"
            }

            const ws = new WebSocket(`${proto}://${location.host}/api/group/ws/chat?token=${token}`)

            ws.onopen = (ev: Event) => {
                console.log("group ws连接成功")
                this.groupReconnectAttempts = 0;
                this.startGroupHeartbeat();
            }

            ws.onmessage = (ev: MessageEvent) => {
                try {
                    // 如果是心跳响应则不处理
                    if (ev.data === "pong") {
                        return;
                    }

                    this.groupMsgData = JSON.parse(ev.data)
                    es.setEventKey("sessionList")
                } catch (e) {
                    console.log(e)
                    return
                }
            }

            ws.onerror = (ev: Event) => {
                console.log("群组WebSocket错误:", ev)
                this.reconnectGroupWs();
            }

            ws.onclose = (ev: CloseEvent) => {
                console.log("群组WebSocket关闭:", ev)
                this.stopGroupHeartbeat();
                this.reconnectGroupWs();
            }

            this.groupWs = ws
        },

        // 重连群组WebSocket
        reconnectGroupWs() {
            // 如果已经在重连或者超过最大重连次数则不再尝试
            if (this.groupReconnectTimer || this.groupReconnectAttempts >= this.maxReconnectAttempts) {
                if (this.groupReconnectAttempts >= this.maxReconnectAttempts) {
                    ElMessage.error("群组连接失败，请刷新页面重试");
                }
                return;
            }

            // 递增重连次数
            this.groupReconnectAttempts++;

            // 计算重连延迟时间，使用指数退避算法
            const delay = Math.min(1000 * Math.pow(2, this.groupReconnectAttempts - 1), 30000);

            this.groupReconnectTimer = window.setTimeout(() => {
                console.log(`群组WebSocket尝试第${this.groupReconnectAttempts}次重连...`);
                this.groupReconnectTimer = null;
                this.initGroupWs(this.groupToken);
            }, delay);
        },
    },
})