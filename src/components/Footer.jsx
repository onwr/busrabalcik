import React from "react";
import { Instagram } from "lucide-react";
import { motion } from "framer-motion";
import tiktok from "../images/tiktok.png";

const Footer = () => {
  const socialLinks = [
    {
      icon: <Instagram size={20} />,
      url: "https://www.instagram.com/deppworth/",
      delay: 0.2,
    },
    {
      icon: <img src={tiktok} width="20" />,
      url: "https://www.tiktok.com/@deppworth",
      delay: 0.4,
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="dark:bg-black dark:text-white bg-black/5 text-gray-600">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-6"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                className="text-black p-1 rounded-full bg-white transform hover:-translate-y-1 transition-all duration-300"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: social.delay }}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full my-4"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />

          <motion.p
            className="text-sm text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            © {currentYear} Anıl Cenan. All Rights Reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
