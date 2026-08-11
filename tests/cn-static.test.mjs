import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const projectRoot = path.resolve(import.meta.dirname, "..");
const distRoot = path.join(projectRoot, "dist-cn");
const indexPath = path.join(distRoot, "index.html");

assert.ok(fs.existsSync(indexPath), "dist-cn 最外层必须包含 index.html");

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

const runtimeTextFiles = walkFiles(distRoot).filter((filePath) => /\.(?:html|css|js|json|webmanifest)$/i.test(filePath));
for (const filePath of runtimeTextFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  if (path.relative(distRoot, filePath) === "feedback.js") continue;
  assert.doesNotMatch(
    source,
    /https?:\/\/|\/\/cdn\.|jsdelivr|googleapis|gstatic|supabase\.co|vercel\.app/i,
    `${path.relative(distRoot, filePath)} 不应包含外部运行时 URL`
  );
}
const feedbackSource = fs.readFileSync(path.join(distRoot, "feedback.js"), "utf8");
const allowedFeedbackEndpoint = "https://haryktjhuazprxkzydcm.supabase.co/rest/v1/user_feedback";
assert.match(feedbackSource, new RegExp(allowedFeedbackEndpoint.replaceAll(".", "\\.")), "国内版匿名反馈应只连接批准的私密反馈表");
assert.doesNotMatch(
  feedbackSource.replace(allowedFeedbackEndpoint, ""),
  /https?:\/\/|\/\/cdn\.|jsdelivr|googleapis|gstatic|supabase\.co|vercel\.app/i,
  "feedback.js 除批准的匿名反馈接口外不应包含其他外部运行时 URL"
);

const indexHtml = fs.readFileSync(indexPath, "utf8");
const styleSource = fs.readFileSync(path.join(distRoot, "styles.css"), "utf8");
assert.doesNotMatch(indexHtml, /cloud-config|cloud-sync|supabase|jsdelivr/i, "国内版入口不应加载云端脚本");
assert.match(indexHtml, /<title>Uyghur Tili<\/title>/, "国内版应显示独立品牌名");
assert.match(indexHtml, /rel="icon"/, "国内版入口应接入浏览器图标");
assert.match(indexHtml, /rel="apple-touch-icon"/, "国内版入口应接入手机桌面图标");
assert.match(indexHtml, /rel="manifest"/, "国内版入口应接入离线网站清单");
assert.match(indexHtml, /\.\/app\.js\?v=20260812-five-step-reading/, "国内版入口应刷新五步阅读课程与可恢复单元脚本缓存");
assert.match(indexHtml, /\.\/styles\.css\?v=20260811-final-course/, "国内版入口应刷新最终课程共享响应式与反馈样式缓存");
assert.match(indexHtml, /\.\/sentence-morphemes\.js\?v=20260809-word-formation/, "国内版入口应加载本地人工词素数据");

const localReferences = [...indexHtml.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
for (const reference of localReferences) {
  assert.ok(reference.startsWith("./"), `${reference} 必须使用相对路径`);
  const cleanReference = reference.slice(2).split("?")[0];
  assert.ok(fs.existsSync(path.join(distRoot, cleanReference)), `${reference} 指向的本地文件必须存在`);
}

function makeElement(id) {
  return {
    id,
    innerHTML: "",
    textContent: "",
    dataset: {},
    classList: { add() {}, remove() {} },
    querySelector() {
      return null;
    },
    closest() {
      return null;
    },
    addEventListener() {}
  };
}

const app = makeElement("app");
const toast = makeElement("toast");
const storage = new Map();
const localStorage = {
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null;
  },
  setItem(key, value) {
    storage.set(key, String(value));
  },
  removeItem(key) {
    storage.delete(key);
  }
};
const context = {
  console,
  localStorage,
  sessionStorage: localStorage,
  document: {
    documentElement: { lang: "" },
    querySelector(selector) {
      if (selector === "#app") return app;
      if (selector === "#toast") return toast;
      return null;
    },
    addEventListener() {}
  },
  window: {
    setTimeout() {
      return 1;
    },
    clearTimeout() {},
    addEventListener() {}
  },
  Audio: function FakeAudio(src) {
    this.src = src;
    this.pause = () => {};
    this.play = () => Promise.resolve();
  }
};
context.globalThis = context;
vm.createContext(context);

const runtimeScripts = localReferences
  .filter((reference) => reference.includes(".js"))
  .map((reference) => reference.slice(2).split("?")[0]);
for (const scriptPath of runtimeScripts) {
  vm.runInContext(fs.readFileSync(path.join(distRoot, scriptPath), "utf8"), context, { filename: scriptPath });
}

const config = context.window.ANA_TILIM_APP_CONFIG;
const course = context.window.ANA_TILIM_COURSE;
assert.equal(config.edition, "cn", "国内版应使用独立配置");
assert.equal(config.cloudEnabled, false, "国内版不应启用云端服务");
assert.equal(config.brandName, "Uyghur Tili", "国内版应使用 Uyghur Tili 品牌");
assert.ok(course, "课程数据应在无网络环境中加载");
assert.ok(!course.readingUnits.some((unit) => unit.id === "famous-quotes"), "国内版应隐藏名人名言单元");
assert.equal(course.readingUnits.find((unit) => unit.id === "uyghur-proverbs")?.title, "第九单元：维吾尔谚语");
assert.doesNotMatch(
  JSON.stringify(course),
  /assalamu|alaykum|ئەسسالام|ۋەئەلەيكۇم/i,
  "课程不应保留带宗教色彩的问候词"
);

const gloss = JSON.parse(
  vm.runInContext('JSON.stringify(sentenceGlossary.glossToken("ياخشىمۇسىز"))', context)
);
assert.deepEqual(
  gloss.segments.map((segment) => [segment.word, segment.meaning]),
  [["ياخشى", "好、很好"], ["مۇ", "吗（疑问标记）"], ["سىز", "您（礼貌人称）"]],
  "句子词汇应支持逐词和词素拆解"
);
const possessiveGloss = JSON.parse(
  vm.runInContext('JSON.stringify(sentenceGlossary.glossToken("كىتابىڭىز"))', context)
);
assert.equal(possessiveGloss.formation.formula, "كىتاب + ـىڭىز → كىتابىڭىز", "国内版应解释您的书的构词过程");
assert.match(possessiveGloss.formation.note, /词干末尾不变/, "国内版应标注词干与后缀连接变化");

function renderScreen(screen) {
  vm.runInContext(`state.screen = ${JSON.stringify(screen)}; render();`, context);
  assert.ok(app.innerHTML.trim(), `${screen} 页面应可离线渲染`);
  assert.doesNotMatch(app.innerHTML, />\s*(?:undefined|null|NaN)\s*</, `${screen} 页面不应暴露空数据`);
  return app.innerHTML;
}

const welcomeHtml = renderScreen("welcome");
assert.match(welcomeHtml, /Uyghur Tili/, "欢迎页应显示国内版品牌");
assert.doesNotMatch(welcomeHtml, /登录|注册|云端|同步/, "欢迎页不应显示账号或云同步入口");
assert.match(welcomeHtml, /class="hero-content local-only"/, "国内版首次进入内容应使用单列居中布局");

for (const screen of ["home", "learn", "library", "writing"]) {
  renderScreen(screen);
}

const profileHtml = renderScreen("profile");
assert.match(profileHtml, /导出学习记录/, "国内版应保留本地进度导出");
assert.match(profileHtml, /导入学习记录/, "国内版应保留本地进度导入");
assert.match(profileHtml, /data-action="edit-display-name"/, "国内版应从顶部昵称旁修改昵称");
assert.match(profileHtml, /aria-label="修改昵称"/, "国内版昵称铅笔应有无障碍名称");
assert.doesNotMatch(profileHtml, /id="profile-display-name"/, "昵称输入框默认应收起");
assert.doesNotMatch(profileHtml, /class="profile-name-editor"/, "设置区不应重复显示旧昵称编辑器");
assert.match(profileHtml, /id="profile-avatar-input"/, "国内版应允许本地修改头像");
assert.doesNotMatch(profileHtml, /登录|注册|云端|同步/, "我的页面不应显示账号或云同步入口");

vm.runInContext('state.screen = "vocab"; state.selectedVocabGroupId = "greetings"; state.currentVocabItemId = "yaxshimusiz"; render();', context);
assert.doesNotMatch(app.innerHTML, /class="vocab-morpheme-breakdown"|data-morpheme=/, "词汇列表不应显示词素拆解");
assert.doesNotMatch(app.innerHTML, /逐词与词素参考/, "词汇页底部不应重复显示逐词与词素参考");
assert.doesNotMatch(app.innerHTML, /class="item-progress"/, "词汇页不应显示重复的当前词汇状态条");

vm.runInContext('state.screen = "reading"; state.selectedReadingUnitId = readingUnits[0].id; state.selectedReadingGroupId = readingUnits[0].groups[0].id; render();', context);
assert.match(app.innerHTML, /逐词与词素参考/, "句子课程应显示逐词与词素标注入口");
assert.match(app.innerHTML, /从右向左理解 ←/, "句子拆解应显示从右往左理解箭头");
assert.equal(vm.runInContext("renderSentenceGlosses('رەھمەت.')", context), "", "单个不可拆词不应显示多余拆解面板");
assert.match(vm.runInContext("renderSentenceGlosses('كىتابىڭىز بارمۇ؟')", context), /كىتاب \+ ـىڭىز → كىتابىڭىز/, "句子内应显示词局部构词公式");

vm.runInContext('state.screen = "picture"; state.selectedGroupId = alphabetGroups[0].id; state.currentLetterId = alphabetGroups[0].letters[0].id; state.selectedPicture = null; render();', context);
assert.match(app.innerHTML, /letter-only-choice/, "点位辨认应使用只显示字母的选项");
assert.doesNotMatch(app.innerHTML, /choice-copy/, "点位辨认选项不应显示答案提示词");

vm.runInContext('state.screen = "letterSound"; state.selectedGroupId = "dot-bone"; state.currentLetterId = "be"; state.selectedListening = ""; render();', context);
assert.match(app.innerHTML, /audio-only-focus/, "读音选择应只保留听音按钮");
assert.doesNotMatch(app.innerHTML, /播放或查看读音|真人音频：|音频待录|音频未生成时/, "读音选择不应显示额外音频说明文字");

vm.runInContext('state.screen = "keyboard"; state.selectedGroupId = "vowels-basic"; state.currentLetterId = "ae"; state.keyboardValue = ""; render();', context);
assert.match(app.innerHTML, /aria-label="维吾尔语标准键盘"/, "键盘练习应使用真实维吾尔语键位");
assert.match(app.innerHTML, /uyghur-keyboard-row row-top/, "键盘练习应保留物理键盘第一行");
assert.match(app.innerHTML, /data-physical-key="Q"/, "键盘练习应标出对应实体键");
assert.doesNotMatch(app.innerHTML, /aria-label="本组字母快捷键"/, "显示标准键盘后不应再显示重复的本组字母快捷键");
assert.equal(context.window.ANA_TILIM_UYGHUR_KEYBOARD.keyForCode("KeyK", true).value, "ۆ", "Shift 键位应输出对应维吾尔语字符");
assert.equal(context.window.ANA_TILIM_UYGHUR_KEYBOARD.keyForCode("Space", false)?.value, " ", "实体空格键应映射到空格");
assert.equal(context.window.ANA_TILIM_UYGHUR_KEYBOARD.keystrokesForText("كۆپ رەھمەت").map((stroke) => stroke.value).join(""), "كۆپ رەھمەت", "多词目标不得丢失空格");
assert.match(app.innerHTML, /data-physical-key="Space"/, "虚拟键盘应显示空格键");
assert.match(app.innerHTML, />بوشلۇق<\/button>/, "空格键应使用真实维吾尔语标签");
assert.match(app.innerHTML, /data-action="key"[^>]*data-key="ئ"/, "教学键盘应直接显示承托字母 ئ");
assert.doesNotMatch(app.innerHTML, />123<\/button>|>يوللا<\/button>|aria-label="表情键（仅展示）"/, "学习键盘不应显示数字层、表情或发送键");
assert.match(app.innerHTML, /data-action="go"[^>]*data-target="complete"[^>]*disabled[^>]*>\s*完成课程\s*<\/button>/, "课程完成操作应使用键盘外的网站标准按钮");
assert.doesNotMatch(styleSource, /\.uyghur-keyboard\s*\{[^}]*background:\s*#242529/s, "手机和平板不应显示黑色键盘外壳");
assert.match(styleSource, /\.uyghur-keyboard\s*\{[^}]*background:\s*linear-gradient/s, "手机和平板应使用网站浅色界面外观");
assert.match(styleSource, /\.uyghur-keyboard \.key-button\.next-key\s*\{[^}]*background:\s*#fff0c8/s, "开始连接时应高亮下一键");
assert.match(styleSource, /\.uyghur-keyboard \.keyboard-shift\.active\s*\{[^}]*background:\s*var\(--mint\)/s, "按住 Shift 时应显示网站薄荷色激活状态");
assert.match(styleSource, /@font-face\s*\{[^}]*ScheherazadeNew-Regular\.woff2/s, "国内版应本地加载 Scheherazade New Regular");
assert.match(styleSource, /@font-face\s*\{[^}]*ScheherazadeNew-Bold\.woff2/s, "国内版应本地加载 Scheherazade New Bold");
assert.match(styleSource, /\.uyghur\s*\{[^}]*font-family:\s*"Scheherazade New"/s, "国内版全部维吾尔语应统一字体");
assert.ok(fs.existsSync(path.join(distRoot, "assets/fonts/ScheherazadeNew-Regular.woff2")), "国内版应包含完整 Regular 网页字体");
assert.ok(fs.existsSync(path.join(distRoot, "assets/fonts/ScheherazadeNew-Bold.woff2")), "国内版应包含完整 Bold 网页字体");
assert.ok(fs.existsSync(path.join(distRoot, "assets/fonts/OFL.txt")), "国内版应随字体保留 SIL OFL 许可证");
assert.match(app.innerHTML, /还差 2 键/, "复合元音应按真实物理击键数量提示");
assert.match(app.innerHTML, /第 1 步：点击 ئ/, "复合元音应先提示点击承托字母 ئ");
assert.doesNotMatch(app.innerHTML, /第 1 步：点击 ئە/, "不得提示键盘中不存在的复合单键");
assert.match(app.innerHTML, /按顺序点击/, "复合元音应显示真实按键顺序");
vm.runInContext('state.keyboardValue = "ئ"; render();', context);
assert.match(app.innerHTML, /还差 1 键/, "输入第一键后应只剩一个物理键");
assert.match(app.innerHTML, /第 2 步：点击 ە/, "输入 ئ 后应提示元音键 ە");
vm.runInContext('state.keyboardValue = ""; state.keyboardShift = true; render();', context);
assert.match(app.innerHTML, /keyboard-shift active next-key/, "Shift 状态不符时应提示先切换 Shift");
assert.doesNotMatch(app.innerHTML, /physical-key next-key[^>]*data-code="Slash"/, "Shift 会输出错误字符时不得高亮该字母键");

vm.runInContext('state.screen = "complete"; state.selectedGroupId = alphabetGroups[0].id; state.currentLetterId = alphabetGroups[0].letters[0].id; render();', context);
assert.match(app.innerHTML, /继续学习本单元下一课/, "首组课程完成页应提供继续下一课按钮");

const audioTargets = JSON.parse(
  vm.runInContext(
    "JSON.stringify([...alphabetVoiceAudioItems, ...comboAudioItems, ...vocabAudioItems, ...readingAudioItems, ...dedicatedFormExampleAudioByValue.values()])",
    context
  )
);
assert.ok(audioTargets.length > 0, "应找到本地真人音频目标");
for (const item of audioTargets) {
  assert.ok(item.outputPath.startsWith("./"), `${item.id} 的音频路径必须是相对路径`);
  assert.ok(fs.existsSync(path.join(distRoot, item.outputPath.slice(2))), `${item.id} 的真人音频必须已打包`);
}

const originalSnapshot = {
  progress: { completedLessons: ["group-1"], completedReadingLessons: [] },
  preferences: { audioAutoplay: false, dailyGoal: 10, learningReminder: false, showLatin: true }
};
const importedSnapshot = JSON.parse(
  vm.runInContext(
    `JSON.stringify(progressTransfer.parseImportPayload(JSON.stringify(progressTransfer.createExportPayload(${JSON.stringify(originalSnapshot)}, { edition: "cn", brandName: "Uyghur Tili" })), { expectedEdition: "cn" }).data)`,
    context
  )
);
assert.deepEqual(importedSnapshot, originalSnapshot, "本地进度导入导出应可离线往返");

console.log(`Uyghur Tili 国内静态版检查通过（${audioTargets.length} 个本地音频目标）`);
