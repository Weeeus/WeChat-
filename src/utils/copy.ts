export async function copyText(content: string) {
    if (!content) {
        return;
    }
    try {
        // 使用 Clipboard API 将文本复制到剪贴板
        await navigator.clipboard.writeText(content);
        console.log('复制成功!');
    } catch (err) {
        console.error('复制失败: ', err);
    }
}
