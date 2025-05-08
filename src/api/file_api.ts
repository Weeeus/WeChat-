import {type baseResponse, useAxios} from "@/api/idnex";

interface uploadImageResponse {
    url: string
}

// 图片上传
export function uploadImageApi(file: File, imageType: "avatar" | "group_avatar" | "chat"): Promise<
    baseResponse<uploadImageResponse>> {
    return new Promise((resolve, reject) => {
        const form = new FormData()
        form.set("image", file)
        form.set("imageType", imageType)
        useAxios.post("/api/file/image", form, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then((res: any) => resolve(res)).catch(err => reject(err))
    })
}

export interface uploadFileResponse {
    src: string
}

//上传文件
export function uploadFileApi(file: File): Promise<baseResponse<uploadFileResponse>> {
    const form = new FormData()
    form.set("file", file)
    return useAxios.post("/api/file/file", form, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}