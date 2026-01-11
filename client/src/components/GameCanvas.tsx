import { useEffect, useRef, useState } from "react";
import { useSubmitScore } from "@/hooks/use-scores";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RefreshCw, AlertCircle } from "lucide-react";

// Game Constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const INITIAL_PLAYER_RADIUS = 15;
const MAX_ENEMIES = 15;
const SPAWN_RATE = 1000; // ms

interface Entity {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  dx: number;
  dy: number;
}

interface GameCanvasProps {
  username: string;
  onExit: () => void;
}

export function GameCanvas({ username, onExit }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();
  const submitScore = useSubmitScore();

  // Game State Refs (avoid re-renders during loop)
  const playerRef = useRef<Entity>({
    id: 0,
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: INITIAL_PLAYER_RADIUS,
    color: "#0ea5e9", // Primary Cyan
    dx: 0,
    dy: 0,
  });
  const enemiesRef = useRef<Entity[]>([]);
  const mouseRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const animationFrameRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);

  // Helper: Generate Random Color
  const getRandomColor = () => {
    const colors = ["#f43f5e", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Helper: Reset Game
  const resetGame = () => {
    playerRef.current = {
      id: 0,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      radius: INITIAL_PLAYER_RADIUS,
      color: "#0ea5e9",
      dx: 0,
      dy: 0,
    };
    enemiesRef.current = [];
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    lastSpawnRef.current = performance.now();
  };

  // Game Loop
  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spawnEnemy = () => {
      const isHorizontal = Math.random() > 0.5;
      const side = Math.random() > 0.5 ? -1 : 1;
      
      let x, y, dx, dy;
      
      if (isHorizontal) {
        x = side === -1 ? -50 : CANVAS_WIDTH + 50;
        y = Math.random() * CANVAS_HEIGHT;
        dx = (Math.random() * 2 + 1) * -side; // Move towards center-ish
        dy = (Math.random() - 0.5) * 2;
      } else {
        x = Math.random() * CANVAS_WIDTH;
        y = side === -1 ? -50 : CANVAS_HEIGHT + 50;
        dx = (Math.random() - 0.5) * 2;
        dy = (Math.random() * 2 + 1) * -side;
      }

      // Random size relative to player (mostly smaller, some bigger)
      // Difficulty progression: as player grows, spawn bigger fish
      const sizeMultiplier = Math.random() < 0.7 ? 0.6 : 1.5; 
      // Clamp radius
      const radius = Math.max(5, Math.min(100, playerRef.current.radius * sizeMultiplier * (Math.random() + 0.5)));

      enemiesRef.current.push({
        id: Math.random(),
        x,
        y,
        radius,
        color: getRandomColor(),
        dx,
        dy,
      });
    };

    const update = (timestamp: number) => {
      if (timestamp - lastSpawnRef.current > SPAWN_RATE && enemiesRef.current.length < MAX_ENEMIES) {
        spawnEnemy();
        lastSpawnRef.current = timestamp;
      }

      // 1. Move Player towards mouse (smooth lerp)
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;
      
      // Calculate angle and distance
      const dx = targetX - playerRef.current.x;
      const dy = targetY - playerRef.current.y;
      
      // Speed factor
      const speed = 0.08; 
      
      playerRef.current.x += dx * speed;
      playerRef.current.y += dy * speed;

      // Keep player in bounds
      playerRef.current.x = Math.max(playerRef.current.radius, Math.min(CANVAS_WIDTH - playerRef.current.radius, playerRef.current.x));
      playerRef.current.y = Math.max(playerRef.current.radius, Math.min(CANVAS_HEIGHT - playerRef.current.radius, playerRef.current.y));

      // 2. Move Enemies
      enemiesRef.current.forEach(enemy => {
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;
      });

      // Cleanup off-screen enemies
      enemiesRef.current = enemiesRef.current.filter(e => 
        e.x > -100 && e.x < CANVAS_WIDTH + 100 && 
        e.y > -100 && e.y < CANVAS_HEIGHT + 100
      );

      // 3. Collision Detection
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const enemy = enemiesRef.current[i];
        const dist = Math.hypot(playerRef.current.x - enemy.x, playerRef.current.y - enemy.y);
        
        if (dist < playerRef.current.radius + enemy.radius) {
          // Collision!
          if (playerRef.current.radius > enemy.radius) {
            // EAT
            enemiesRef.current.splice(i, 1);
            // Grow slightly less than linear to prevent exploding size
            playerRef.current.radius += Math.sqrt(enemy.radius) * 0.2;
            setScore(s => s + Math.floor(enemy.radius));
          } else {
            // DIE
            handleGameOver(score); // Use current score ref would be better but state is ok here since we stop loop
            return; // Stop update loop
          }
        }
      }

      // 4. Render
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Enemies
      enemiesRef.current.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      });

      // Draw Player
      ctx.beginPath();
      ctx.arc(playerRef.current.x, playerRef.current.y, playerRef.current.radius, 0, Math.PI * 2);
      ctx.fillStyle = playerRef.current.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw eyes to show direction
      const eyeOffsetX = (mouseRef.current.x - playerRef.current.x) * 0.05;
      const eyeOffsetY = (mouseRef.current.y - playerRef.current.y) * 0.05;
      
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(playerRef.current.x + eyeOffsetX + playerRef.current.radius * 0.3, playerRef.current.y + eyeOffsetY - playerRef.current.radius * 0.3, playerRef.current.radius * 0.25, 0, Math.PI * 2);
      ctx.arc(playerRef.current.x + eyeOffsetX - playerRef.current.radius * 0.3, playerRef.current.y + eyeOffsetY - playerRef.current.radius * 0.3, playerRef.current.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(playerRef.current.x + eyeOffsetX * 1.5 + playerRef.current.radius * 0.3, playerRef.current.y + eyeOffsetY * 1.5 - playerRef.current.radius * 0.3, playerRef.current.radius * 0.1, 0, Math.PI * 2);
      ctx.arc(playerRef.current.x + eyeOffsetX * 1.5 - playerRef.current.radius * 0.3, playerRef.current.y + eyeOffsetY * 1.5 - playerRef.current.radius * 0.3, playerRef.current.radius * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameStarted, gameOver]);

  // Handle Game Over
  const handleGameOver = async (finalScore: number) => {
    setGameOver(true);
    // Submit score immediately
    try {
      await submitScore.mutateAsync({ username, score: finalScore });
      toast({
        title: "Game Over!",
        description: `You scored ${finalScore} points.`,
      });
    } catch (e) {
      toast({
        title: "Error saving score",
        description: "Could not save your score to the leaderboard.",
        variant: "destructive",
      });
    }
  };

  // Mouse Move Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width),
        y: (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height),
      };
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-sky-100 overflow-hidden rounded-3xl shadow-2xl border-4 border-white/50">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300 rounded-full blur-3xl" />
         <div className="absolute bottom-20 right-20 w-64 h-64 bg-teal-300 rounded-full blur-3xl" />
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain game-canvas"
        onMouseMove={handleMouseMove}
      />

      {/* Start Screen Overlay */}
      <AnimatePresence>
        {!gameStarted && !gameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          >
            <Card className="p-8 max-w-md w-full text-center space-y-6 border-4 border-white shadow-2xl bg-white/95">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-primary">Ready to Fish?</h2>
                <p className="text-muted-foreground font-medium">Eat smaller fish to grow. Avoid bigger fish or get eaten!</p>
              </div>
              
              <div className="flex flex-col gap-4 items-center">
                <div className="p-4 bg-blue-50 rounded-xl w-full">
                  <span className="text-sm text-blue-600 font-bold uppercase tracking-wider">Playing as</span>
                  <div className="text-2xl font-display font-bold text-blue-800">{username}</div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full text-xl font-display h-16 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all rounded-xl"
                  onClick={resetGame}
                >
                  Start Game
                </Button>
                
                <Button variant="ghost" onClick={onExit}>Change Player</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          >
            <Card className="p-8 max-w-md w-full text-center space-y-6 border-4 border-red-200 shadow-2xl bg-white/95">
              <div className="space-y-2">
                <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-4xl font-display font-black text-destructive">OM NOM NOM!</h2>
                <p className="text-lg text-muted-foreground">You were eaten by a bigger fish.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Final Score</div>
                <div className="text-5xl font-display font-black text-primary">{score}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="font-bold border-2 h-14"
                  onClick={onExit}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Leaderboard
                </Button>
                <Button 
                  size="lg" 
                  className="font-bold h-14 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  onClick={resetGame}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      {gameStarted && !gameOver && (
        <div className="absolute top-6 left-6 flex gap-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur border-2 border-white/50 px-6 py-3 rounded-2xl shadow-lg">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</div>
             <div className="text-3xl font-display font-black text-primary tabular-nums">{score}</div>
          </div>
        </div>
      )}
    </div>
  );
}
