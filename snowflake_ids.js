// 生成雪花算法ID
// 生成100个雪花ID并复制到剪贴板

// 雪花算法实现 - 参考Java版本
class SnowflakeIdGenerator {
  constructor(workerId, datacenterId) {
    // 常量定义
    // 固定起点 2012-01-01 00:00:00 UTC+8 越小为19位的开头越大
    this.twepoch = 1325347200000n; // 2012-01-01 00:00:00 UTC+8
    this.workerIdBits = 5n;
    this.datacenterIdBits = 5n;
    this.maxWorkerId = 31n;
    this.maxDatacenterId = 31n;
    this.sequenceBits = 12n;
    this.workerIdShift = 12n;
    this.datacenterIdShift = 17n;
    this.timestampLeftShift = 22n;
    this.sequenceMask = 4095n;

    // 参数校验
    if (workerId < 0n || workerId > this.maxWorkerId) {
      throw new Error(`worker Id can't be greater than ${this.maxWorkerId} or less than 0`);
    }
    if (datacenterId < 0n || datacenterId > this.maxDatacenterId) {
      throw new Error(`datacenter Id can't be greater than ${this.maxDatacenterId} or less than 0`);
    }

    this.workerId = BigInt(workerId);
    this.datacenterId = BigInt(datacenterId);
    this.sequence = 0n;
    this.lastTimestamp = -1n;
  }

  nextId() {
    let timestamp = BigInt(this.timeGen());

    if (timestamp < this.lastTimestamp) {
      throw new Error(`Clock moved backwards. Refusing to generate id for ${this.lastTimestamp - timestamp} milliseconds`);
    }

    if (this.lastTimestamp === timestamp) {
      this.sequence = (this.sequence + 1n) & this.sequenceMask;
      if (this.sequence === 0n) {
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    // 计算ID: (timestamp - twepoch) << 22 | datacenterId << 17 | workerId << 12 | sequence
    const id = ((timestamp - this.twepoch) << this.timestampLeftShift) |
               (this.datacenterId << this.datacenterIdShift) |
               (this.workerId << this.workerIdShift) |
               this.sequence;

    return id.toString();
  }

  tilNextMillis(lastTimestamp) {
    let timestamp = BigInt(this.timeGen());
    while (timestamp <= lastTimestamp) {
      timestamp = BigInt(this.timeGen());
    }
    return timestamp;
  }

  timeGen() {
    return Date.now();
  }
}

async function main() {
  try {
    const generator = new SnowflakeIdGenerator(1n, 1n);
    const ids = [];

    for (let i = 0; i < 100; i++) {
      ids.push(generator.nextId());
    }

    const result = ids.join('\n');

    // 复制到剪贴板
    await QuickToolsAPI.clipboard.writeText(result);

    QuickToolsAPI.log.success('已生成100个雪花ID并复制到剪贴板');
  } catch (e) {
    QuickToolsAPI.log.error('生成失败: ' + e.message);
  }
}

main();
