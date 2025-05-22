import React, { useState, useEffect } from "react";
import Viz from "viz.js";
import { Module, render } from "viz.js/full.render.js";
import "./App.css";

const graph1 = {
  q0: { a: ["q1"], b: ["q1"] },
  q1: { a: ["q2"], b: ["q2"] },
  q2: { a: ["q3"], b: ["q8"] },
  q3: { a: ["q6"], b: ["q4"] },
  q4: { a: ["q5"], b: ["q7"] },
  q5: { a: ["q10"], b: ["q13"] },
  q6: { a: ["q6"], b: ["q7"] },
  q7: { a: ["q9"], b: ["q7"] },
  q8: { b: ["q8"], a: ["q9"] },
  q9: { a: ["q5"], b: ["q5"] },
  q10: { a: ["q12"], b: ["q11"] },
  q11: { a: ["q12"], b: ["q12"] },
  q12: { a: ["q13"], b: ["q13"] },
  q13: { a: ["q13"], b: ["q13"] },
};

const graph2 = {
  q0: { "0": ["q1"], "1": ["q1"] },
  q1: { "0": ["q3"], "1": ["q2"] },
  q2: { "0": ["q4"], "1": ["q4"] },
  q3: { "0": ["q4"], "1": ["q4"] },
  q4: { "0": ["q5"], "1": ["q6"] },
  q5: { "0": ["q8"], "1": ["q2"] },
  q6: { "0": ["q7"], "1": ["q9"] },
  q7: { "0": ["q2"], "1": ["q10"] },
  q8: { "0": ["q11"], "1": ["q11"] },
  q9: { "0": ["q3"], "1": ["q11"] },
  q10: { "0": ["q11"], "1": ["q3"] },
  q11: { "0": ["q12"], "1": ["q14"] },
  q12: { "0": ["q12"], "1": ["q13"] },
  q13: { "0": ["q19"], "1": ["q17"] },
  q14: { "0": ["q16"], "1": ["q15"] },
  q15: { "0": ["q16"], "1": ["q17"] },
  q16: { "0": ["q12"], "1": ["q18"] },
  q17: { "0": ["q16"], "1": ["q13"] },
  q18: { "0": ["q19"], "1": ["q17"] },
  q19: { "0": ["q12"], "1": ["q18"] },
};

const accept1 = new Set(["q13"]);
const accept2 = new Set(["q17", "q18", "q19"]);

const AutomatonSimulator = ({
  title,
  question,
  dfa,
  acceptStates,
  alphabet,
  cfg,
  hasPDA,
  pdaImage,
}) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [view, setView] = useState("DFA");

  const drawGraph = (state) => {
    let dot = `digraph NFA {
      rankdir=LR;
      size="20,10";
      node [shape=circle fontcolor=black];
      start [label="", shape=none];
      start -> q0;
    `;

    for (let s in dfa) {
      const style = acceptStates.has(s) ? "doublecircle" : "circle";
      const highlight = s === state ? "style=filled fillcolor=red fontcolor=white" : "";
      dot += `${s} [shape=${style} ${highlight}];\n`;
    }

    for (let [s, trans] of Object.entries(dfa)) {
      for (let [sym, targets] of Object.entries(trans)) {
        for (let t of targets) {
          dot += `${s} -> ${t} [label="${sym}"];\n`;
        }
      }
    }

    dot += "}";

    const viz = new Viz({ Module, render });
    viz.renderSVGElement(dot).then((el) => {
      const container = document.getElementById(`graph-${title}`);
      if (container) {
        container.innerHTML = "";
        el.style.width = "100%";
        container.appendChild(el);
      }
    });
  };

useEffect(() => {
  if (view === "DFA") {
    const drawGraph = (state) => {
      let dot = `digraph NFA {
        rankdir=LR;
        size="20,10";
        node [shape=circle fontcolor=black];
        start [label="", shape=none];
        start -> q0;
      `;

      for (let s in dfa) {
        const style = acceptStates.has(s) ? "doublecircle" : "circle";
        const highlight = s === state ? "style=filled fillcolor=red fontcolor=white" : "";
        dot += `${s} [shape=${style} ${highlight}];\n`;
      }

      for (let [s, trans] of Object.entries(dfa)) {
        for (let [sym, targets] of Object.entries(trans)) {
          for (let t of targets) {
            dot += `${s} -> ${t} [label="${sym}"];\n`;
          }
        }
      }

      dot += "}";

      const viz = new Viz({ Module, render });
      viz.renderSVGElement(dot).then((el) => {
        const container = document.getElementById(`graph-${title}`);
        if (container) {
          container.innerHTML = "";
          el.style.width = "100%";
          container.appendChild(el);
        }
      });
    };

    drawGraph("q0");
    setInput("");
    setResult("");
  }
}, [view, dfa, acceptStates, title]);


  const simulate = async () => {
    if (!new RegExp(`^[${alphabet.replace(/[^a-z0-9]/gi, "")}]*$`).test(input)) {
      setResult(`❌ Invalid input. Only ${alphabet.split("").join(", ")} allowed.`);
      return;
    }

    setIsRunning(true);
    let state = "q0";
    drawGraph(state);

    for (let char of input) {
      await new Promise((res) => setTimeout(res, 800));
      const next = dfa[state]?.[char];
      if (!next) {
        setResult("❌ No valid transition.");
        setIsRunning(false);
        return;
      }
      state = next[0];
      drawGraph(state);
    }

    setResult(acceptStates.has(state) ? "✅ Accepted" : "❌ Rejected");
    setIsRunning(false);
  };

  return (
    <div className="simulator">
      <h1>{title}</h1>
      <h2>{question}</h2>

      <div className="view-buttons">
        {["DFA", "CFG", ...(hasPDA ? ["PDA"] : [])].map((v) => (
          <button
            key={v}
            className={view === v ? "active" : ""}
            onClick={() => {
              setView(v);
              setResult("");
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "DFA" && (
        <>
          <div id={`graph-${title}`} className="graph-container"></div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRunning}
            placeholder={`Enter a string of ${alphabet}`}
          />
          <button onClick={simulate} disabled={isRunning}>
            {isRunning ? "Simulating..." : "Simulate"}
          </button>
          <div className="result">{result}</div>
        </>
      )}

{view === "CFG" && (
  <div className="cfg-container">
    <pre>{cfg}</pre>
  </div>
)}

      {view === "PDA" && hasPDA && (
        <div className="graph-container">
          <img
            src={pdaImage}
            alt="PDA Diagram"
            style={{ width: "100%", maxWidth: "800px" }}
          />
        </div>
      )}
    </div>
  );
};

export default function App() {

    const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (2 seconds)
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader-text">Loading Automaton Simulator...</div>
      </div>
    );
  }
  return (
    <div className="App">
      <AutomatonSimulator
        title="Automata Question 1"
        question="Regex: (a+b+aa+bb+aba) (a+b+bb+aa)* (a+b+aa+bb) (a+b)* (ab+ba+bab+aba) (ab+bb+abb+bab+aa) (a+b*)"
        dfa={graph1}
        acceptStates={accept1}
        alphabet="a, b"
        cfg={`CFG for Question 1:
G = ( {S, A, B, C, D, E, F, H}, {a, b}, P, S ) 
P: 
S → ABCDEFH 
A → a | b | aa | bb | aba 
B → aB | bB | bbB | aaB | ε 
C → a | b | aa | bb 
D → aD | bD | ε 
E → ab | ba | bab | aba 
F → ab | bb | abb | bab | aa 
H → aH | bH | ε `}
        hasPDA={true}
        pdaImage="/pda1.jpg"
      />

      <AutomatonSimulator
        title="Automata Question 2"
        question="Regex: (1+0) (1+0)* (11+00+01+10)* (11+00+01+10) (1010+001+111+000) (1+0)* (101+011+111+010)"
        dfa={graph2}
        acceptStates={accept2}
        alphabet="0 , 1"
        cfg={`CFG for Question 2:
G = ( {S, A, B, C, D, E, F, H}, {0, 1}, P, S ) 
P: 
S → ABCDEFH 
A → 1 | 0 
B → 1B | 0B | ε 
C → 11C | 00C | 01C | 10C | ε 
D → 11 | 00 | 01 | 10 
E → 1010 | 001 | 111 | 000 
F → 1F | 0F | ε 
H → 101 | 011 | 111 | 010 `}
        hasPDA={true}
        pdaImage="/pda2.jpg"

      />

      {/* TEAM MEMBERS SECTION */}
<div className="team-section">
  <h2>Meet the Team</h2>
  <div className="team-members">
    <div className="member">
      <img src="/student1.jpg" alt="Student 1" />
      <p>Abot, Nicolei Faith </p>
    </div>
    <div className="member">
      <img src="/student2.jpg" alt="Student 2" />
      <p>Aquino, Peter Dhaniel </p>
    </div>
    <div className="member">
      <img src="/student3.jpg" alt="Student 3" />
      <p>Ferreira, Jessica Alen</p>
    </div>
    <div className="member">
      <img src="/student4.jpg" alt="Student 4" />
      <p>Quitaneg, Blake Daniel</p>
    </div>
  </div>
</div>

    </div>
  );
}
