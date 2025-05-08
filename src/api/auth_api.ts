import type {baseResponse} from "@/api/idnex";
import {useAxios} from "@/api/idnex";

export interface  authLoginRequest{
    "userName": string,
    "password": string,
}

export interface authLoginResponse{
    token: string
}

// 登陆
export function authLoginApi(data: authLoginRequest): Promise<baseResponse<authLoginResponse>> {
    return useAxios.post("/api/auth/login", data)
}

interface authOpenLoginRequest {
    "code": string,
    "flag": string,
}

// 第三方登陆
export function authOpenLoginApi(data: authOpenLoginRequest): Promise<baseResponse<authLoginResponse>>{
    return useAxios.post("/api/auth/open_login", data)
}

// 注销
export function logoutApi():Promise<baseResponse<string>> {
    return  useAxios.post("/api/auth/logout")
}