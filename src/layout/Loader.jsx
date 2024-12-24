import React from "react";
import { motion } from "framer-motion";
import { Loader2, BookOpen, Pen } from "lucide-react";

const SignatureLoader = () => {
  return (
    <div className="fixed inset-0 over flex z-50 items-center justify-center bg-gradient-to-br from-pink-900 to-gray-800">
      <div className="flex flex-col items-center gap-8 relative w-full">
        <motion.div
          className="absolute hidden md:block left-16 opacity-20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.2, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <BookOpen size={120} className="text-white" />
        </motion.div>

        <motion.div
          className="absolute hidden md:block right-16 opacity-20"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.2, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Pen size={120} className="text-white" />
        </motion.div>

        <div className="relative py-12">
          <motion.div
            className="text-5xl font-serif text-white tracking-wider"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.1,
              ease: "easeOut",
            }}
          >
            Buşra Balçık
          </motion.div>

          <motion.div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-0.5"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "12rem", opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.1 }}
            style={{
              background:
                "linear-gradient(90deg, transparent, white, transparent)",
            }}
          />
        </div>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.1 }}
        >
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <Loader2 className="w-5 h-5 text-white/80 animate-spin" />
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
        </motion.div>
      </div>
    </div>
  );
};

export default SignatureLoader;
