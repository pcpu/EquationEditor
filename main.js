import katex from "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.mjs";

const mathfield = document.getElementById("formulaField");
const latexInput = document.getElementById("latexInput");
const katexPreview = document.getElementById("katexPreview");
const statusEl = document.getElementById("status");
const toggleKeyboardBtn = document.getElementById("toggleKeyboardBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const clearBtn = document.getElementById("clearBtn");
const importLatexBtn = document.getElementById("importLatexBtn");
const exportLatexBtn = document.getElementById("exportLatexBtn");
const copyLatexBtn = document.getElementById("copyLatexBtn");
const symbolToolbar = document.getElementById("symbolToolbar");

/**
 * 设置状态栏文字，给用户提供即时反馈。
 * @param {string} message
 */
function setStatus(message) {
  statusEl.textContent = message;
}

/**
 * 使用 KaTeX 渲染预览；如果语法错误则显示错误信息。
 * @param {string} latex
 */
function renderPreview(latex) {
  if (!latex.trim()) {
    katexPreview.innerHTML = "<em>预览区域（为空）</em>";
    return;
  }

  try {
    katex.render(latex, katexPreview, {
      throwOnError: true,
      displayMode: true,
      strict: "warn"
    });
  } catch (error) {
    katexPreview.innerHTML = `<div class="error">KaTeX 渲染失败：${error.message}</div>`;
  }
}

/**
 * 从可交互编辑器同步当前公式到 LaTeX 文本框和预览。
 */
function syncFromMathField() {
  const latex = mathfield.getValue("latex-expanded");
  latexInput.value = latex;
  renderPreview(latex);
}

/**
 * 将 LaTeX 文本导入到可交互编辑器。
 */
function importLatexToField() {
  const latex = latexInput.value;
  mathfield.setValue(latex, { focus: true, feedback: true });
  renderPreview(latex);
  setStatus("已导入 LaTeX 到可交互编辑区");
}

/**
 * 导出公式编辑区为 LaTeX。
 */
function exportLatexFromField() {
  syncFromMathField();
  setStatus("已从可视化编辑区导出 LaTeX");
}

/**
 * 复制 LaTeX 代码到剪贴板。
 */
async function copyLatex() {
  try {
    await navigator.clipboard.writeText(latexInput.value);
    setStatus("LaTeX 已复制到剪贴板");
  } catch (error) {
    setStatus(`复制失败：${error.message}`);
  }
}

// 初始化编辑器默认公式。
mathfield.setValue(String.raw`f(x)=\frac{\sin(x)}{x}`);
syncFromMathField();

// 监听编辑变更，实现“可交互编辑 -> LaTeX”的实时同步。
mathfield.addEventListener("input", () => {
  syncFromMathField();
  setStatus("编辑中...");
});

// 当用户直接修改 LaTeX 文本框时，只更新预览，不强制覆盖编辑器，避免打断输入。
latexInput.addEventListener("input", () => {
  renderPreview(latexInput.value);
  setStatus("LaTeX 文本已更新，点击“导入到可视化编辑区”可应用");
});

importLatexBtn.addEventListener("click", importLatexToField);
exportLatexBtn.addEventListener("click", exportLatexFromField);
copyLatexBtn.addEventListener("click", copyLatex);

undoBtn.addEventListener("click", () => {
  mathfield.executeCommand("undo");
  syncFromMathField();
  setStatus("已撤销");
});

redoBtn.addEventListener("click", () => {
  mathfield.executeCommand("redo");
  syncFromMathField();
  setStatus("已重做");
});

clearBtn.addEventListener("click", () => {
  mathfield.setValue("");
  syncFromMathField();
  setStatus("已清空公式");
});

// 工具栏快捷插入（如分数、根号、求和、矩阵等）。
symbolToolbar.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-insert]");
  if (!button) return;

  const latex = button.dataset.insert;
  mathfield.insert(latex, { focus: true, feedback: true });
  syncFromMathField();
  setStatus(`已插入：${button.textContent}`);
});

// 虚拟数学键盘显示/隐藏切换。
toggleKeyboardBtn.addEventListener("click", () => {
  const visible = mathfield.virtualKeyboardState === "visible";
  if (visible) {
    mathfield.executeCommand("hideVirtualKeyboard");
    toggleKeyboardBtn.textContent = "显示虚拟数学键盘";
    setStatus("虚拟数学键盘已隐藏");
  } else {
    mathfield.executeCommand("showVirtualKeyboard");
    toggleKeyboardBtn.textContent = "隐藏虚拟数学键盘";
    setStatus("虚拟数学键盘已显示");
  }
});

// Ctrl/Cmd + Enter 快捷键：把 LaTeX 文本框内容快速导入编辑器。
latexInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    importLatexToField();
  }
});
