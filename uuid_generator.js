// 生成UUID
// 生成100个UUID（无横线、全小写）并复制到剪贴板

// 生成UUID v4
function generateUUID() {
  const hex = [];
  for (let i = 0; i < 256; i++) {
    hex.push((i + 0x100).toString(16).substr(1));
  }

  const r = crypto.getRandomValues(new Uint8Array(16));
  r[6] = (r[6] & 0x0f) | 0x40;
  r[8] = (r[8] & 0x3f) | 0x80;

  return (
    hex[r[0]] + hex[r[1]] +
    hex[r[2]] + hex[r[3]] +
    hex[r[4]] + hex[r[5]] +
    hex[r[6]] + hex[r[7]] +
    hex[r[8]] + hex[r[9]] +
    hex[r[10]] + hex[r[11]] +
    hex[r[12]] + hex[r[13]] +
    hex[r[14]] + hex[r[15]]
  );
}

async function main() {
  try {
    const uuids = [];

    for (let i = 0; i < 100; i++) {
      uuids.push(generateUUID());
    }

    const result = uuids.join('\n');

    // 复制到剪贴板
    await QuickToolsAPI.clipboard.writeText(result);

    QuickToolsAPI.log.success('已生成100个UUID并复制到剪贴板');
  } catch (e) {
    QuickToolsAPI.log.error('生成失败: ' + e.message);
  }
}

main();
