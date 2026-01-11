import { useScores } from "@/hooks/use-scores";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal } from "lucide-react";
import { motion } from "framer-motion";

export function Leaderboard() {
  const { data: scores, isLoading } = useScores();

  // Sort scores desc and take top 10
  const topScores = scores?.sort((a, b) => b.score - a.score).slice(0, 10) || [];

  if (isLoading) {
    return (
      <div className="space-y-3 w-full max-w-md mx-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {topScores.length === 0 ? (
        <div className="text-center p-8 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
          <Trophy className="mx-auto h-12 w-12 text-yellow-400 opacity-50 mb-2" />
          <p className="text-white font-medium">No champions yet. Be the first!</p>
        </div>
      ) : (
        topScores.map((score, index) => (
          <motion.div
            key={score.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              relative flex items-center justify-between p-4 rounded-xl border
              ${index === 0 ? 'bg-yellow-50/90 border-yellow-200 shadow-yellow-100/50 shadow-lg scale-105 z-10' : 
                index === 1 ? 'bg-slate-50/90 border-slate-200 shadow-md' :
                index === 2 ? 'bg-orange-50/90 border-orange-200 shadow-md' :
                'bg-white/80 border-white/40 shadow-sm'
              }
              transition-transform hover:scale-[1.02]
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-8 h-8 flex items-center justify-center rounded-full font-bold font-display
                ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-slate-300 text-slate-700' :
                  index === 2 ? 'bg-orange-300 text-orange-800' :
                  'bg-slate-100 text-slate-500'
                }
              `}>
                {index + 1}
              </div>
              <span className="font-bold text-slate-800 truncate max-w-[140px]">
                {score.username}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl text-primary">{score.score}</span>
              {index < 3 && <Medal className={`w-4 h-4 ${
                index === 0 ? 'text-yellow-500' :
                index === 1 ? 'text-slate-400' :
                'text-orange-500'
              }`} />}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
