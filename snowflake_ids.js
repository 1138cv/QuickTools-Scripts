// 生成雪花算法ID
// 生成100个雪花ID并复制到剪贴板

// 雪花算法实现
class Snowflake {
  constructor(workerId = 0, datacenterId = 0) {
    this.workerId = workerId;
    this.datacenterId = datacenterId;
    this.sequence = 0;
    this.lastTimestamp = -1;

    // 位移量
    this.workerIdBits = 5;
    this.datacenterIdBits = 5;
    this.sequenceBits = 12;

    this.maxWorkerId = -1 ^ (-1 << this.workerIdBits);
    this.maxDatacenterId = -1 ^ (-1 << this.datacenterIdBits);
    this.sequenceMask = -1 ^ (-1 << this.sequenceBits);

    this.workerIdShift = this.sequenceBits;
    this.datacenterIdShift = this.sequenceBits + this.workerIdBits;
    this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.datacenterIdBits;

    // 起始时间戳 (2021-01-01)
    this.twepoch = 1609459200000;
  }

  nextId() {
    let timestamp = this.currentTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & this.sequenceMask;
      if (this.sequence === 0) {
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    return BigInt.asUintN(64,
      BigInt((timestamp - this.twepoch) << this.timestampLeftShift) |
      BigInt(this.datacenterId << this.datacenterIdShift) |
      BigInt(this.workerId << this.workerIdShift) |
      BigInt(this.sequence)
    ).toString();
  }

  currentTimestamp() {
    return Date.now();
  }

  tilNextMillis(lastTimestamp) {
    let timestamp = this.currentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp();
    }
    return timestamp;
  }
}

async function main() {
  try {
    const snowflake = new Snowflake(1, 1);
    const ids = [];

    for (let i = 0; i < 100; i++) {
      ids.push(snowflake.nextId());
    }

    const result = ids.join('\n');

    // 复制到剪贴板
    await QuickToolsAPI.clipboard.writeText(result);

    QuickToolsAPI.log.success('已生成100个雪花ID并复制到剪贴板');
    QuickToolsAPI.log.info('前10个ID示例:');
    ids.slice(0, 10).forEach((id, index) => {
      QuickToolsAPI.log.info(`${index + 1}. ${id}`);
    });
  } catch (e) {
    QuickToolsAPI.log.error('生成失败: ' + e.message);
  }
}

main();
