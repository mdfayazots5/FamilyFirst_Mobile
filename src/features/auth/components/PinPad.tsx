import React from 'react';
import { motion } from 'motion/react';
import { Delete } from 'lucide-react';

interface PinPadProps {
  onPinChange: (pin: string) => void;
  pin: string;
  maxLength?: number;
}

const PinPad: React.FC<PinPadProps> = ({ onPinChange, pin, maxLength = 4 }) => {
  const handleNumberClick = (num: string) => {
    if (pin.length < maxLength) {
      onPinChange(pin + num);
    }
  };

  const handleDelete = () => {
    onPinChange(pin.slice(0, -1));
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

  return (
    <div className="grid grid-cols-3 gap-6 max-w-[320px] mx-auto">
      {numbers.map((num, index) => {
        if (num === '') return <div key={`empty-${index}`} />;
        
        if (num === 'delete') {
          return (
            <motion.button
              key="delete"
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              className="w-20 h-20 flex items-center justify-center text-gray-300 hover:text-alert hover:bg-alert/5 rounded-[24px] transition-all"
            >
              <Delete size={32} strokeWidth={1} />
            </motion.button>
          );
        }

        return (
          <motion.button
            key={num}
            whileHover={{ 
               scale: 1.05, 
               backgroundColor: '#FFFFFF', 
               borderColor: 'rgba(26, 46, 74, 0.2)',
               boxShadow: '0 20px 40px -12px rgba(26, 46, 74, 0.1)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNumberClick(num)}
            className="w-20 h-20 rounded-[28px] border-2 border-black/[0.03] flex items-center justify-center text-3xl font-display font-black text-primary transition-all shadow-sm bg-gray-50/50 italic leading-none"
          >
            {num}
          </motion.button>
        );
      })}
    </div>
  );
};

export default PinPad;
