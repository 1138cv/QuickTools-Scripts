// 读取剪贴板内容并输出到日志
QuickToolsAPI.log.info("开始读取剪贴板...");

try {
    const text = await QuickToolsAPI.clipboard.readText();
    if (text && text.length > 0) {
        QuickToolsAPI.log.success("剪贴板内容:");
        QuickToolsAPI.log.info(text);
    } else {
        QuickToolsAPI.log.warn("剪贴板为空");
    }
} catch (err) {
    QuickToolsAPI.log.error("读取剪贴板失败: " + err);
}
