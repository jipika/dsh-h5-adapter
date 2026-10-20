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
    var VERSION = "0.3.0";
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
      'button[data-h5-copy="1"]{height:24px !important;min-height:24px !important;padding:0 8px !important;font-size:12px !important;line-height:22px !important;border-radius:8px !important;}'
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
      '[role="dialog"][aria-modal="true"] > nav{max-height:150px !important;overflow-y:auto !important;padding:6px 8px !important;height:auto !important;min-height:0 !important;scrollbar-width:none !important;}',
      // 抽屉底部两个 footer entry 的展开态排版已在各插件里改为「只跟
      // [data-sidebar-collapsed] 走」（收起态图标、展开态整行文字），这里不再覆盖。
      // 「导出会话日志」是 pocket 注入的 drawer-actions 按钮，官方居中；和两个
      // 左对齐的 entry 并排时统一成左对齐 + 同样的 40px 高度。
      '[data-mobile-nav="frame"] button[aria-label="导出会话日志"]{justify-content:flex-start !important;gap:8px !important;padding:0 10px !important;height:40px !important;border-radius:10px !important;width:100% !important;}',
      // footerActions 是 flex + wrap，三个 entry 的顺序由槽位注册顺序决定，默认会把
      // pocket 的「导出会话日志」夹在我们两个之间。用 order 重排：上下文洞察 +
      // 手机访问相邻（1、2），pocket 的 drawer-actions 沉到最底（3）。
      // 实测：.dcfe-entry 通过外层 display:contents 的 slot wrapper 提升成
      // footerActions 的直接 flex item（它自身 display:flex）；drawer-actions 是
      // inline-flex 生成的盒子；explorer 按钮宿主无 explorer 时 display:none。
      // 所以三者都能被 order 重排；再用 flex:0 0 100% 强制各自独占一行。
      // 取舍：DOM/Tab 顺序仍是 dcfe → drawer-actions → dspfe，视觉顺序相反，这是
      // 跨插件槽位重排的唯一低成本手段，不是 bug。
      '[data-mobile-nav="frame"] [class*="_footerActions"] .dcfe-entry{order:1 !important;flex:0 0 100% !important;}',
      '[data-mobile-nav="frame"] [class*="_footerActions"] .dspfe-entry{order:2 !important;flex:0 0 100% !important;}',
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

      window.addEventListener("popstate", function () {
        if (backConsuming) { backConsuming = false; return; }
        var kind = backStack.pop();
        if (kind === "drawer") h5CloseDrawer();
        else if (kind === "dialog") h5CloseDialog();
      });

      attach();
      var timer = setInterval(attach, 500);
      return function () { clearInterval(timer); if (observer !== null) observer.disconnect(); };
    }

    exports.name = "dsh-h5-adapter";
    exports.inject = [];
    exports.apply = function () {
      ensureStyle();
      applyModeAttribute();
      try { watchCopyButtons(); } catch (e) {}
      try { installBackStack(); } catch (e) {}
      console.log("[dsh-h5-adapter] client half mounted v" + VERSION);
    };
    return module.exports;
  }
});
