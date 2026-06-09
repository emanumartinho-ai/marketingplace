import { useState, useEffect, useCallback, useRef } from "react";

const COLS = 20;
const ROWS = 20;
const CELL = 24;
const INITIAL_SPEED = 150;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { x: number; y: number };

function random(exclude: Pos[]): Pos {
  let pos: Pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (exclude.some((p) => p.x === pos.x && p.y === pos.y));
  return pos;
}

const INITIAL_SNAKE: Pos[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

type GameState = "idle" | "running" | "paused" | "over";

export default function App() {
  const [snake, setSnake] = useState<Pos[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Pos>({ x: 15, y: 10 });
  const [dir, setDir] = useState<Dir>("RIGHT");
  const [nextDir, setNextDir] = useState<Dir>("RIGHT");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("snake-best") || 0));
  const [gameState, setGameState] = useState<GameState>("idle");
  const [flash, setFlash] = useState(false);

  const snakeRef = useRef(snake);
  const dirRef = useRef(dir);
  const nextDirRef = useRef(nextDir);
  const foodRef = useRef(food);
  const scoreRef = useRef(score);

  snakeRef.current = snake;
  dirRef.current = dir;
  nextDirRef.current = nextDir;
  foodRef.current = food;
  scoreRef.current = score;

  const reset = useCallback(() => {
    const initSnake = INITIAL_SNAKE;
    setSnake(initSnake);
    setDir("RIGHT");
    setNextDir("RIGHT");
    const newFood = random(initSnake);
    setFood(newFood);
    setScore(0);
    setGameState("running");
    setFlash(false);
  }, []);

  const tick = useCallback(() => {
    const s = snakeRef.current;
    const d = nextDirRef.current;
    setDir(d);
    const head = s[0];
    const newHead: Pos = { x: head.x, y: head.y };

    if (d === "UP") newHead.y -= 1;
    else if (d === "DOWN") newHead.y += 1;
    else if (d === "LEFT") newHead.x -= 1;
    else if (d === "RIGHT") newHead.x += 1;

    // wall collision
    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
      setGameState("over");
      const sc = scoreRef.current;
      setBest((b) => {
        const nb = Math.max(b, sc);
        localStorage.setItem("snake-best", String(nb));
        return nb;
      });
      return;
    }

    // self collision (skip last tail since it will move)
    if (s.slice(0, -1).some((p) => p.x === newHead.x && p.y === newHead.y)) {
      setGameState("over");
      const sc = scoreRef.current;
      setBest((b) => {
        const nb = Math.max(b, sc);
        localStorage.setItem("snake-best", String(nb));
        return nb;
      });
      return;
    }

    const ate = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
    const newSnake = ate ? [newHead, ...s] : [newHead, ...s.slice(0, -1)];
    setSnake(newSnake);

    if (ate) {
      const newScore = scoreRef.current + 10;
      setScore(newScore);
      setFood(random(newSnake));
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
    }
  }, []);

  // game loop
  useEffect(() => {
    if (gameState !== "running") return;
    const speed = Math.max(60, INITIAL_SPEED - Math.floor(scoreRef.current / 50) * 10);
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [gameState, tick, score]);

  // keyboard
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
      const map: Record<string, Dir> = {
        ArrowUp: "UP", w: "UP", W: "UP",
        ArrowDown: "DOWN", s: "DOWN", S: "DOWN",
        ArrowLeft: "LEFT", a: "LEFT", A: "LEFT",
        ArrowRight: "RIGHT", d: "RIGHT", D: "RIGHT",
      };
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (gameState === "idle" || gameState === "over") { reset(); return; }
        if (gameState === "running") { setGameState("paused"); return; }
        if (gameState === "paused") { setGameState("running"); return; }
      }
      const newDir = map[e.key];
      if (newDir && newDir !== opp[dirRef.current]) {
        setNextDir(newDir);
        nextDirRef.current = newDir;
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [gameState, reset]);

  const snakeSet = new Set(snake.map((p) => `${p.x},${p.y}`));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 select-none">
      <h1 className="text-3xl font-mono font-bold text-primary mb-1 tracking-widest uppercase">
        Cobra
      </h1>

      {/* Score bar */}
      <div className="flex gap-8 mb-4 font-mono text-sm">
        <div className="text-center">
          <div className="text-muted-foreground uppercase tracking-widest text-xs">Pontos</div>
          <div className={`text-2xl font-bold transition-colors ${flash ? "text-accent" : "text-foreground"}`}>
            {score}
          </div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground uppercase tracking-widest text-xs">Recorde</div>
          <div className="text-2xl font-bold text-primary">{best}</div>
        </div>
      </div>

      {/* Board */}
      <div
        className="relative border-2 border-primary/40 rounded-sm overflow-hidden"
        style={{ width: COLS * CELL, height: ROWS * CELL, background: "hsl(120 20% 4%)" }}
      >
        {/* Grid lines */}
        <svg
          className="absolute inset-0 opacity-10"
          width={COLS * CELL}
          height={ROWS * CELL}
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: COLS + 1 }).map((_, i) => (
            <line key={`v${i}`} x1={i * CELL} y1={0} x2={i * CELL} y2={ROWS * CELL} stroke="#4ade80" strokeWidth={0.5} />
          ))}
          {Array.from({ length: ROWS + 1 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * CELL} x2={COLS * CELL} y2={i * CELL} stroke="#4ade80" strokeWidth={0.5} />
          ))}
        </svg>

        {/* Snake */}
        {snake.map((p, i) => {
          const isHead = i === 0;
          return (
            <div
              key={`${p.x}-${p.y}-${i}`}
              className="absolute transition-none"
              style={{
                left: p.x * CELL + 1,
                top: p.y * CELL + 1,
                width: CELL - 2,
                height: CELL - 2,
                background: isHead
                  ? "hsl(120 70% 55%)"
                  : `hsl(120 ${60 - i * 1.5}% ${45 - i * 0.8}%)`,
                borderRadius: isHead ? 4 : 2,
                boxShadow: isHead ? "0 0 8px hsl(120 70% 55% / 0.8)" : undefined,
              }}
            />
          );
        })}

        {/* Food */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            left: food.x * CELL + 3,
            top: food.y * CELL + 3,
            width: CELL - 6,
            height: CELL - 6,
            background: "hsl(45 100% 55%)",
            boxShadow: "0 0 10px hsl(45 100% 55% / 0.9)",
          }}
        />

        {/* Overlay: idle */}
        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <p className="text-primary font-mono font-bold text-2xl mb-2">JOGO DA COBRA</p>
            <p className="text-muted-foreground font-mono text-sm mb-6">Use as setas ou WASD</p>
            <button
              data-testid="button-start"
              onClick={reset}
              className="bg-primary text-primary-foreground font-mono font-bold px-8 py-3 rounded text-lg hover:brightness-110 transition-all"
            >
              INICIAR
            </button>
          </div>
        )}

        {/* Overlay: paused */}
        {gameState === "paused" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <p className="text-primary font-mono font-bold text-2xl mb-6">PAUSADO</p>
            <button
              data-testid="button-resume"
              onClick={() => setGameState("running")}
              className="bg-primary text-primary-foreground font-mono font-bold px-8 py-3 rounded text-lg hover:brightness-110 transition-all"
            >
              CONTINUAR
            </button>
          </div>
        )}

        {/* Overlay: game over */}
        {gameState === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <p className="text-destructive font-mono font-bold text-2xl mb-1">FIM DE JOGO</p>
            <p className="text-muted-foreground font-mono text-sm mb-1">Pontuação: <span className="text-foreground font-bold">{score}</span></p>
            {score >= best && score > 0 && (
              <p className="text-accent font-mono text-sm mb-4">Novo recorde!</p>
            )}
            {!(score >= best && score > 0) && <div className="mb-4" />}
            <button
              data-testid="button-restart"
              onClick={reset}
              className="bg-primary text-primary-foreground font-mono font-bold px-8 py-3 rounded text-lg hover:brightness-110 transition-all"
            >
              JOGAR DE NOVO
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
        {[
          { label: "▲", dir: "UP" as Dir, col: 2, row: 1 },
          { label: "◀", dir: "LEFT" as Dir, col: 1, row: 2 },
          { label: "▼", dir: "DOWN" as Dir, col: 2, row: 2 },
          { label: "▶", dir: "RIGHT" as Dir, col: 3, row: 2 },
        ].map(({ label, dir: d, col, row }) => (
          <button
            key={d}
            data-testid={`button-dir-${d.toLowerCase()}`}
            onTouchStart={(e) => {
              e.preventDefault();
              const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
              if (d !== opp[dirRef.current]) {
                setNextDir(d);
                nextDirRef.current = d;
                if (gameState === "idle" || gameState === "over") reset();
                else if (gameState === "paused") setGameState("running");
              }
            }}
            style={{ gridColumn: col, gridRow: row }}
            className="bg-secondary text-foreground font-mono text-xl w-14 h-14 rounded flex items-center justify-center active:bg-primary active:text-primary-foreground transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-muted-foreground font-mono text-xs text-center">
        Setas / WASD para mover &nbsp;·&nbsp; Espaço para pausar
      </p>
    </div>
  );
}
