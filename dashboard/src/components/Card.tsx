import { motion } from 'framer-motion';
import { CardProps } from '../types';
import { cn } from '../utils';

export const Card = ({ children, className, hover = false, ...props }: CardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "glass p-6",
                hover && "hover:bg-white/5 transition-colors duration-300",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
