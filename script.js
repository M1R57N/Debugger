// Java Debugger (offline) - by Eslam Atya
// Behavior: intro typing, editor (contenteditable), run -> show output overlay, edit again, copy/save

document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  const startBtn = document.getElementById('startBtn');
  const app = document.getElementById('app');
  const runBtn = document.getElementById('runBtn');
  const editBtn = document.getElementById('editBtn');
  const copyBtn = document.getElementById('copyBtn');
  const saveBtn = document.getElementById('saveBtn');
  const editor = document.getElementById('editor');
  const outputArea = document.getElementById('outputArea');
  const output = document.getElementById('output');

  // typing effect for intro (3 seconds total)
  const titleText = 'Java Debugger';
  const typedName = document.getElementById('typed-name');
  let i = 0;
  const typingSpeed = 120;
  function typeStep() {
    if (i < titleText.length) {
      typedName.textContent += titleText.charAt(i);
      i++;
      setTimeout(typeStep, typingSpeed);
    } else {
      // finished typing -> show Start button (wait a bit)
      setTimeout(()=> { startBtn.style.opacity = '1'; startBtn.style.pointerEvents = 'auto'; }, 400);
    }
  }
  // start hidden button
  startBtn.style.opacity = '0';
  startBtn.style.pointerEvents = 'none';
  typeStep();

  // Start button opens app
  startBtn.addEventListener('click', ()=> {
    intro.classList.add('hidden');
    setTimeout(()=> { intro.style.display = 'none'; }, 420);
    app.classList.remove('hidden');
    // focus editor
    editor.focus();
    // place a sample
    if (!editor.textContent.trim()) {
      editor.textContent = '';
    }
  });

  // helper to get code from contenteditable
  function getCode() {
    // preserve line breaks
    return editor.textContent.replace(/\u00A0/g, ' ');
  }

  // run code - capture last console.log
  function runCode() {
    const code = getCode();
    let lastLine = '';
    const oldLog = console.log;
    console.log = (...args) => {
      lastLine = args.join(' ');
      oldLog.apply(console, args);
    };
    try {
      // run in new Function to avoid using page scope variables
      const result = (new Function(code))();
      const final = lastLine !== '' ? lastLine : (result !== undefined ? String(result) : 'Code executed.');
      showOutput(final, false);
    } catch (err) {
      showOutput('Error: ' + err.message, true);
    } finally {
      console.log = oldLog;
    }
  }

  function showOutput(text, isError) {
    output.classList.toggle('error', !!isError);
    output.textContent = text;
    outputArea.classList.remove('hidden');
    outputArea.setAttribute('aria-hidden', 'false');
    runBtn.classList.add('hidden');
    editBtn.classList.remove('hidden');
    // make editor readonly (prevent caret blinking under overlay)
    editor.setAttribute('contenteditable', 'false');
  }

  function hideOutput() {
    outputArea.classList.add('hidden');
    outputArea.setAttribute('aria-hidden', 'true');
    runBtn.classList.remove('hidden');
    editBtn.classList.add('hidden');
    editor.setAttribute('contenteditable', 'true');
    editor.focus();
  }

  runBtn.addEventListener('click', runCode);
  editBtn.addEventListener('click', hideOutput);

  // copy output
  copyBtn.addEventListener('click', ()=> {
    const t = output.textContent || '';
    navigator.clipboard && navigator.clipboard.writeText(t).then(()=> {
      copyBtn.textContent = 'Copied';
      setTimeout(()=> copyBtn.textContent = 'Copy', 1200);
    }, ()=> {
      copyBtn.textContent = 'Fail';
      setTimeout(()=> copyBtn.textContent = 'Copy', 1200);
    });
  });

  // save output
  saveBtn.addEventListener('click', ()=> {
    const t = output.textContent || '';
    const blob = new Blob([t], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'javadebugger-output.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // keyboard shortcuts: Ctrl/Cmd + Enter to run, Tab inserts two spaces
  document.addEventListener('keydown', (e)=>{
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!app.classList.contains('hidden')) runCode();
    }
    if (e.key === 'Tab' && document.activeElement === editor) {
      e.preventDefault();
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
      const tabNode = document.createTextNode('  ');
      range.insertNode(tabNode);
      range.setStartAfter(tabNode);
      range.setEndAfter(tabNode);
      sel.removeAllRanges();
      sel.addRange(range);
      // keep focus
    }
  });

  // ensure responsive repaint on resize
  window.addEventListener('resize', ()=> { /* no-op but can be extended */ });

});
