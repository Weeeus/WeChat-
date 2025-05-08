import {type baseResponse, useAxios} from "@/api/idnex";

export interface siteType {
    "created_at": string
    "bei_an": string
    "version": string
    "qq_image": string
    "wechat_image": string
    "bilibili_url": string
    "gitee_url": string
    "github_url": string
}

export interface qqType {
    "enable": boolean
    "app_id": string
    "key": string
    "redirect": string
    "webPath": string
}

export interface settingsType {
    "site"?: siteType
    "qq"?: qqType
}

export function settingsInfoApi():Promise<baseResponse<settingsType>>{
    return  useAxios.get("/api/settings/info")
}
