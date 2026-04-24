// 转换文本为 MySQL IN 列表
// 从剪贴板读取内容，按分隔符拆分后生成 SQL IN 表达式

// 定义分隔符
const splitSymbols = [',', '、', '，', ';', ' '];

async function main() {
    try {
        // 从剪贴板读取内容
        const text = (await QuickToolsAPI.clipboard.readText()).trim();

        if (!text) {
            QuickToolsAPI.log.info("剪贴板内容为空");
            return;
        }

        let parts;

        // 如果有多行（\n），则按行分割
        if (text.includes('\n')) {
            parts = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
        } else {
            // 否则按自定义分隔符拆分
            parts = [text];
            for (const symbol of splitSymbols) {
                const newParts = [];
                for (const part of parts) {
                    newParts.push(...part.split(symbol));
                }
                parts = newParts;
            }
            parts = parts.map(p => p.trim()).filter(p => p.length > 0);
        }

        // 构建 SQL IN 表达式
        const result = `in (${parts.map(p => `'${p}'`).join(',')})`;

        // 写回剪贴板
        await QuickToolsAPI.clipboard.writeText(result);
        QuickToolsAPI.log.success("处理完成，结果已复制到剪贴板：");
        QuickToolsAPI.log.info(result);
    } catch (e) {
        QuickToolsAPI.log.error('出现异常: ' + e.message);
    }
}

main();
