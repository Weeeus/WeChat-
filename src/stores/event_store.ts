import {defineStore} from 'pinia'
// import type {eventKeyType} from "@/types/type";

export type eventKeyType = "groupList" | "" | "sessionList" | "friendList" | "history"

interface useEventStoreType {
    eventKey: eventKeyType
}

export const eventStore = defineStore('eventStore', {
    state: (): useEventStoreType => {
        return {
            eventKey: "", // 需要事件通知的key
        }
    },
    actions: {
        setEventKey(key: eventKeyType) {
            this.eventKey = ""
            setTimeout(() => {
                this.eventKey = key
            })
        }
    },
})
