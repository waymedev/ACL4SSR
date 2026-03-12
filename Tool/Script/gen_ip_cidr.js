#!/usr/bin/env node

const fs = require("fs");
const https = require("https");

const SOURCE_URL =
  "https://raw.githubusercontent.com/17mon/china_ip_list/refs/heads/master/china_ip_list.txt";
const OUTPUT_FILE = "IP-CIDR.list";

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`请求失败，状态码: ${res.statusCode}`));
          res.resume();
          return;
        }

        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

(async () => {
  try {
    const raw = await fetchText(SOURCE_URL);

    const lines = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("#"));

    const rules = lines.map((ip) => `IP-CIDR,${ip},no-resolve`);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const updateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const header = [
      "# 内容：中国IP地址段",
      "# 来源：https://github.com/17mon/china_ip_list/",
      `# 更新：${updateTime}`,
      `# 数量：${rules.length}条`,
      "",
    ];

    fs.writeFileSync(OUTPUT_FILE, [...header, ...rules].join("\n"), "utf8");
    console.log(`已生成 ${OUTPUT_FILE}，共 ${rules.length} 条`);
  } catch (err) {
    console.error("生成失败：", err.message);
    process.exit(1);
  }
})();
