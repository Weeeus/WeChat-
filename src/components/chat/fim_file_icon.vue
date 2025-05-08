<script setup lang="ts">

interface Props {
  name: string
}
const props = defineProps<Props>()

const iconFileMap = {
  "pdf": "icon-Pdf",
  "xlsx?": "icon-Excel",
  "docx?": "icon-Word",
  "psd": "icon-psd",
  "exe": "icon-exe",
  "xmind": "icon-xmind",
  "zip|rar": "icon-zip",
  "jpe?g|png": "icon-img_cs",
  "txt": "icon-Txt",
  "mp4": "icon-mp4",
  "json": "icon-JSON",
  "": "icon-wenjianjia",
}

function getIconName(fileName: string): string {
  const fileList = fileName.split(".")
  const suffix = fileList[fileList.length - 1]
  for (const suffixKey in iconFileMap) {
    const regex = new RegExp(suffixKey)
    if (regex.test(suffix)) {
      return iconFileMap[suffixKey as keyof typeof iconFileMap]
    }
  }
  return iconFileMap[""]

}
</script>

<template>
  <i class="iconfont" :class="getIconName(props.name)"></i>
</template>