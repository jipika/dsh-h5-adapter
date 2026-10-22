// dsh-h5-adapter — browser half.
//
// H5 窄屏适配层。设计口径：
//   1) 只做「壳」——会话头、标签、消息区、composer、浮层、通用触摸尺寸；
//   2) 不重做侧栏抽屉：dsh-pocket 的 mobile 层已经把 sidebar 变成 drawer，
//      这里只做协同（抽屉内按钮尺寸、设置浮层与抽屉的层级）；
//   3) 所有规则都包在 @media (max-width:1023px) 内，桌面端零影响；
//   4) 选择器只用框架稳定标记（data-composer-* / data-conversation-* /
//      data-mobile-nav / role）与 CSS Modules 的类名后缀（[class*="_titleRow"]），
//      不硬编码 hash 前缀，升级后不会整片失效。
window.__ModuleLoader__.load({
  id: "dsh-h5-adapter",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var STYLE_ID = "dsh-h5-adapter-style";
    var VERSION = "0.11.18";
    var BP = 1023;

    var css = [];

    function block(text) {
      css.push("@media (max-width:" + BP + "px){\n" + text + "\n}");
    }

    // ─────────────────────────────────────────────────────────────
    // (0) 基础：移动端文本缩放 / 滚动惯性
    // ─────────────────────────────────────────────────────────────
    block([
      'html[data-h5-adapter="on"]{-webkit-text-size-adjust:100%;text-size-adjust:100%;}',
      'html[data-h5-adapter="on"] body{overscroll-behavior-y:none;}',
      'html[data-h5-adapter="on"] button,html[data-h5-adapter="on"] [role="button"]{-webkit-tap-highlight-color:transparent;}'
    ].join("\n"));

    // ─────────────────────────────────────────────────────────────
    // (1) 会话头部：标题行 / 右侧动作 / 标签行
    //     官方结构：header.header > [titleRow(titleCluster(headerActions) +
    //     headerUtilities + headerCorner)] + tabs
    // ─────────────────────────────────────────────────────────────
    block([
      // 官方 header 是 grid，min-height:76px，左右 padding 20/28；窄屏收到 10/10。
      'header[class*="_header"]{padding:8px 10px 0 10px !important;min-height:0 !important;border-bottom:0.5px solid var(--dsw-alias-border-l3);}',
      '[class*="_titleRow"]{min-height:30px !important;padding-inline-start:0 !important;gap:4px !important;}',
      '[class*="_titleCluster"]{gap:6px !important;min-width:0 !important;}',
      // 右侧动作：允许横向滑动，按钮文字截断，不把标题挤没。
      '[class*="_headerActions"]{gap:4px !important;min-width:0 !important;overflow-x:auto !important;overflow-y:hidden !important;scrollbar-width:none !important;-webkit-overflow-scrolling:touch;}',
      '[class*="_headerActions"]::-webkit-scrollbar{display:none !important;}',
      '[class*="_headerActions"] > *{flex:none !important;}',
      '[class*="_headerActions"] button{max-width:118px !important;padding:0 6px !important;}',
      '[class*="_headerActions"] button > span{overflow:hidden !important;text-overflow:ellipsis !important;white-space:nowrap !important;}',
      '[class*="_headerUtilities"]{margin-left:4px !important;gap:2px !important;}',
      '[class*="_headerCorner"]{margin-left:2px !important;margin-right:-6px !important;}',
      // 头部控件触摸尺寸：图标按钮视觉仍是 28，点击区外扩由 min-height 承担。
      'header[class*="_header"] button{min-height:32px;min-width:30px;}',
      // 360 宽实测：右侧 7 个图标把标题挤到只剩 66px。手机上没有「用访达打开」
      // 这两个桌面动作（open-in-app 插件的两个按钮），收掉给标题让位。
      'header[class*="_header"] button[aria-label*="访达"],header[class*="_header"] button[aria-label*="更多打开方式"]{display:none !important;}',
      // dsh-comfyui 的「ComfyUI 面板」在 header 里是图标 + 文字（114px），
      // 手机上只留图标，把宽度还给会话标题。
      'header[class*="_header"] .dsc-trigger > span:not(.dsc-trigger-glyph){display:none !important;}',
      'header[class*="_header"] .dsc-trigger{max-width:34px !important;min-width:34px !important;padding:0 !important;justify-content:center !important;}',
      '[class*="_crumbs"]{font-size:15px !important;min-width:0 !important;}',
      // 标签行：官方 gap 36px 在手机上纯浪费；改成 0 + 内边距，整行可横滑。
      '[class*="_tabs"]{gap:0 !important;margin-top:2px !important;padding-left:0 !important;overflow-x:auto !important;overflow-y:hidden !important;scrollbar-width:none !important;-webkit-overflow-scrolling:touch;}',
      '[class*="_tabs"]::-webkit-scrollbar{display:none !important;}',
      '[class*="_tabs"] > button{flex:none !important;padding:6px 10px 9px !important;}',
      '[class*="_tabs"] > button::after{left:10px !important;right:10px !important;}'
    ].join("\n"));

    // ─────────────────────────────────────────────────────────────
    // (2) 消息区：留白、图片、代码/表格横向滚动、动作行换行
    // ─────────────────────────────────────────────────────────────
    block([
      '[class*="_scrollBody"]{scrollbar-width:none !important;scrollbar-gutter:auto !important;}',
      '[class*="_scrollBody"]::-webkit-scrollbar{display:none !important;width:0 !important;height:0 !important;}',
      // 消息正文左右各 20px（pocket 已给 20），再收紧到 14。
      '[data-conversation-scroll] [class*="_scroll"]{padding-left:14px !important;padding-right:14px !important;}',
      // composer 输入区自己的 scroll 不参与上面的收紧（实测 yhfFVG_scroll pad 0）。
      '[data-composer-card] [class*="_scroll"]{padding-left:0 !important;padding-right:0 !important;}',
      '[data-conversation-scroll] img{max-width:100% !important;height:auto !important;}',
      '[data-conversation-scroll] video,[data-conversation-scroll] canvas{max-width:100% !important;}',
      '[data-conversation-scroll] pre,[data-conversation-scroll] table,[data-conversation-scroll] [class*="_diff"]{max-width:100% !important;overflow-x:auto !important;-webkit-overflow-scrolling:touch;}',
      '[data-conversation-scroll] [class*="_actions"]{flex-wrap:wrap !important;row-gap:4px !important;}',
      // 消息正文 15px（官方 16px 对手机偏大）；代码/表格内字号不受影响。
      '[data-conversation-scroll] [class*="_text_"]{font-size:15px !important;}',
      // 文件/补丁卡片里的「复制」按钮（aria-label=复制）在窄屏视觉过重：
      // 统一压到 24px 高 / 12px 字，不改宽度与位置，避免破坏卡片布局。
      '[data-conversation-scroll] button[aria-label="复制"]{height:24px !important;min-height:24px !important;font-size:12px !important;}',
      // JS 标记的「复制」文字按钮（见 watchCopyButtons）：紧凑胶囊样式。
      // 消息流里零散的「复制」文字胶囊（思考块/状态行尾部）在手机上很突兀，直接隐藏；
      // 用户消息右侧的图标动作（class 含 _action、无文字）不受影响。
      'button[data-h5-copy="1"]{display:none !important;}'
    ].join("\n"));

    // ─────────────────────────────────────────────────────────────
    // (3) Composer：工具栏换行、触摸尺寸、模型选择器、状态行横滑、iOS 输入框
    // ─────────────────────────────────────────────────────────────
    block([
      '[data-composer-seat]{padding-left:8px !important;padding-right:8px !important;padding-bottom:calc(4px + env(safe-area-inset-bottom,0px)) !important;}',
      '[data-composer-card]{border-radius:18px !important;}',
      // 官方 composer row 的真实结构（390×844 实测）：
      //   row > tools [add / modes / 插件控件] + trailing [standardControls(召唤+模型) / primary(发送)]
      // 两组的排布完全交给官方 flex。上一版对 row 做 flex-wrap、对两组做
      // flex:1 1 auto + justify-content:flex-end，导致 standardControls 被顶到
      // 第二行并与 trailing 重叠 —— 全部回滚，只保留控件尺寸与状态行横滑。
      '[data-composer-card] button{min-height:32px;}',
      // 注：dsh-switch-armor 的 20px 开关已在自己的 CSS 里用 !important 锁死尺寸
      // （见 ~/.dsh/plugins/dsh-switch-armor/client.js 的 .dsh-armor-switch），
      // 上面这条通用 min-height 不会再把它撑出胶囊，这里无需再写例外。
      // 换行后的两行重新排布（405px 实测：row 355 宽、wrap、justify:center，
      // tools 199 + trailing 200 各占一行且左右各空 78px，两组都「飘」在中间）。
      // 改成：第一行工具组贴左、第二行尾部组两端对齐（召唤靠左、发送靠右），
      // 两行从同一个左边缘起排，发送键固定在最右。
      '@media (max-width:480px){[data-composer-card] [class*="_row"]{justify-content:flex-start !important;}[data-composer-card] [class*="_row"] > [class*="_tools"]{flex:1 1 100% !important;}[data-composer-card] [class*="_row"] > [class*="_trailing"]{flex:1 1 100% !important;justify-content:space-between !important;margin-left:0 !important;}}',
      // 状态行（tok/s · 缓存 · 余额 · 百分比）：单行横滑，不换行、不裁切。
      '[data-composer-dock]{max-width:100% !important;overflow-x:auto !important;overflow-y:hidden !important;flex-wrap:nowrap !important;white-space:nowrap !important;scrollbar-width:none !important;-webkit-overflow-scrolling:touch;font-size:11px !important;}',
      '[data-composer-dock]::-webkit-scrollbar{display:none !important;}',
      '[data-composer-dock] > *{flex:none !important;}',
      // iOS 输入框 <16px 会触发聚焦缩放。
      '[data-composer-card] textarea,[data-composer-card] [contenteditable="true"],[data-composer-card] [data-composer-input]{font-size:16px !important;line-height:24px !important;}'
    ].join("\n"));

    // ─────────────────────────────────────────────────────────────
    // (4) 浮层：菜单 / 弹窗 / 设置面板
    //     实测：设置面板 .overlay 是 position:fixed、z-index 1000，被 portal 进
    //     sidebar DOM；抽屉 z-index 1200 会把它整块盖住（技能/模型页只剩右侧）。
    //     dialog 打开时把抽屉降级到 900，让设置/弹窗正常全屏。
    // ─────────────────────────────────────────────────────────────
    block([
      '[role="menu"]{max-width:calc(100vw - 16px) !important;max-height:min(72vh,560px) !important;overflow-y:auto !important;-webkit-overflow-scrolling:touch;}',
      '[role="listbox"]{max-width:calc(100vw - 16px) !important;max-height:min(60vh,420px) !important;overflow-y:auto !important;}',
      '[role="dialog"]{max-width:calc(100vw - 12px) !important;max-height:calc(100dvh - 12px) !important;}',
      '[role="dialog"][aria-modal="true"]{max-width:100vw !important;max-height:100dvh !important;border-radius:0 !important;}',
      // 实测：设置浮层（.overlay fixed / z-index 1000）挂在 body 上，抽屉
      // （z-index 1200）在 frame 里，同处 body 层叠上下文 → 抽屉压住设置。
      // 给 body 下的模态容器提层到 1300，并让设置面板真正占满一屏。
      'body > div:has(> [role="dialog"][aria-modal="true"]){z-index:1300 !important;}',
      'body > div:has(> [role="dialog"][aria-modal="true"]) > [role="dialog"][aria-modal="true"]{inset:0 !important;width:100vw !important;min-height:100dvh !important;max-width:100vw !important;max-height:100dvh !important;border-radius:0 !important;}',
      // 抽屉内的导航行触摸高度。
      '[data-mobile-nav="frame"] > :first-child [class*="_panelRow"]{min-height:40px !important;}',
      // 注：工作区「查看文件列表」按钮的窄屏尺寸、抽屉底部两个 footer entry 的
      // 展开态排版、产物行（dat-*）都已就地修在各自插件里（用户要求自研插件
      // 就地适配，不在本插件打补丁）。本文件只保留官方 UI 与第三方 npm 包的补丁。
      // 设置面板：官方窄屏布局是「导航宫格在上（实测 288px 高）+ 内容在下」，
      // 且导航 display 被官方 !important 规则锁成 grid，不改结构；
      // 只把导航区限高可滚，子页内容拿回首屏空间。
      // 设置页导航：桌面是网格，窄屏下网格比屏宽 → 第三列被切掉，官方项（通用/内置插件…）
      // 整列跑到屏幕外。强制按 3 等分、按行排、不再横向溢出；纵向交给弹层自己滚。
      '[role="dialog"][aria-modal="true"] nav{grid-auto-flow:row !important;grid-template-columns:repeat(3,minmax(0,1fr)) !important;max-height:none !important;overflow:visible !important;padding:6px 8px !important;}',
      '[role="dialog"][aria-modal="true"] nav > *{min-width:0 !important;}',
      // 只在空格处换行：anywhere 会把 CommandCode 拆成 CommandC/ode、把「账号与余额」拆开。
      '[role="dialog"][aria-modal="true"] nav *{white-space:normal !important;overflow-wrap:break-word !important;word-break:keep-all !important;hyphens:none !important;}',
      '[role="dialog"][aria-modal="true"] nav{gap:4px 6px !important;}',
      '[role="dialog"][aria-modal="true"] nav > *{align-items:flex-start !important;}',
      // 抽屉底部两个 footer entry 的展开态排版已在各插件里改为「只跟
      // [data-sidebar-collapsed] 走」（收起态图标、展开态整行文字），这里不再覆盖。
      // 「导出会话日志」是 pocket 注入的 drawer-actions 按钮，用户在 H5 上要求隐藏；
      // 同容器里只剩「文件浏览」（无工作区宿主时自身 display:none），所以整行也一起收掉。
      '[data-mobile-nav="frame"] button[aria-label="导出会话日志"]{display:none !important;}',
      '[data-mobile-nav="frame"] [data-mobile-nav="drawer-actions"][data-h5-empty="1"]{display:none !important;}',
      // footerActions 是 flex + wrap，三个 entry 的顺序由槽位注册顺序决定，默认会把
      // pocket 的「导出会话日志」夹在我们两个之间。用 order 重排：上下文洞察 +
      // 手机访问相邻（1、2），pocket 的 drawer-actions 沉到最底（3）。
      // 实测：.dcfe-entry 通过外层 display:contents 的 slot wrapper 提升成
      // footerActions 的直接 flex item（它自身 display:flex）；drawer-actions 是
      // inline-flex 生成的盒子；explorer 按钮宿主无 explorer 时 display:none。
      // 所以三者都能被 order 重排；再用 flex:0 0 100% 强制各自独占一行。
      // 取舍：DOM/Tab 顺序仍是 dcfe → drawer-actions → dspfe，视觉顺序相反，这是
      // 跨插件槽位重排的唯一低成本手段，不是 bug。
      '[data-mobile-nav="frame"] [class*="_footerActions"]{gap:0 !important;}',
      '[data-mobile-nav="frame"] [class*="_footerActions"] .dcfe-entry,[data-mobile-nav="frame"] [class*="_footerActions"] .dspfe-entry{margin:0 !important;}',
      '[data-mobile-nav="frame"] [class*="_footerActions"] .dcfe-entry{order:1 !important;flex:1 1 0 !important;min-width:0 !important;height:40px !important;min-height:40px !important;}',
      '[data-mobile-nav="frame"] [class*="_footerActions"] .dspfe-entry{order:2 !important;flex:1 1 0 !important;min-width:0 !important;height:40px !important;min-height:40px !important;}',
      '[data-mobile-nav="frame"] [class*="_footerActions"] [data-mobile-nav="drawer-actions"]{order:3 !important;flex:0 0 100% !important;width:100% !important;}'
    ].join("\n"));

    // ─────────────────────────────────────────────────────────────
    // (5) dsh-context：上下文面板（lc-* 是插件自有前缀，npm 包，升级会覆盖源码，
    //     所以窄屏适配留在这一层做补丁）
    // ─────────────────────────────────────────────────────────────
    block([
      '.lc-root{padding-left:12px !important;padding-right:12px !important;}',
      // 面板用 flex 行排卡片（lc-card flex-[3] / flex-1），窄屏改成单列堆叠。
      '.lc-cols,.lc-cols-main{flex-wrap:wrap !important;grid-template-columns:minmax(0,1fr) !important;}',
      '.lc-cols > *,.lc-cols-main > *{flex:1 1 100% !important;min-width:0 !important;max-width:100% !important;}',
      '.lc-stats,.lc-grid,.lc-grid-top,.lc-grid-mid{flex-wrap:wrap !important;grid-template-columns:minmax(0,1fr) !important;}',
      '.lc-col{min-width:0 !important;}',
      '.lc-chart-scroll{overflow-x:auto !important;-webkit-overflow-scrolling:touch;}'
    ].join("\n"));

    // ─────────────────────────────────────────────────────────────
    // (7) 右侧栏浮层面板（dsh-comfyui .dsc-panel = fixed z900，宽 402）
    //     窄屏贴边只留一条缝，改成整屏覆盖。
    // ─────────────────────────────────────────────────────────────
    block([
      '.dsc-panel{left:0 !important;right:0 !important;top:0 !important;bottom:0 !important;width:100vw !important;max-width:100vw !important;height:100dvh !important;max-height:100dvh !important;border-radius:0 !important;}',
      '.dsc-toolbar,.dsc-actions{flex-wrap:wrap !important;row-gap:6px !important;}',
      '.dsc-tabs{overflow-x:auto !important;scrollbar-width:none !important;}',
      '.dsc-tabs::-webkit-scrollbar{display:none !important;}'
    ].join("\n"));

    // ─────────────────────────────────────────────────────────────
    // (6) H5 交互修复（0.3.0，逐项在 415×923 实测）
    // ─────────────────────────────────────────────────────────────
    block([
      // (6.1) hero / 空白会话头：headerBlank 下 titleRow 是居中的，「打开右侧边栏」
      //   落在 headerCorner 里跟着被带到左边（实测 x=78）。钉到右上角。
      'header[class*="_headerBlank"]{position:relative !important;}',
      'header[class*="_headerBlank"] [class*="_headerCorner"]{position:absolute !important;right:10px !important;top:8px !important;left:auto !important;margin:0 !important;}',
      // (6.2) 抽屉浮动入口同理统一到右侧（pocket 原本 left:10，单手够不到）。
      '[data-mobile-nav="fab"]{left:auto !important;right:10px !important;}',
      // (6.3) 账号菜单等浮层是 body 下的 fixed 层、z=1100，抽屉 z=1200 会把它整块
      //   盖住 ——「点头像没反应」的真相是菜单开了但看不见。抬到 1215：
      //   压过抽屉，仍低于模态弹窗（1300），不会反过来盖住设置。
      'body > div[class*="_surface_"]{z-index:1215 !important;}',
      // (6.4) 会话行的「归档 / 置顶」只在 hover 时 display 出来，触屏永远够不到。
      //   常显操作位，但只留 28px 的「…」菜单键（261 宽的行里标题仍余 157px）。
      '[class*="_sessionRow"] [class*="_rowActions"]{display:inline-flex !important;width:auto !important;opacity:1 !important;overflow:visible !important;}',
      '[class*="_sessionRow"] [class*="_rowActions"] button[aria-label="归档会话"],[class*="_sessionRow"] [class*="_rowActions"] button[aria-label="置顶会话"]{display:none !important;}',
      '[class*="_sessionRow"] [class*="_rowActions"] button{width:30px !important;min-width:30px !important;height:30px !important;}'
    ].join("\n"));

    // ─────────────────────────────────────────────────────────────
    // (8) 元宝式 H5 壳 —— P1：输入区单行胶囊 + 「+」工具盘
    //   口径：不改功能，只重排入口。工具盘每行 = 转发一次 click 给原生控件。
    // ─────────────────────────────────────────────────────────────
    block([
      // 8.1 输入区：整卡变一颗大圆角胶囊，输入与按钮同一行。
      '[data-composer-seat]{padding-left:10px !important;padding-right:10px !important;}',
      // 上下也要 padding：只给左右时，带附件那条 flex 行会贴着卡片底边（下边距 0）
      // 输入区左右留白过大：卡片父级 _root 有 16px 横向内边距（卡片因此只剩 361 宽），收到 4px。
      // 输入框左右留白：父级横向内边距清零，卡片直接吃满（10/12，之前是 14/16）。
      'div:has(> [data-composer-card]){padding-left:0 !important;padding-right:0 !important;}',
      '[data-composer-card]{position:relative !important;display:flex !important;flex-direction:row !important;flex-wrap:wrap !important;align-items:center !important;align-content:center !important;min-height:52px !important;padding:8px !important;border-radius:26px !important;box-shadow:0 2px 10px rgba(0,0,0,.06) !important;}',
            '[data-composer-card] > [class*="_row"]{display:contents !important;}',
      '[data-composer-card] > [class*="_scroll"]{order:2 !important;flex:1 1 0 !important;width:auto !important;min-width:0 !important;padding:0 !important;max-height:132px !important;}',
      '[data-composer-card] [class*="_row"] > [class*="_tools"]{order:1 !important;flex:0 1 auto !important;gap:2px !important;min-width:0 !important;overflow-x:auto !important;scrollbar-width:none !important;}',
      '[data-composer-card] [class*="_row"] > [class*="_trailing"]{order:3 !important;flex:0 1 auto !important;gap:2px !important;min-width:0 !important;}',
      // 工具收进工具盘：只留左侧「添加文件」；模式胶囊 / 权限 / 开关 / 召唤 / 模型都藏起来。
      // 输入行只留「+」与发送：其它控件全部收进工具盘（1px 隐形锚点，保留布局与可点）
      '[data-composer-card] [class*="_tools"] > :not([data-h5-tray-btn]){position:absolute !important;left:8px !important;bottom:0 !important;width:1px !important;height:1px !important;overflow:hidden !important;opacity:0 !important;pointer-events:none !important;}',
      '[data-composer-card] [class*="_modes"],[data-composer-card] [class*="_modeSwitch"],[data-composer-card] [class*="_modePill"]{position:absolute !important;left:8px !important;bottom:0 !important;width:1px !important;height:1px !important;overflow:hidden !important;opacity:0 !important;pointer-events:none !important;}',
      // 再兜一层：卡片里除「输入滚动区 / 行 / overlayAnchor」之外的一切块都收掉；
      // 行里只留 tools（含我们的 +）与 trailing，trailing 里只留发送。
      '[data-composer-card] > :not([class*="_row"]):not([class*="_scroll"]):not([class*="_overlayAnchor"]):not([data-h5-tray-btn]):not([data-h5-send-btn]):not([class*="rail"]):not([class*="_attachment"]):not([data-slot="conversation.input.attachments"]){position:absolute !important;left:8px !important;bottom:0 !important;width:1px !important;height:1px !important;overflow:hidden !important;opacity:0 !important;pointer-events:none !important;}',
      '[data-composer-card] [class*="_row"] > :not([class*="_tools"]):not([class*="_trailing"]){position:absolute !important;left:8px !important;bottom:0 !important;width:1px !important;height:1px !important;overflow:hidden !important;opacity:0 !important;pointer-events:none !important;}',



      '[data-composer-card] > [class*="rail"],[data-composer-card] [class*="_rail"]{flex:1 1 100% !important;order:-1 !important;width:100% !important;height:auto !important;max-height:120px !important;overflow-x:auto !important;}',
      // 8.9 附件预览条（官方 conversation.input.attachments + AttachmentRail）原来被
      //     「收控件」规则连外壳一起压成 0×0：缩略图靠绝对定位逃出裁剪框所以看得见，
      //     但 pointer-events:none 被继承下去，缩略图与右上角 × 全都点不到。
      //     解法是只把 pointer-events 放行、保持两层外壳 display:contents（不生成盒子）：
      //     有附件时 rail 自己成为卡片的一条 flex 行（占满一整行、order:-1），
      //     没有附件时不占行 —— 否则空 slot 会多出一条 0 高度的 flex 行，配合 12px
      //     行距把输入行整体下顶 14px（上边距 17 / 下边距 3，就是「上下边距不一样」）。
      '[data-composer-card] > [data-slot="conversation.input.attachments"]{position:static !important;display:contents !important;opacity:1 !important;pointer-events:auto !important;}',
      '[data-composer-card] > [data-slot="conversation.input.attachments"] > *{display:contents !important;opacity:1 !important;pointer-events:auto !important;}',
      '[data-composer-card] [class*="_rail"],[data-composer-card] [class*="_rail"] *{pointer-events:auto !important;}',
      // 排队消息的拖拽：行上开着 touch-action:auto 时，浏览器判定成滚动就会取消指针流，
      // 表现就是「拖一点点就不跟着走」。这里把行内的触摸手势交给我们自己的拖拽逻辑。
      '[data-queue-dock] li,[data-queue-dock] [class*="_row"]{touch-action:none !important;-webkit-user-select:none !important;user-select:none !important;}',
      // 软键盘：页面不跟着缩时（Android 默认行为），用 visualViewport 的高度差把输入栈顶起来。
      // 如果 interactive-widget=resizes-content 生效，innerHeight 会一起变小 → kb=0，不重复位移。
      'html[data-h5-kb="1"] [class*="_composerStack"]{transform:translateY(calc(-1 * var(--h5-kb,0px))) !important;}',
      '[data-composer-card] [class*="_remove"]{opacity:1 !important;width:22px !important;height:22px !important;min-width:22px !important;min-height:22px !important;max-height:22px !important;top:2px !important;right:2px !important;padding:0 !important;border-radius:50% !important;line-height:1 !important;}',
      '[data-composer-card] [class*="_remove"] svg{width:12px !important;height:12px !important;}',
      '[data-composer-card] [data-h5-tray-btn]{position:static !important;opacity:1 !important;pointer-events:auto !important;order:-1 !important;}',
      // _trailing 不能整块 display:none，否则里面的模型触发器 rect=0，自研弹窗会算到屏幕外。
      // 保留它的布局（contents），只把发送区藏掉；模型 chip 由一个隐形定尺盒子承载。
      '[data-composer-card] [class*="_tools"]{display:none !important;}',
      '[data-composer-card] [class*="_trailing"]{display:contents !important;}',
      '[data-composer-card] [class*="_trailing"] [class*="_activity"]{display:none !important;}',
      // trailing 直接子 button 是原生发送/停止按钮：保留在 DOM 里（我们转发点击要用），
      // 但压成 1px 隐形，否则它会跟着 contents 摊到卡片左侧变成一个蓝圆。
      '[data-composer-card] [class*="_trailing"] > button{position:absolute !important;left:8px !important;bottom:0 !important;width:1px !important;height:1px !important;min-width:0 !important;min-height:0 !important;overflow:hidden !important;opacity:0 !important;pointer-events:none !important;}',
      // 隐形定位盒：left/bottom 决定原生弹窗弹在哪（弹窗底边 = 盒子上沿 - 8px）
      // 这个盒子里同时还渲染着模型弹窗本身（弹窗 position:fixed），所以盒子不能 opacity:0，
      // 否则弹窗跟着透明；只把触发器本体藏起来。
      // 这个盒子只用来给模型弹窗提供锚点，本身不能吃点击：它压在「+」上方，
      // 不加 pointer-events:none 会把「+」的点击吞掉（弹窗自己已单独恢复 auto）。
      '[data-composer-card] [class*="_standardControls"]{position:fixed !important;left:12px !important;bottom:60px !important;display:block !important;width:40px !important;height:36px !important;min-height:0 !important;opacity:1 !important;pointer-events:none !important;overflow:visible !important;z-index:1400 !important;}',
      '[data-composer-card] button[class*="dsh-codex-reasoning-effort-slider-trigger"]{width:40px !important;height:36px !important;opacity:0 !important;pointer-events:none !important;background:transparent !important;box-shadow:none !important;}',
      // 这个盒子里还塞着「召唤」按钮、额度胶囊等；只保留模型选择器那一支，
      // 其余全部隐藏，否则它们会跟着隐形盒子一起跑到输入框上。
      '[data-composer-card] [class*="_standardControls"] :is(button,span,div):not([class*="dsh-codex-reasoning-effort"]):not(:has([class*="dsh-codex-reasoning-effort"])){display:none !important;}',
      '[data-composer-card] [class*="dsh-codex-reasoning-effort-slider-popup"]{pointer-events:auto !important;}',
      '[data-h5-send-btn]{order:99 !important;margin-left:auto !important;flex:none;width:36px;height:36px;min-width:36px;display:grid;place-items:center;border:0;border-radius:50%;background:#4176e6;color:#fff;}',
      '[data-h5-send-btn][data-idle="1"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);}',
      '[data-h5-send-btn] svg{width:18px;height:18px;}',
            '[data-composer-card] [class*="_standardControls"]{display:flex !important;align-items:center !important;gap:2px !important;flex:none !important;}',
      // 召唤 / 工具箱 已收进工具盘与胶囊行，输入行里只留模型选择器（它是原生弹层，必须留在原位）
            // 单行输入
      // 输入区自适应高度：原来锁死 22px，长文本直接看不见；现在 22→132 之间自然撑高，
      // 超过后自身滚动，卡片跟着长。
      // 对齐（按 6 倍裁切图像素量的残差）：官方 _input 自带 4px 上内边距，文字因此比
      // 「+」/发送按钮低 3.2px；占位符是另画的一层，又比它们高 2px。取
      // line-height 20 + padding 0 后两层的墨迹中心分别是 -0.04 / +0.21px。
      '[data-composer-card] [class*="_input"],[data-composer-card] [class*="_scroll"] textarea{min-height:22px !important;max-height:132px !important;line-height:20px !important;padding:0 !important;}',
      '[data-composer-card] [class*="_primary"]{width:36px !important;height:36px !important;min-width:36px !important;border-radius:50% !important;}',
      // 8.2 工具盘：浮起圆角面板 + 遮罩
      // 输入区里的工具盘按钮（右侧大「+」）
                  // 8.4 输入区上方的能力胶囊行（元宝同款：图标 + 文字 + 竖分隔线）
      '[role="menu"],[data-menu-material]{z-index:1400 !important;position:fixed !important;left:12px !important;right:12px !important;top:auto !important;bottom:calc(12px + env(safe-area-inset-bottom,0px)) !important;width:auto !important;max-width:none !important;max-height:60dvh !important;overflow-y:auto !important;border-radius:20px !important;}',
      // 8.3 顶部栏：只留 ☰ + 标题 + 右侧 3 个（最近对话 / 更多操作 / 右侧边栏）。
      'header[class*="_header"] button[aria-label="智能体团队"]{display:none !important;}',
      'header[class*="_header"] [class*="_titleCluster"]{gap:2px !important;}',
      'header[class*="_header"] [class*="_headerUtilities"]{margin-left:auto !important;gap:6px !important;}',
      'header[class*="_header"] [class*="_headerCorner"]{margin-left:0 !important;}',
      // 抽屉恢复官方样式（不再改宽度/圆角/遮罩/过渡）
      // 8.8 工具盘：底部浮层（行点击转发给原生控件；能点开的才放进来）
      '[data-h5-tray]{position:fixed;inset:0;z-index:1400;display:none;}',
      '[data-h5-tray][data-open="1"]{display:block;}',
      '[data-h5-tray] .h5t-scrim{position:absolute;inset:0;background:rgba(0,0,0,.32);}',
      '[data-h5-tray] .h5t-sheet{position:absolute;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));padding:8px;border-radius:24px;background:color-mix(in srgb, var(--dsw-alias-bg-base, #ffffff) 97%, transparent);backdrop-filter:blur(30px) saturate(1.4);box-shadow:0 16px 48px rgba(0,0,0,.2);animation:h5t-pop .18s cubic-bezier(.32,.72,.35,1);}',
      '@keyframes h5t-pop{from{opacity:0;transform:translateY(12px) scale(.98);}to{opacity:1;transform:none;}}',
      '[data-h5-tray] .h5t-row{display:flex;align-items:center;gap:12px;width:100%;height:56px;padding:0 10px;border:0;border-radius:16px;background:transparent;color:var(--dsw-alias-label-primary);font-size:16px;line-height:1;text-align:left;}',
      '[data-h5-tray] .h5t-row:active{background:var(--dsw-alias-interactive-bg-hover);}',
      '[data-h5-tray] .h5t-ico{width:40px;height:40px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--dsw-alias-bg-layer-2);}',
      '[data-h5-tray] .h5t-ico svg{width:20px;height:20px;}',
      '[data-h5-tray] .h5t-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '[data-h5-tray-btn]{flex:none;width:32px;height:32px;min-width:32px;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;color:var(--dsw-alias-label-primary);}',
      '[data-h5-tray-btn] svg{width:20px;height:20px;}',
      '[data-h5-tray-btn]:active{background:var(--dsw-alias-interactive-bg-hover);}',
      // 触控热区：图标仍 32×32，用透明光晕把可点范围扩到 44×44（手指友好）。
      '[data-composer-card] [data-h5-tray-btn]{position:relative !important;}',
      '[data-composer-card] [data-h5-tray-btn]::after{content:"";position:absolute;left:-6px;top:-6px;right:-6px;bottom:-6px;border-radius:50%;}',
      // 召唤 / 工具箱 / 添加文件 收进工具盘：用 1px 隐形锚点而不是 display:none
      // （它们要读按钮 rect 来定位自己的面板，display:none 后 rect 为 0 就打不开）
      '[data-composer-card] .wbsum-btn,[data-composer-card] .dtb-btn,[data-composer-card] button[aria-label="添加文件或调用指令"]{position:absolute !important;left:8px !important;bottom:0 !important;width:1px !important;height:1px !important;overflow:hidden !important;opacity:0 !important;pointer-events:none !important;}',
      // 8.7 输入框文字贴左：去掉输入区自带左内边距，占位与正文都从按钮右侧起排
      '[data-composer-card] [class*="_scroll"],[data-composer-card] [class*="_grow"]{padding-left:0 !important;text-align:left !important;justify-content:flex-start !important;}',
      '[data-composer-card] [class*="_input"]{padding-left:0 !important;padding-right:0 !important;text-align:left !important;}',
      // 占位符与输入区垂直对齐：原生 placeholder 是 absolute;top:4px;line-height:24px，
      // 比输入行中心低 5px（实测 placeholder 中心 38、输入/+/发送都 33），看着就是「歪」。
      '[data-composer-card] [class*="_placeholder"]{left:0 !important;top:0 !important;height:22px !important;line-height:22px !important;text-align:left !important;}',
      // 8.6 顶部精修：压成一条 44px 的栏；标题贴近 ☰；右侧图标统一 28px；tabs 变分段胶囊。
      'header[class*="_header"]{padding:8px 10px 0 !important;height:auto !important;min-height:0 !important;max-height:none !important;}',
      '[data-phase] header[class*="_header"]{height:auto !important;min-height:0 !important;max-height:none !important;overflow:visible !important;}',
      'header[class*="_header"]:has([class*="_tabs"]){min-height:78px !important;}',
      'header[class*="_header"] [class*="_titleRow"]{min-height:30px !important;padding-inline-start:0 !important;margin-left:-34px !important;gap:2px !important;align-items:center !important;}',
      '[data-phase] header[class*="_header"] > :first-child,header[class*="_header"] > :first-child{padding-left:36px !important;margin-left:0 !important;}',
      'header[class*="_header"] [class*="_titleCluster"]{padding-left:0 !important;gap:2px !important;min-width:0 !important;}',
      'header[class*="_header"] [class*="_crumbs"]{font-size:16px !important;font-weight:600 !important;line-height:22px !important;max-width:52vw !important;overflow:hidden !important;text-overflow:ellipsis !important;white-space:nowrap !important;}',
      'header[class*="_header"] button:not([role="tab"]){width:28px !important;height:28px !important;min-width:28px !important;border-radius:8px !important;}',
      // 8.8 tabs 曾被上面那条 28px 方按钮规则命中：每个 tab 被压成 28px 宽，
      //     两字标题硬折行、再被 32px 高裁掉（这就是「顶部还是不对」）。
      //     tabs 必须是内容定宽、单行、超出横向滚动。
      'header[class*="_header"] [class*="_tabs"]{gap:20px !important;padding-left:2px !important;margin-top:2px !important;overflow-x:auto !important;overflow-y:hidden !important;white-space:nowrap !important;scrollbar-width:none !important;}',
      'header[class*="_header"] [class*="_tabs"]::-webkit-scrollbar{display:none !important;}',
      'header[class*="_header"] button[role="tab"]{width:auto !important;min-width:0 !important;height:auto !important;flex:none !important;padding:2px 0 8px !important;border-radius:0 !important;font-size:14px !important;line-height:20px !important;white-space:nowrap !important;}',
      // 运行状态胶囊（"N 个后台任务运行中" / "N 个子智能体运行中"）被 28px 规则压成
      // 一根竖线，正是手机截图里标题后面那条「|」；信息在抽屉会话行里已有 → 隐藏。
      'header[class*="_header"] button[aria-label*="运行中"]{display:none !important;}',
      'header[class*="_header"] button[aria-label$="个子智能体"]{display:none !important;}',
      // 最近对话与抽屉的会话历史重复：元宝顶部只有 ☰ + 标题 + ⋯
      'header[class*="_header"] button[aria-label="最近对话"]{display:none !important;}',
      'header[class*="_header"] [class*="_headerUtilities"]{gap:4px !important;margin-right:0 !important;}',
      'header[class*="_header"] [class*="_headerCorner"]{margin-right:0 !important;}',
      // 「最近对话」隐藏后，它前面的竖分隔线成了孤儿（手机截图里标题后那根细竖线）
      'header[class*="_header"] [class*="_split"]{display:none !important;}',
      // 手机没有物理键盘：右栏与抽屉里的 ⌥⌘ 快捷键提示全部收掉
      'html[data-h5-adapter="on"] kbd{display:none !important;}',
      '[class*="_shortcut"]{display:none !important;}',
      // 模型面板：48 个模型若不限高会拉成 2704px 直接跑出屏幕（实测 sheet y=-1793）
      '[data-h5-tray] .h5t-sheet[data-h5-sheet-mode="model"]{max-height:min(72vh,620px) !important;overflow-y:auto !important;overscroll-behavior:contain !important;-webkit-overflow-scrolling:touch;}',
      '[data-h5-tray] .h5t-sheet[data-h5-sheet-mode="model"] .h5t-row{height:52px !important;}',
      '[data-h5-tray] .h5t-group{position:sticky;top:0;z-index:1;padding:10px 12px 6px;font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--dsw-alias-label-tertiary);background:color-mix(in srgb, var(--dsw-alias-bg-base,#fff) 94%, transparent);backdrop-filter:blur(12px);}',
      '[data-h5-tray] .h5t-row[data-selected="1"]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 8%, transparent);}',
      '[data-h5-tray] .h5t-row[data-selected="1"] .h5t-label{font-weight:600;color:var(--dsw-alias-state-business-primary,#4176e6);}',
      '[data-h5-tray] .h5t-row[data-selected="1"] .h5t-ico{color:var(--dsw-alias-state-business-primary,#4176e6);}',
                            ].join("\n"));

    function ensureStyle() {
      var style = document.getElementById(STYLE_ID);
      if (style === null) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        style.setAttribute("data-plugin", "dsh-h5-adapter");
        style.setAttribute("data-h5-adapter-version", VERSION);
        document.head.appendChild(style);
      }
      var text = css.join("\n");
      if (style.textContent !== text) style.textContent = text;
    }

    function applyModeAttribute() {
      try {
        document.documentElement.setAttribute("data-h5-adapter", "on");
        document.documentElement.setAttribute("data-h5-adapter-version", VERSION);
      } catch (e) {}
    }

    // 文件/补丁卡片里的「复制」是带文字的按钮（有的卡片让它独占一行）。
    // 纯 CSS 无法按文本选元素，这里给 textContent==='复制' 的 button 打标记，
    // 再由样式把它们压成 24px 高、12px 字的紧凑按钮。
    var copyMarkTimer = null;
    function markCopyButtons() {
      var btns = document.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        if (b.getAttribute("data-h5-copy") === "1") continue;
        if (b.textContent !== null && b.textContent.trim() === "复制") {
          b.setAttribute("data-h5-copy", "1");
        }
      }
    }
    // 顶部下拉菜单（MenuSurface，[data-menu-material]）在手机上从 header 按钮
    // 向下展开时会压住 tab 栏（实测 405×880：菜单 rect 213,46,150×68，
    // tabs rect 12,46,381×32，y 区间重叠且菜单 z=100 > tabs z=1）。
    // 命中链证明菜单渲染在 header DOM 内（menuitem → _viewport →
    // _surface[data-menu-material] → _root → headerUtilities），所以给菜单根
    // 加 margin-top 会带着整块下移。只处理一次并打标记，用实测 rect.top 算
    // delta（不硬编码 header 布局）；rect.top<=0 视为尚未完成定位，跳过。
    var MENU_MIN_TOP = 82;
    function fixTopMenus() {
      if (window.innerWidth > 1023) return;
      var nodes = document.querySelectorAll("[data-menu-material]");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.getAttribute("data-h5-menu") !== null) continue;
        var r = el.getBoundingClientRect();
        if (r.top <= 0 || r.height < 20) continue;
        if (r.top >= MENU_MIN_TOP) {
          el.setAttribute("data-h5-menu", "0");
          continue;
        }
        var delta = MENU_MIN_TOP - r.top;
        el.style.setProperty("margin-top", delta + "px", "important");
        el.setAttribute("data-h5-menu", String(delta));
      }
    }

    function watchCopyButtons() {
      markCopyButtons();
      try { fixTopMenus(); } catch (e) {}
      if (typeof MutationObserver === "undefined") return;
      var mo = new MutationObserver(function () {
        if (copyMarkTimer !== null) return;
        copyMarkTimer = setTimeout(function () {
          copyMarkTimer = null;
          markCopyButtons();
          try { fixTopMenus(); } catch (e) {}
        }, 250);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    // ─────────────────────────────────────────────────────────────
    // 返回手势：抽屉 / 模态弹窗进历史栈
    // 实测（CDP）：抽屉与设置弹窗都不 pushState，Android 返回（含侧滑）会直接
    // 离开应用。做法：打开时压一条历史项，popstate 关掉对应浮层；用户从 UI
    // 关闭时用 history.back() 把这条历史消耗掉，栈里不留半成品。
    // 实测序列：开抽屉 5→6、back 后抽屉关且仍停在 /；连开关 3 次栈不漂；
    // 抽屉 + 设置双层时 back 先关弹窗、再 back 关抽屉。
    // ─────────────────────────────────────────────────────────────
    var backStack = [];
    var backConsuming = false;
    // 会话导航：用官方 DOM 标记 [data-conversation-session] 记当前会话
    // （ConversationContent.tsx:194 `data-conversation-session={sessionId}`），
    // 切换时写历史，返回时用 uiWorkspace.openSession 恢复。
    var sessionCurrent = null;
    var sessionSuppress = false;
    var sessionCtx = null;

    function h5Frame() {
      return document.querySelector('[data-mobile-nav="frame"]');
    }

    function h5DrawerOpen() {
      var f = h5Frame();
      return f !== null && !f.hasAttribute("data-sidebar-collapsed");
    }

    function h5Dialog() {
      return document.querySelector('[role="dialog"][aria-modal="true"]');
    }

    function h5CloseDrawer() {
      var overlay = document.querySelector('[class*="_overlayLayer"]');
      if (overlay !== null && overlay.getBoundingClientRect().width > 0) {
        overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return;
      }
      var toggle = document.querySelector('[data-mobile-nav="toggle"]');
      if (toggle !== null) toggle.click();
    }

    function h5CloseDialog() {
      if (h5Dialog() === null) return;
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
    }

    function h5Push(kind) {
      try { history.pushState({ __h5: kind }, ""); backStack.push(kind); } catch (e) {}
    }

    function h5Drop(kind) {
      if (backStack.length === 0) return;
      if (backStack[backStack.length - 1] !== kind) return;
      backStack.pop();
      backConsuming = true;
      try { history.back(); } catch (e) { backConsuming = false; }
    }

    function h5CurrentSession() {
      var el = document.querySelector("[data-conversation-session]");
      return el === null ? null : el.getAttribute("data-conversation-session");
    }

    // 恢复会话：优先走官方服务 uiWorkspace.openSession（SessionTarget = SessionId | SubagentAddress，
    // 运行时就是字符串），服务不在时兜底点同 id 的侧栏行。
    function h5OpenSessionById(ctx, id) {
      var ws = null;
      try { ws = ctx !== null && typeof ctx.get === "function" ? ctx.get("uiWorkspace") : null; } catch (e) {}
      if (ws === null && ctx !== null) ws = ctx.uiWorkspace || null;
      if (ws !== null && typeof ws.openSession === "function") {
        try { ws.openSession(id); return true; } catch (e) {}
      }
      var row = document.querySelector('[data-row-key="session:' + id + '"]');
      if (row !== null) { row.click(); return true; }
      return false;
    }

    function h5RestoreSession(ev) {
      var state = ev === undefined || ev === null ? null : ev.state;
      var id = state !== null && typeof state === "object" && typeof state.__h5s === "string" ? state.__h5s : null;
      if (id === null || id === sessionCurrent) return;
      if (h5OpenSessionById(sessionCtx, id)) sessionSuppress = true;
    }

    // 切会话时把「当前会话」写进历史：首次 replaceState 占位，之后每次变化 pushState。
    // 恢复动作本身会改 DOM，用 suppress 一次性跳过，避免多压一条。
    function installSessionHistory(ctx) {
      sessionCtx = ctx;

      function sync() {
        var id = h5CurrentSession();
        if (id === null || id === "") return;
        if (id === sessionCurrent) return;
        var first = sessionCurrent === null;
        sessionCurrent = id;
        if (first) {
          try { history.replaceState({ __h5s: id }, ""); } catch (e) {}
          return;
        }
        if (sessionSuppress) { sessionSuppress = false; return; }
        try { history.pushState({ __h5s: id }, ""); } catch (e) {}
      }

      var timer = setInterval(sync, 400);
      sync();
      return function () { clearInterval(timer); };
    }

    function installBackStack() {
      var lastDrawer = null;
      var lastDialog = false;
      var attached = null;
      var observer = null;

      function syncDrawer() {
        var open = h5DrawerOpen();
        if (open === lastDrawer) return;
        lastDrawer = open;
        if (open) h5Push("drawer");
        else h5Drop("drawer");
      }

      function syncDialog() {
        var open = h5Dialog() !== null;
        if (open === lastDialog) return;
        lastDialog = open;
        if (open) h5Push("dialog");
        else h5Drop("dialog");
      }

      function attach() {
        var frame = h5Frame();
        if (frame !== null && frame !== attached) {
          if (observer !== null) observer.disconnect();
          attached = frame;
          observer = new MutationObserver(syncDrawer);
          observer.observe(frame, { attributes: true, attributeFilter: ["data-sidebar-collapsed"] });
          lastDrawer = null;
          syncDrawer();
        }
        syncDialog();
      }

      window.addEventListener("popstate", function (ev) {
        if (backConsuming) { backConsuming = false; return; }
        // 浮层优先：抽屉 / 弹窗先关，再回退会话
        if (backStack.length > 0) {
          var kind = backStack.pop();
          if (kind === "drawer") h5CloseDrawer();
          else if (kind === "dialog") h5CloseDialog();
          return;
        }
        h5RestoreSession(ev);
      });

      attach();
      var timer = setInterval(attach, 500);
      return function () { clearInterval(timer); if (observer !== null) observer.disconnect(); };
    }

    var trayRoot = null;

    var H5_ICONS = {
      plus: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
      spark: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l2.1 6 6.4.4-5 4 1.6 6.2L12 16.1 6.9 19.6 8.5 13.4l-5-4 6.4-.4z"/></svg>',
      box: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 8h16v11H4z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>',
      shield: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/></svg>',
      model: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l8 9-8 9-8-9z"/></svg>',
      check: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>'
    };

    // 注入按钮的两态图标：上传箭头 / 停止方块（与官方 aria 停止生成 对应）
    var H5_SEND_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    var H5_STOP_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor"/></svg>';

    // 模型入口：取输入行里的模型 chip（aria 是模型名），它的 click 实测能打开选择面板
    function h5FindModelChip() {
      // 输入行被整体隐藏后 rect 为 0，不能再用宽度筛；按容器定位模型 chip
      var inBar = document.querySelector('[class*="_standardControls"] [class*="dsh-codex-reasoning-effort"]');
      if (inBar !== null && inBar.tagName === "BUTTON") return inBar;
      var list = document.querySelectorAll('[class*="dsh-codex-reasoning-effort"]');
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        if (el.tagName !== "BUTTON") continue;
        var aria = el.getAttribute("aria-label") || "";
        if (aria === "" || aria === "切换模型" || aria === "返回" || aria === "重置为默认") continue;
        return el;
      }
      return null;
    }

    // 只收录「点一下确实能打开东西」的入口（逐条实测过）
    function h5TrayItems() {
      return [
        { icon: H5_ICONS.plus, label: "添加文件 / 指令", find: function () { return document.querySelector('button[aria-label="添加文件或调用指令"]'); } },
        { icon: H5_ICONS.spark, label: "召唤专家", find: function () { return document.querySelector(".wbsum-btn"); } },
        { icon: H5_ICONS.box, label: "工具箱", find: function () { return document.querySelector(".dtb-btn"); } },
        { icon: H5_ICONS.model, label: "模型", find: h5FindModelChip, isModel: true },
        { icon: H5_ICONS.shield, label: "权限模式", find: function () { return document.querySelector('button[aria-label^="访问模式"]'); } }
      ];
    }

    function h5CloseTray() {
      if (trayRoot === null) return;
      trayRoot.setAttribute("data-open", "0");
      var s = trayRoot.querySelector(".h5t-sheet");
      if (s !== null) s.removeAttribute("data-h5-sheet-mode");
    }

    function h5OpenTray() {
      if (trayRoot === null) return;
      var sheet = trayRoot.querySelector(".h5t-sheet");
      if (sheet === null) return;
      sheet.removeAttribute("data-h5-sheet-mode");
      while (sheet.firstChild !== null) sheet.removeChild(sheet.firstChild);
      var items = h5TrayItems();
      for (var i = 0; i < items.length; i++) {
        var target = null;
        if (items[i].sheet === undefined) {
          try { target = items[i].find(); } catch (e) { target = null; }
          if (target === null) continue;
        }
        var row = document.createElement("button");
        row.type = "button";
        row.className = "h5t-row";
        var ico = document.createElement("span");
        ico.className = "h5t-ico";
        ico.innerHTML = items[i].icon;
        var label = document.createElement("span");
        label.className = "h5t-label";
        label.textContent = items[i].label;
        row.appendChild(ico);
        row.appendChild(label);
        (function (item) {
          row.addEventListener("click", function () {
            h5CloseTray();
            // 点的时候重新查一次控件：React 重渲染会把开面板那一刻拿到的节点换掉，
            // 拿着旧引用去 click 会打在已脱离文档的节点上（点了没反应）。
            setTimeout(function () {
              try {
                var el = item.find();
                if (el !== null) el.click();
              } catch (e) {}
              // 模型：原生弹窗先落在「力度滑杆」，再点一下 model-link 切到模型列表，
              // 这样点「模型」看到的就是模型清单（供应商分组 + 当前选中）。
              if (item.isModel === true) {
                setTimeout(function () {
                  var link = document.querySelector('[class*="dsh-codex-reasoning-effort-slider-model-link"]');
                  if (link !== null) { try { link.click(); } catch (e) {} }
                }, 320);
              }
            }, 150);
          });
        })(items[i]);
        sheet.appendChild(row);
      }
      if (sheet.childElementCount === 0) return;
      trayRoot.setAttribute("data-open", "1");
    }

    // 模型选择完全交给自研的 dsh-codex-effort-slider（它自己算弹窗位置：
    // bottom = innerHeight - trigger.top + 8）。这里只负责点它的触发器，
    // 并保证触发器有一个真实矩形（见 CSS：_standardControls 固定成一个隐形盒子），
    // 否则 trigger rect 为 0 → 弹窗算到屏幕外。

    function h5H5Width() {
      try { return window.matchMedia("(max-width:1023px)").matches; } catch (e) { return false; }
    }

    function h5RemoveTray() {
      var old = document.querySelectorAll("[data-h5-tray-btn],[data-h5-send-btn],[data-h5-tray]");
      for (var i = 0; i < old.length; i++) {
        if (old[i].parentNode !== null) old[i].parentNode.removeChild(old[i]);
      }
      trayRoot = null;
    }

    function h5EnsureTray() {
      if (!h5H5Width()) { h5RemoveTray(); return; }
      if (trayRoot === null) {
        trayRoot = document.createElement("div");
        trayRoot.setAttribute("data-h5-tray", "");
        trayRoot.setAttribute("data-open", "0");
        var scrim = document.createElement("div");
        scrim.className = "h5t-scrim";
        scrim.addEventListener("click", h5CloseTray);
        var sheet = document.createElement("div");
        sheet.className = "h5t-sheet";
        trayRoot.appendChild(scrim);
        trayRoot.appendChild(sheet);
        document.body.appendChild(trayRoot);
        window.addEventListener("keydown", function (ev) {
          if (ev.key === "Escape") h5CloseTray();
        });
      }
      var card = document.querySelector("[data-composer-card]");
      var scroll = card === null ? null : card.querySelector('[class*="_scroll"]');
      if (card === null || scroll === null) return;
      if (card.querySelector("[data-h5-tray-btn]") === null) {
        var open = document.createElement("button");
        open.type = "button";
        open.setAttribute("data-h5-tray-btn", "");
        open.setAttribute("aria-label", "工具");
        open.innerHTML = H5_ICONS.plus;
        open.addEventListener("click", h5OpenTray);
        card.insertBefore(open, scroll);
      }
      if (card.querySelector("[data-h5-send-btn]") === null) {
        var send = document.createElement("button");
        send.type = "button";
        send.setAttribute("data-h5-send-btn", "");
        send.setAttribute("aria-label", "发送消息");
        send.innerHTML = H5_SEND_ICON;
        // 对齐官方 keepFocus：不抢编辑器焦点（否则点一下键盘会收起、布局跳动）
        send.addEventListener("mousedown", function (ev) { ev.preventDefault(); });
        send.addEventListener("click", function () {
          // 官方的 ._primary 在 发送/插话/排队/停止 之间换 aria，不能按文案查。
          // 每次点击都重新解析一次，绕开 React 换节点与竞态。
          var native = h5ResolveNative(card);
          if (native === null || native.disabled) return;
          try { native.click(); } catch (e) {}
          setTimeout(h5SyncSend, 120);
        });
        card.appendChild(send);
      }
      h5SyncSend();
      h5FixPlaceholder();
      h5TrimDrawerRow();
      h5FixViewportMeta();
    }

    // 抽屉底部 drawer-actions 那行：导出会话日志被隐藏后，若一个可见按钮都不剩，
    // 整行收掉，避免留一段空白。文件浏览出现时自动恢复。
    function h5TrimDrawerRow() {
      var wrap = document.querySelector('[data-mobile-nav="drawer-actions"]');
      if (wrap === null) return;
      var visible = false;
      for (var i = 0; i < wrap.children.length; i++) {
        var r = wrap.children[i].getBoundingClientRect();
        if (r.width > 1 && r.height > 1) { visible = true; break; }
      }
      var flag = visible ? "0" : "1";
      if (wrap.getAttribute("data-h5-empty") !== flag) wrap.setAttribute("data-h5-empty", flag);
      // 底部 footer 行间距：官方容器带 6px gap，CSS 覆盖不掉（被别的层压着），
      // 直接写内联 !important —— 每 800ms 巡检会补回。
      var footer = document.querySelector('#root [class*="_footerActions"]');
      if (footer !== null && footer.style.getPropertyValue("gap") !== "6px") {
        footer.style.setProperty("gap", "6px", "important");
      }
    }

    // 手机没有 Cmd/Ctrl：官方「Cmd/Ctrl+Enter 插话发送全部排队消息」的占位文案
    // 在触屏上无意义，改写成「回车 …」。React 重渲染会还原，所以跟着 800ms 轮询跑。
    function h5FixPlaceholder() {
      var ph = document.querySelector('[data-composer-card] [class*="_placeholder"]');
      if (ph === null) return;
      var t = ph.textContent || "";
      if (t.indexOf("Cmd/Ctrl+Enter") === -1 && t.indexOf("Ctrl+Enter") === -1 && t.indexOf("\u2318+Enter") === -1) return;
      var next = t.replace("Cmd/Ctrl+Enter", "\u56DE\u8F66").replace("Ctrl+Enter", "\u56DE\u8F66").replace("\u2318+Enter", "\u56DE\u8F66");
      if (next !== t) ph.textContent = next;
    }

    // trailing 的直接子 button 才是输入行的动作按钮：可续子会话运行时会多出一个
    // 独立停止按钮，主按钮永远排在最后（InputBar.tsx:481-516）。
    function h5TrailingButtons(card) {
      if (card === null) return [];
      var trailing = card.querySelector('[class*="_trailing"]');
      var out = [];
      if (trailing !== null) {
        for (var i = 0; i < trailing.children.length; i++) {
          if (trailing.children[i].tagName === "BUTTON") out.push(trailing.children[i]);
        }
      }
      if (out.length === 0) {
        var loose = card.querySelectorAll('[class*="_activity"] button, button[class*="_primary"]');
        for (var j = 0; j < loose.length; j++) {
          if (loose[j].getAttribute("aria-label") !== null) out.push(loose[j]);
        }
      }
      return out;
    }

    // 可操作优先：主按钮能用就用主按钮；主按钮禁用但有独立停止可用则用停止
    function h5ResolveNative(card) {
      var btns = h5TrailingButtons(card);
      var primary = btns.length > 0 ? btns[btns.length - 1] : null;
      var stop = btns.length > 1 ? btns[0] : null;
      if (primary !== null && !primary.disabled) return primary;
      if (stop !== null && !stop.disabled) return stop;
      return primary !== null ? primary : stop;
    }

    // 停止态用图标结构判断（停止是 <rect>，发送是 <path>），与界面语言无关
    function h5IsStopButton(btn) {
      if (btn === null) return false;
      return btn.querySelector("svg rect") !== null;
    }

    // 把原生按钮的状态（停止/发送、可点/禁用）镜像到注入按钮上。
    // 每 800ms 的 h5EnsureTray 里跑一次，状态没变就直接 return，不碰 DOM。
    function h5SyncSend() {
      var btn = document.querySelector("[data-h5-send-btn]");
      if (btn === null) return;
      var card = btn.closest("[data-composer-card]");
      var native = h5ResolveNative(card);
      var stopMode = h5IsStopButton(native);
      var disabled = native === null || native.disabled;
      var key = (stopMode ? "stop" : "send") + (disabled ? ":off" : ":on");
      if (btn.getAttribute("data-h5-send-mode") === key) return;
      btn.setAttribute("data-h5-send-mode", key);
      btn.setAttribute("data-idle", disabled ? "1" : "0");
      btn.setAttribute("aria-disabled", disabled ? "true" : "false");
      btn.setAttribute("aria-label", native === null ? "发送消息" : (native.getAttribute("aria-label") || "发送消息"));
      btn.innerHTML = stopMode ? H5_STOP_ICON : H5_SEND_ICON;
    }

    // 软键盘：先给 viewport meta 补 interactive-widget=resizes-content（Chrome 108+），
    // 再用 visualViewport 兜底：键盘压住多少就把输入栈抬起多少。
    // pocket 的 HTML 注入会在我们之后重写 viewport meta，所以这条要反复补。
    function h5FixViewportMeta() {
      try {
        var meta = document.querySelector('meta[name="viewport"]');
        if (meta === null) return;
        var content = meta.getAttribute("content") || "";
        if (content.indexOf("interactive-widget") !== -1) return;
        meta.setAttribute("content", content + ",interactive-widget=resizes-content");
      } catch (e) {}
    }

    function installViewportFix() {
      h5FixViewportMeta();
      var vv = window.visualViewport;
      if (vv === undefined || vv === null) return;
      function apply() {
        var kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
        document.documentElement.style.setProperty("--h5-kb", kb + "px");
        if (kb > 60) document.documentElement.setAttribute("data-h5-kb", "1");
        else document.documentElement.removeAttribute("data-h5-kb");
      }
      vv.addEventListener("resize", apply);
      vv.addEventListener("scroll", apply);
      apply();
    }

    function installToolTray() {
      h5EnsureTray();
      setInterval(h5EnsureTray, 800);
    }

    exports.name = "dsh-h5-adapter";
    exports.inject = [];
    exports.apply = function (ctx) {
      ensureStyle();
      applyModeAttribute();
      try { watchCopyButtons(); } catch (e) {}
      try { installBackStack(); } catch (e) {}
      try { installViewportFix(); } catch (e) {}
      try { installToolTray(); } catch (e) {}
      try { installSessionHistory(ctx === undefined ? null : ctx); } catch (e) {}
      console.log("[dsh-h5-adapter] client half mounted v" + VERSION);
    };
    return module.exports;
  }
});
