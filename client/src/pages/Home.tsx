import { useState, useEffect, useRef } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { Leaderboard } from "@/components/Leaderboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Trophy, Fish, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [username, setUsername] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/audio/sea_background.mp3");
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (hasJoined && !isMuted) {
        audioRef.current.play().catch(console.error);
      } else if (!hasJoined) {
        audioRef.current.pause();
      }
    }
  }, [hasJoined, isMuted]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length > 0) {
      setHasJoined(true);
      setIsPlaying(true);
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const handleExit = () => {
    setIsPlaying(false);
    setHasJoined(false);
    setUsername("");
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const setControl = (dir: "up" | "down" | "left" | "right", active: boolean) => {
    if ((window as any).setGameControl) {
      (window as any).setGameControl(dir, active);
    }
  };

  if (isPlaying) {
    return (
      <div className="h-screen w-screen bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-4 relative">
        <div className="flex-1 w-full max-w-6xl relative">
          <GameCanvas username={username} onExit={handleExit} />
        </div>

        {/* Mute Button */}
        <div className="absolute top-10 right-10 z-[60]">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border-white/20 text-white"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </Button>
        </div>
        
        {/* On-screen controls */}
        <div className="absolute bottom-10 right-10 flex flex-col items-center gap-2 z-[60] select-none touch-none">
          <Button 
            size="icon" 
            className="w-16 h-16 rounded-2xl shadow-xl active:scale-95 transition-transform select-none touch-none"
            onMouseDown={(e) => { e.preventDefault(); setControl("up", true); }}
            onMouseUp={(e) => { e.preventDefault(); setControl("up", false); }}
            onMouseLeave={(e) => { e.preventDefault(); setControl("up", false); }}
            onTouchStart={(e) => { e.preventDefault(); setControl("up", true); }}
            onTouchEnd={(e) => { e.preventDefault(); setControl("up", false); }}
          >
            <ChevronUp size={32} />
          </Button>
          <div className="flex gap-2 select-none touch-none">
            <Button 
              size="icon" 
              className="w-16 h-16 rounded-2xl shadow-xl active:scale-95 transition-transform select-none touch-none"
              onMouseDown={(e) => { e.preventDefault(); setControl("left", true); }}
              onMouseUp={(e) => { e.preventDefault(); setControl("left", false); }}
              onMouseLeave={(e) => { e.preventDefault(); setControl("left", false); }}
              onTouchStart={(e) => { e.preventDefault(); setControl("left", true); }}
              onTouchEnd={(e) => { e.preventDefault(); setControl("left", false); }}
            >
              <ChevronLeft size={32} />
            </Button>
            <Button 
              size="icon" 
              className="w-16 h-16 rounded-2xl shadow-xl active:scale-95 transition-transform select-none touch-none"
              onMouseDown={(e) => { e.preventDefault(); setControl("down", true); }}
              onMouseUp={(e) => { e.preventDefault(); setControl("down", false); }}
              onMouseLeave={(e) => { e.preventDefault(); setControl("down", false); }}
              onTouchStart={(e) => { e.preventDefault(); setControl("down", true); }}
              onTouchEnd={(e) => { e.preventDefault(); setControl("down", false); }}
            >
              <ChevronDown size={32} />
            </Button>
            <Button 
              size="icon" 
              className="w-16 h-16 rounded-2xl shadow-xl active:scale-95 transition-transform select-none touch-none"
              onMouseDown={(e) => { e.preventDefault(); setControl("right", true); }}
              onMouseUp={(e) => { e.preventDefault(); setControl("right", false); }}
              onMouseLeave={(e) => { e.preventDefault(); setControl("right", false); }}
              onTouchStart={(e) => { e.preventDefault(); setControl("right", true); }}
              onTouchEnd={(e) => { e.preventDefault(); setControl("right", false); }}
            >
              <ChevronRight size={32} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-4 md:p-8 flex items-center justify-center overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10 text-white"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Fish size={24 + Math.random() * 64} />
          </motion.div>
        ))}
      </div>

      <div className="container max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Col: Welcome/Login */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 text-center md:text-left"
        >
          <div className="space-y-2">
            <h1 className="text-6xl md:text-7xl font-display font-black text-white drop-shadow-lg tracking-tight leading-tight">
              Pesta <br/> 
              <span className="text-yellow-300">Ikan!</span>
            </h1>
            <p className="text-xl text-blue-100 font-medium max-w-md mx-auto md:mx-0">
              Eat smaller fish to grow. Become the biggest fish in the pond. Don't get eaten!
            </p>
          </div>

          <Card className="p-6 bg-white/95 backdrop-blur shadow-2xl border-white/20">
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  Enter your Player Name
                </label>
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Sharky McChomp"
                  className="h-14 text-lg font-bold border-2 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary/50"
                  maxLength={15}
                  required
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-xl font-display font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all"
                disabled={!username.trim()}
              >
                <Play className="mr-2 h-6 w-6 fill-current" />
                Start Playing
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Right Col: Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-black/20 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-400" />
                Leaderboard
              </h2>
              <span className="text-white/60 text-sm font-bold bg-white/10 px-3 py-1 rounded-full">Top 10</span>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <Leaderboard />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
