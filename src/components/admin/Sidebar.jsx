import React, { useState } from "react";
import { Home, User, Book, Menu } from "lucide-react";
import { motion } from "framer-motion";

const Sidebar = ({ screen, value }) => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    {
      id: 1,
      title: "Anasayfa Slider",
      icon: <Home size={20} />,
      screenValue: 1,
    },
    {
      id: 2,
      title: "Hakkımda",
      icon: <User size={20} />,
      screenValue: 0,
    },
    {
      id: 3,
      title: "Kitaplarım",
      icon: <Book size={20} />,
      screenValue: 2,
    },
  ];

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  return (
    <div className="relative lg:w-1/6">
      <button
        className="fixed top-4 left-4 z-20 bg-white p-2 rounded-full shadow-md lg:hidden"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Menu size={24} />
      </button>

      <motion.div
        className="bg-white flex flex-col items-center w-64 border-r-2 py-10 border-blue-100 min-h-screen fixed top-0 left-0 z-10 lg:static lg:w-full"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <p className="text-2xl font-semibold mb-8">Yönetim Paneli</p>

        <div className="flex flex-col w-full">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                screen(item.screenValue);
              }}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${
                value === item.screenValue
                  ? "bg-gray-100 border-r-4 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-5 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;
