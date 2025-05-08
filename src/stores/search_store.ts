import {defineStore} from 'pinia'

interface searchType {
    name: "search_user" | "search_group" | ""
    value: string
}

const searchData: searchType = {
    name: "",
    value: ""
}

export const useSearchStore = defineStore('searchStore', {
    state: () => {
        return {
            searchData: searchData,
        }
    },
    actions: {
        setSearchData(name: "search_user" | "search_group" | "", value: string) {
            this.searchData = {
                name,
                value
            }
        }
    }
})
