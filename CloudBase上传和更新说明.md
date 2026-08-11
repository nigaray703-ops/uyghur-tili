# CloudBase 静态网站上传和更新说明

## 当前线上地址

<https://uyghur-tili-uyghur-tili-d4gv9odyhe312c9c5.webapps.tcloudbase.com/>

环境 ID：`uyghur-tili-d4gv9odyhe312c9c5`

更新同一个环境和根目录不会改变上面的地址。只有主动删除应用、改用其他环境或配置自定义域名时，访问地址才会改变。

## 第一次上传

1. 登录腾讯云 CloudBase 控制台。
2. 进入目标环境，打开“静态网站托管”。
3. 选择上传文件夹，上传本项目的整个 `dist-cn` 文件夹内容。
4. 确认上传后的最外层直接看到 `index.html`，不要多套一层 `dist-cn` 目录。
5. 等待部署完成，打开 CloudBase 提供的访问地址。
6. 首次打开后依次确认首页、字母课程、真人录音和“我的 → 导出学习记录”。

## 更新网站

1. 修改 `site` 中的源码或课程资源。
2. 在项目根目录运行 `node scripts/build-cn.mjs`。
3. 重新上传 `dist-cn` 里的全部文件并覆盖同名文件。
4. 部署完成后刷新页面；如仍看到旧版本，请清除浏览器缓存后再试。

推荐使用腾讯云官方 CloudBase CLI，避免控制台“文件管理”把整个文件夹错误地上传成 `/dist-cn/` 子目录：

```bash
tcb login
tcb hosting deploy ./dist-cn -e uyghur-tili-d4gv9odyhe312c9c5 --concurrency 10 --retry-count 5
```

这里不填写云端子目录，因此 `dist-cn/index.html` 会覆盖到网站根目录的 `/index.html`。命令显示 `Successfully uploaded 519 file(s)` 后，再打开线上地址验收。

如果本次版本删除过旧资源，请在 CloudBase 文件管理中逐个删除确认不再使用的旧文件，或新建一个空的静态托管环境后上传。不要误删仍被课程引用的真人录音。

## 需要保留的设置

- 首页文件：`index.html`
- 静态资源路径：全部为相对路径
- 网站图标：`assets/favicon-32.png`、`assets/apple-touch-icon.png`、`assets/icon-192.png`、`assets/icon-512.png`
- 登录与云同步：国内版未启用
- 学习进度：保存在访问者当前浏览器；换设备前可在“我的”页面导出 JSON，换设备后再导入

## 注意

- 不要只上传 `index.html`，必须同时上传 `course-data`、`assets`、JavaScript 和 CSS 文件。
- CloudBase 控制台操作可能随版本变化，以控制台当前“静态网站托管”入口为准。
- 更新课程音频后要重新生成并上传 `dist-cn`，否则线上仍会使用旧文件。
- 更新完成后应在公网实际检查：真实维吾尔语键盘、真人录音、逐词词素标注、下一课程按钮、本地昵称与头像、网站图标。
- 国外版 `Ana Tilim` 继续使用 <https://ana-tilim.vercel.app>；不要把国内版文件上传到国外版项目。
