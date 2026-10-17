import { useEffect, useRef, useState } from 'react';
import { Code2, Play, Download, FolderOpen, Save, Terminal, Smartphone } from 'lucide-react';

const KEY = 'pocket-python-code-v1';
const STARTER = 'name = "Python"\nfor i in range(3):\n    print(f"Hello, {name}! Count: {i + 1}")\n\nprint("Ready to build something?")';

export default function App() {
  const [code, setCode] = useState(() => {
    try { return localStorage.getItem(KEY) || STARTER; } catch { return STARTER; }
  });
  const [filename, setFilename] = useState('main.py');
  const [output, setOutput] = useState('Your output will appear here.\nTap Run code to start.');
  const [status, setStatus] = useState('Autosaved on this device');
  const [running, setRunning] = useState(false);
  const runtime = useRef(null);
  const picker = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, code); } catch { setStatus('Browser storage is full'); }
  }, [code]);

  async function getPython() {
    if (runtime.current) return runtime.current;
    setStatus('Loading Python runtime…');
    if (!window.loadPyodide) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Could not load Python. Check your internet connection and retry.'));
        document.head.appendChild(script);
      });
    }
    runtime.current = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' });
    return runtime.current;
  }

  async function runCode() {
    setRunning(true);
    setOutput('');
    try {
      const py = await getPython();
      let result = '';
      py.setStdout({ batched: line => { result += line + '\n'; setOutput(result); } });
      py.setStderr({ batched: line => { result += line + '\n'; setOutput(result); } });
      await py.runPythonAsync(code);
      setOutput(result.trimEnd() || '(Code ran successfully with no output.)');
      setStatus('Run completed');
    } catch (error) {
      setOutput(error?.message || String(error));
      setStatus('Run failed — check your code');
    } finally {
      setRunning(false);
    }
  }

  function downloadFile() {
    const name = filename.trim() || 'main.py';
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name.endsWith('.py') ? name : `${name}.py`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Python file downloaded');
  }

  function openFile(file) {
    if (!file) return;
    if (!file.name.endsWith('.py') && !file.name.endsWith('.txt')) {
      setStatus('Choose a .py or .txt file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCode(String(reader.result || ''));
      setFilename(file.name);
      setStatus('File opened');
    };
    reader.onerror = () => setStatus('Could not read that file');
    reader.readAsText(file);
  }

  return <div className="shell">
    <header className="topbar">
      <a className="brand" href="./"><span className="brand-icon"><Code2 size={21}/></span> Pocket<span className="accent">Python</span></a>
      <span className="pill"><span className="dot"/> Python in your browser</span>
    </header>
    <main>
      <section className="hero">
        <div className="eyebrow"><Smartphone size={14}/> YOUR PYTHON WORKSPACE</div>
        <h1>Code anywhere.<br/><span>Even on your phone.</span></h1>
        <p>Write Python, run it right here, and keep your scripts close. No installation needed.</p>
      </section>
      <section className="workspace">
        <div className="panel">
          <div className="filebar">
            <label className="filename"><span className="py-mark">Py</span><input aria-label="Python filename" value={filename} onChange={e => setFilename(e.target.value)} /></label>
            <button className="secondary small" onClick={() => picker.current?.click()}><FolderOpen size={16}/> Open .py</button>
            <input ref={picker} type="file" accept=".py,.txt,text/plain" hidden onChange={e => openFile(e.target.files?.[0])}/>
          </div>
          <div className="editor-meta"><span>● &nbsp;main.py</span><span>Python 3 · UTF-8</span></div>
          <textarea className="editor" aria-label="Python code editor" spellCheck="false" autoCapitalize="off" autoCorrect="off" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => {
            if (e.key === 'Tab') { e.preventDefault(); const el = e.currentTarget; const start = el.selectionStart; const end = el.selectionEnd; setCode(code.slice(0, start) + '    ' + code.slice(end)); requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 4; }); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); }
          }}/>
          <div className="editor-foot"><span>Autosaves on this device</span><span>{code.length} chars</span></div>
          <div className="actions">
            <button className="run" disabled={running} onClick={runCode}><Play size={17} fill="currentColor"/>{running ? 'Running…' : 'Run code'}</button>
            <button className="secondary" onClick={downloadFile}><Download size={17}/> Download .py</button>
          </div>
          <div className="status"><Save size={14}/>{status}</div>
        </div>
        <div className="panel console">
          <div className="console-head"><span><Terminal size={17}/> Output</span><small>CONSOLE</small></div>
          <pre>{output}</pre>
          <div className="console-foot"><span className="dot purple-dot"/> Ready for your next idea</div>
        </div>
      </section>
      <section className="features">
        <article><b>Run Python here</b><p>Runs in your browser using Pyodide.</p></article>
        <article><b>Autosave locally</b><p>Your draft stays in this browser on this device.</p></article>
        <article><b>Keep your .py files</b><p>Download scripts or open ones already on your phone.</p></article>
      </section>
      <aside><b>Quick tip</b> Use your browser menu → “Add to Home screen” to launch Pocket Python like an app. Download important scripts as backups.</aside>
      <p className="privacy">Your code is stored in this browser. Clearing browser data can erase drafts, so download important files as backups. Python runtime loads from the internet the first time you run code.</p>
    </main>
    <footer><span><Code2 size={15}/> PocketPython</span><span>Made for learning, wherever you are.</span></footer>
  </div>;
}