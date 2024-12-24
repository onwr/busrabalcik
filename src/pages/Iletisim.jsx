import React, { useState } from "react";
import { Send, Mail, User, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/mbljelja", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="bg-gray-50 py-16 mb-0.5 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">İletişim</h2>
            <p className="mt-2 text-gray-600">Benimle iletişime geçin</p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6">
              <label className=" text-gray-700 text-sm font-bold mb-2 flex items-center gap-2">
                <User size={18} />
                <span>Adınız</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-700 text-sm font-bold mb-2 flex items-center gap-2">
                <Mail size={18} />
                <span>E-posta Adresiniz</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="mb-6">
              <label className="text-gray-700 text-sm font-bold mb-2 flex items-center gap-2">
                <MessageSquare size={18} />
                <span>Mesajınız</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition-all h-32 resize-none"
                required
              />
            </div>

            <motion.button
              type="submit"
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Send size={20} />
                </motion.div>
              ) : (
                <>
                  <Send size={20} />
                  <span>Gönder</span>
                </>
              )}
            </motion.button>

            {submitStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-lg text-center ${
                  submitStatus === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {submitStatus === "success"
                  ? "Mesajınız başarıyla gönderildi!"
                  : "Bir hata oluştu. Lütfen tekrar deneyin."}
              </motion.div>
            )}
          </motion.form>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
