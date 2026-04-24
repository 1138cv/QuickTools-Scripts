// 填充参数到SQL中
// 从剪贴板获取 JSON 参数和 SQL，将参数填充到 SQL 中

function isNumber(string) {
    return /^\d+$/.test(string);
}

async function main() {
    try {
        // 从剪贴板获取输入字符串（异步）
        const s = await QuickToolsAPI.clipboard.readText();

        if (!s || s.length === 0) {
            QuickToolsAPI.log.error('剪贴板为空');
            return;
        }

        // 分割 JSON 和 SQL
        const parts = s.split('===');
        if (parts.length < 2) {
            QuickToolsAPI.log.error('格式错误：请使用 === 分隔 JSON 参数和 SQL');
            return;
        }

        const jsonStr = parts[0].trim();
        let sqlStr = parts[1].trim();

        // 解析 JSON
        let data;
        try {
            data = JSON.parse(jsonStr);
        } catch (e) {
            QuickToolsAPI.log.error('解析 JSON 失败：' + e.message);
            return;
        }

        // 处理数据类型
        if (Array.isArray(data)) {
            if (data.length === 0) {
                QuickToolsAPI.log.error('JSON 数组为空');
                return;
            }
            data = data[0];
        } else if (typeof data !== 'object' || data === null) {
            QuickToolsAPI.log.error('剪贴板内容不是有效的 JSON 对象');
            return;
        }

        // 将所有 key 转换为小写
        const lowerData = {};
        for (const [k, v] of Object.entries(data)) {
            lowerData[k.toLowerCase()] = v;
        }

        // 获取所有替换指示符 (:a, :ab 等)
        const placeholderRegex = /:\w+/g;
        const placeholders = sqlStr.match(placeholderRegex) || [];

        // 遍历指示符并替换
        for (const placeholder of placeholders) {
            try {
                const k = placeholder.slice(1).toLowerCase();

                // 跳过纯数字的占位符
                if (isNumber(k)) {
                    continue;
                }

                // 检查参数是否存在
                if (!(k in lowerData)) {
                    QuickToolsAPI.log.error('参数缺失：' + k);
                    continue;
                }

                let v = lowerData[k];

                // 处理 null 值
                if (v === null || v === undefined) {
                    v = 'null';
                }

                // 构建正则表达式（匹配完整的单词）
                const pattern = new RegExp(`:${k}\\b`, 'gi');

                // 根据值类型进行替换
                if (Array.isArray(v)) {
                    // 数组类型：转换为 (item1,item2,...) 格式
                    let formattedList;
                    if (v.length === 0) {
                        formattedList = '';
                    } else {
                        formattedList = v.map(item =>
                            typeof item === 'string' ? `'${item}'` : String(item)
                        ).join(',');
                    }
                    sqlStr = sqlStr.replace(pattern, `(${formattedList})`);
                } else if (typeof v === 'number' || v === 'null') {
                    // 数字或 null：直接替换
                    sqlStr = sqlStr.replace(pattern, String(v));
                } else {
                    // 字符串类型：加引号
                    sqlStr = sqlStr.replace(pattern, `'${v}'`);
                }
            } catch (e) {
                QuickToolsAPI.log.error('替换参数时报错：' + e.message);
            }
        }

        // 将结果写入剪贴板（异步）
        await QuickToolsAPI.clipboard.writeText(sqlStr);
        QuickToolsAPI.log.success('处理成功，SQL 已复制到剪贴板');

    } catch (e) {
        QuickToolsAPI.log.error('执行出错：' + e.message);
    }
}

main();
