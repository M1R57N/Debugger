// Java Debugger (offline) - by Eslam Atya
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

    // Default Code for a better start (optional)
    const initialCode = "console.log('Hello, Java Debugger!');\n// This runner uses JavaScript, but simulates a code execution environment.";
    editor.innerHTML = initialCode.trim().replace(/\n/g, '<br>');

    // ----------------------------------
    // 1. Intro Typing Effect
    // ----------------------------------
    const titleText = 'Java Debugger';
    const typedName = document.getElementById('typed-name');
    let i = 0;
    const typingSpeed = 100;

    function typeStep() {
        if (i < titleText.length) {
            typedName.textContent += titleText.charAt(i);
            i++;
            setTimeout(typeStep, typingSpeed);
        } else {
            // Finished typing -> show Start button
            startBtn.style.opacity = '0'; // Start with opacity 0 (CSS handles initial visibility)
            setTimeout(() => { 
                startBtn.style.opacity = '1'; 
                startBtn.style.pointerEvents = 'auto'; 
                startBtn.classList.add('fade-in'); // Add a class for CSS transition if needed
            }, 400);
        }
    }
    typeStep();

    // ----------------------------------
    // 2. Main App Logic
    // ----------------------------------

    // Start button opens app
    startBtn.addEventListener('click', () => {
        intro.classList.add('hidden');
        app.classList.remove('hidden');
        editor.focus();
    });

    // Helper: Get code from contenteditable, normalize line breaks
    function getCode() {
        // Replace <br> with \n, and normalize multiple spaces/nbsp
        return editor.innerHTML
            .replace(/<br>/g, '\n')
            .replace(/&nbsp;/g, ' ')
            .replace(/<[^>]*>/g, '') // remove any other tags (basic cleanup)
            .trim();
    }

    // Run Code Function
    function runCode() {
        const code = getCode();
        if (code === '') {
            showOutput('Error: Code editor is empty. Please enter your code.', true);
            return;
        }

        let outputLines = [];
        // Capture console.log
        const oldLog = console.log;
        console.log = (...args) => {
            outputLines.push(args.map(arg => String(arg)).join(' '));
            // Keep old log for debugging the debugger itself!
            // oldLog.apply(console, args); 
        };

        try {
            // Run code in a secure context (new Function)
            const result = (new Function(code))();
            
            let finalOutput = '';
            if (outputLines.length > 0) {
                finalOutput = outputLines.join('\n');
            } else if (result !== undefined) {
                finalOutput = String(result);
            } else {
                finalOutput = 'Code executed successfully. No output generated.';
            }

            showOutput(finalOutput, false);
        } catch (err) {
            showOutput(`Runtime Error:\n${err.message}`, true);
        } finally {
            console.log = oldLog; // Restore console.log
        }
    }

    // UI Functions
    function showOutput(text, isError) {
        output.classList.toggle('error', !!isError);
        output.textContent = text;
        outputArea.classList.remove('hidden');
        outputArea.setAttribute('aria-hidden', 'false');
        runBtn.classList.add('hidden');
        editBtn.classList.remove('hidden');
        // Disable editor to prevent input while output is shown
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

    // Attach Events
    runBtn.addEventListener('click', runCode);
    editBtn.addEventListener('click', hideOutput);

    // Copy Output
    copyBtn.addEventListener('click', () => {
        const t = output.textContent || '';
        navigator.clipboard && navigator.clipboard.writeText(t).then(() => {
            copyBtn.textContent = 'تم النسخ 👍';
            setTimeout(() => copyBtn.textContent = 'نسخ 📋', 1200);
        }, () => {
            copyBtn.textContent = 'فشل 😔';
            setTimeout(() => copyBtn.textContent = 'نسخ 📋', 1200);
        });
    });

    // Save Output
    saveBtn.addEventListener('click', () => {
        const t = output.textContent || '';
        const blob = new Blob([t], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'javadebugger-output.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });

    // ----------------------------------
    // 3. Keyboard Shortcuts
    // ----------------------------------
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to run
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!app.classList.contains('hidden') && !outputArea.classList.contains('hidden')) {
                // If output is visible, pressing enter again should hide it (optional)
                hideOutput(); 
            } else if (!app.classList.contains('hidden')) {
                runCode();
            }
        }
        
        // Tab inserts two spaces (or use a dedicated code mirror library for real projects)
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
        }
    });

    // Fix for contenteditable on paste (to paste as plain text)
    editor.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });
});
