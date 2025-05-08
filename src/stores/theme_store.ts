import {defineStore} from "pinia";
interface useThemeStoreType {
    theme: boolean
}

export const useThemeStore = defineStore("themeStore", {
    state: (): useThemeStoreType => ({
        theme: true // true 表示白天模式，false 表示黑夜模式
    }),
    actions: {
        setTheme(theme?: boolean): void{
            if(theme !== undefined){
                this.theme = theme
            }else {
                this.theme = !this.theme
            }
            if(this.theme){
                document.documentElement.classList.remove("dark")
            }else {
                document.documentElement.classList.add("dark")
            }
            localStorage.setItem("theme", this.themeString)
        },
        loadTheme(): viod{
            const  val: string|null = localStorage.getItem("theme")
            if(!val){
                return
            }
            if(val === "dark"){
                this.setTheme(false)
                return
            }
        },
    },
    getters: {
        themeString(): string {
            return this.theme ? "" : "dark";
        }
    }
});
