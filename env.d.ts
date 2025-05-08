/// <reference types="vite/client" />
declare module '*.vue' {
    import { DefineComponent } from "vue"
    const component: DefineComponent<{}, {}, any>
    export default component
}

export interface ImportMetaEnv {
    VITE_SERVER_URL: string
}