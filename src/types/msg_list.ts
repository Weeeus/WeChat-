export interface fimMsgListExpose {
    close: () => void
    chatDelete: () => Promise<boolean>
    scrollToBottom?: () => void
}