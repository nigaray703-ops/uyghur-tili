<p align="center">
  <img src="./site/assets/logo.png" alt="Uyghur Tili logo" width="180" />
</p>

<h1 align="center">Uyghur Tili · ئۇيغۇر تىلى</h1>

<p align="center">
  面向中国大陆使用场景的维吾尔语学习网站：无需注册，打开即可学习，进度保存在浏览器本地。
</p>

<p align="center">
  A China-focused Uyghur language learning website with human audio, guided practice,
  browser-local progress, and no sign-in requirement.
</p>

<p align="center">
  <strong>Source available for viewing and reference. Not open source. All rights reserved.</strong>
</p>

<p align="center">
  <a href="https://uyghur-tili-uyghur-tili-d4gv9odyhe312c9c5.webapps.tcloudbase.com/"><strong>打开国内版网站</strong></a>
  ·
  <a href="https://github.com/nigaray703-ops/uyghur-tili">GitHub 仓库</a>
  ·
  <a href="https://ana-tilim.vercel.app/">Ana Tilim 海外版</a>
</p>

## 项目介绍

Uyghur Tili 是独立于海外版 Ana Tilim 的中国大陆静态版本。它面向从零开始学习维吾尔语的人，也适合会说维吾尔语、但希望加强识字、拼写、键盘输入、阅读和书写能力的学习者。

核心学习功能在浏览器内运行，不要求注册或登录。学习进度默认保存在当前浏览器中，可以手动导出为 JSON 文件，并在另一台设备或浏览器中导入。

学习路线把字母识别、连接形态、真人发音、词汇、听力、阅读、书写和键盘练习连接起来，而不是拆成互不相关的练习。

## 已实现内容

- 维吾尔文字母形态、连接规则、发音提示和 ULY 拉丁转写
- 字母、词汇、例句和阅读内容配套的真人录音
- 词汇、常用组合、句子、语法示例、谚语、故事和阿凡提内容
- 听音辨认、听写、配对、复习和错误回顾练习
- 真实维吾尔语键位和拉丁输入练习
- 逐词释义、词素拆解和构词参考
- 手机优先布局及从右到左文字支持
- 浏览器本地学习进度、昵称和头像
- 学习记录导出、导入和恢复
- 不加载海外版登录、云同步或第三方 Supabase SDK

## 国内版与海外版

| 项目 | 国内版 Uyghur Tili | 海外版 Ana Tilim |
| --- | --- | --- |
| 主要场景 | 中国大陆静态访问 | 全球访问 |
| 托管 | Tencent CloudBase | Vercel |
| 说明语言 | 中文为主 | 中文与英文界面 |
| 未登录学习 | 支持 | 支持 |
| 登录 | 不提供 | 可选 Google 登录 |
| 默认进度 | 当前浏览器本地保存 | 游客在本地保存 |
| 云同步 | 不提供 | 登录后可选 Supabase UID 隔离同步 |
| 源码仓库 | [uyghur-tili](https://github.com/nigaray703-ops/uyghur-tili) | [ana-tilim](https://github.com/nigaray703-ops/ana-tilim) |
| 正式网站 | [CloudBase](https://uyghur-tili-uyghur-tili-d4gv9odyhe312c9c5.webapps.tcloudbase.com/) | [Vercel](https://ana-tilim.vercel.app/) |

两个版本执行相同的版权、隐私、音频保护和公开仓库质量要求；差异仅来自实际部署环境和账号同步方式。

## 本地运行

这是一个静态 HTML、CSS 和 JavaScript 项目。请通过 HTTP 访问，不要直接用 `file://` 打开，否则浏览器可能限制脚本、音频和本地存储行为。

```bash
git clone https://github.com/nigaray703-ops/uyghur-tili.git
cd uyghur-tili
node scripts/build-cn.mjs
cd dist-cn
python3 -m http.server 4173
```

然后打开 [http://localhost:4173/](http://localhost:4173/)。

## 重新构建

在仓库根目录运行：

```bash
node scripts/build-cn.mjs
```

生成结果位于本地 `dist-cn/`，最外层包含 `index.html`。该目录是可直接上传到 CloudBase 的发布成品，但属于生成内容，不提交到 GitHub。

构建脚本只复制国内版运行时所需的本地资源。海外版专用的登录与云同步文件、重录工具、音频清单、名人名言单元及其专用音频不会进入国内版发布包。

## 项目检查

```bash
node tests/repository-boundary.test.mjs
node scripts/build-cn.mjs
node tests/cn-static.test.mjs
```

检查内容包括 GitHub 公开文件边界、离线静态资源、外部请求限制、国内版品牌和配置、课程数据、页面渲染、真实键盘、进度导入导出及真人音频引用。

## 仓库结构

```text
site/                         国内版源码、课程数据和运行资源
  assets/audio/human/         国内版使用的真人录音
  assets/fonts/               随项目提供的字体及其第三方许可证
scripts/build-cn.mjs          国内版发布包生成脚本
tests/cn-static.test.mjs      国内版静态与功能检查
tests/repository-boundary.test.mjs
                              GitHub 公开文件边界检查
docs/外部依赖审计.md           国内版外部请求与本地资源审计
CloudBase上传和更新说明.md      CloudBase 部署与更新步骤
LICENSE.md                    版权、参考和音频使用条款
```

`dist-cn/` 是本地生成的 CloudBase 发布目录，ZIP 文件、历史预览、缓存和系统隐藏文件不会进入公开仓库。

## 数据与隐私

- 国内版不提供注册、登录或学习进度云同步。
- 学习进度、昵称和头像默认保存在访问者自己的浏览器中。
- 换设备前可在“我的”页面导出学习记录，再在新设备中导入。
- 页面不加载 Vercel、Google Fonts、jsDelivr 或 Supabase JavaScript SDK。
- 唯一批准的外部运行时请求是匿名反馈：用户主动提交后，页面把反馈类型、文字、可选联系方式、版本标识和国内版标识发送到固定的 Supabase REST 表端点。
- 匿名反馈不上传附件，也不会上传课程学习进度、昵称或头像。
- 仓库只包含可公开的客户端提交密钥；不得提交 service-role 密钥、数据库密码、私有 API 密钥或真实用户导出。

详细审计见 [`docs/外部依赖审计.md`](./docs/外部依赖审计.md)。

## 版权、参考与音频使用

**Source available for viewing and reference. Not open source. All rights reserved.**

可以访问正式网站学习、查看仓库了解实现思路、在注明来源和官方链接后介绍或引用项目，也可以借鉴一般想法后使用自己的代码、原创内容、不同品牌和不同视觉设计独立开发明显不同的作品。

未经书面许可，不得复制、大量改写、换品牌、重新托管、出售或发布本项目，也不得把本项目、Fork、复制版或轻微修改版声称为自己原创。

**Human recordings may not be extracted, reused, redistributed, modified, or used in other projects or AI datasets without prior written permission.**

真人音频只允许通过 Uyghur Tili 或 Ana Tilim 正式网站用于个人语言学习。不得把音频用于其他网站、App、课程、视频、播客、广告、数据集、语音模型或 AI 训练与生成项目。即使注明来源，也不会自动获得音频使用权。

完整规则见 [`LICENSE.md`](./LICENSE.md)。第三方字体仍遵守字体文件目录内附带的 SIL Open Font License。

## 反馈与外部修改

欢迎通过网站内的匿名反馈入口提供内容、音频或显示问题。外部用户可以引用或介绍项目，但不能直接修改本仓库的 `main` 分支或正式网站。任何外部代码修改是否接受，由仓库所有者单独决定；提交建议不代表获得源码、设计、课程或音频的再利用许可。

## 当前状态

Uyghur Tili 是一个可运行、已部署到 CloudBase 的手机优先静态 Web 版本。它不是原生 iOS 或 Android 应用，也不宣称已经达到商业生产产品标准。
