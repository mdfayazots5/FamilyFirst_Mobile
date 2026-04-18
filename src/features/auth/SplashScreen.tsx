import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center text-white overflow-hidden select-none">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[160px] pointer-events-none" 
      />
      
      {/* Tactile Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col items-center relative z-10"
      >
        <div className="relative mb-14">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 border border-accent/20 rounded-[48px] dashed shadow-[0_0_50px_rgba(255,174,0,0.1)]"
          />
          <div className="w-32 h-32 bg-accent rounded-[40px] flex items-center justify-center relative z-10 shadow-3xl shadow-accent/40 transform rotate-12 hover:rotate-0 transition-transform duration-1000">
            <ShieldCheck size={64} className="text-primary" />
          </div>
        </div>

        <div className="text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-6xl md:text-8xl font-display font-black tracking-tighter mb-6 text-white uppercase italic leading-none"
          >
            Family<span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">First</span>
          </motion.h1>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
            className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-8" 
          />
          
          <div className="space-y-4">
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1.5, duration: 1 }}
               className="text-accent/60 font-black tracking-[0.8em] text-[12px] uppercase leading-none"
             >
               Premium Care Ecosystem
             </motion.p>
             
             <div className="flex items-center justify-center gap-4 py-4">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] italic">BOOTING_ENVIRONMENT_v4.2</p>
             </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.5 }}
        className="absolute bottom-24 flex flex-col items-center gap-6"
      >
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                opacity: [0.1, 1, 0.1],
                scale: [1, 1.5, 1],
                y: [0, -4, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                delay: i * 0.4 
              }}
              className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_rgba(255,174,0,0.5)]"
            />
          ))}
        </div>
        <p className="text-[9px] font-black text-white/5 uppercase tracking-[1em] italic select-none">UNAUTHORIZED ACCESS_REJECTED</p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
