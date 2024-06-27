import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function Home() {
  const [state, setState] = useState(0);

  const [text, setText] = useState('');

  const [textList, setTextList] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const res = await window.electron.ipcRenderer.invokeMessage('get-text');
      setTextList(res || []);
    })();
  }, []);

  const onSubmitNode = () => {
    window.electron.ipcRenderer.invokeMessage('save-text', text);
  };

  return (
    <div>
      <div>
        <div className="container">
          <div>State Counter: {state}</div>
          <button type="button" onClick={() => setState(state + 1)}>
            Increment
          </button>
        </div>

        <div className="container">
          <div>Data Store</div>
          <ul>
            {textList.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="button" onClick={onSubmitNode}>
            Save text by Node
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
