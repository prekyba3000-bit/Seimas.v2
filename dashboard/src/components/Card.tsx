import { motion } from 'framer-motion';
import { CardProps } from '../types';
import { cn } from '../utils';

export const Card = ({ children, className, hover = false, ...props }: CardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "holo-card glow-gold p-6 rounded-sm transition-all duration-300",
                hover && "hover:bg-white/5 cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
