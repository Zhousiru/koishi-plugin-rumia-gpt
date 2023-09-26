# Rumia GPT

Yet another simple ChatGPT plugin for Koishi.js.

## 特性

- 多 OpenAI API key 均衡负载
- 有限上下文保留
- 自动嵌入用户名称
- System prompt 日期嵌入
- 引用原文嵌入

## 安装

以下命令的工作目录均为 Koishi.js 项目的根目录

1. 克隆 Rumia GPT 到 `external/rumia-gpt` 下

   ```
   git clone https://github.com/Zhousiru/koishi-plugin-rumia-gpt.git external/rumia-gpt
   ```

2. 构建 Rumia GPT

   使用 Yarn：

   ```
   yarn install
   yarn build rumia-gpt
   ```

   使用 NPM：

   ```
   npm install
   npm run build rumia-gpt
   ```

3. 启动 Koishi.js，前往插件面板，找到并添加 `rumia-gpt`，然后进行设置
