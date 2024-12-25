import React, { useState } from "react";
import Header from "../components/Header";
import { Send, Mail, User, MessageSquare } from "lucide-react";
import Footer from "../components/Footer";
import tiktok from "../images/tiktok.png";

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
        body: JSON.stringify(formData),
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
    <>
      <Header />
      <div className="py-16 dark:bg-black/90 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              İletişim
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-200">
              Benimle iletişime geçin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <div className="bg-white/50 dark:bg-white backdrop-blur rounded-xl shadow-xl p-6 space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                  Sosyal Medya
                </h3>

                <a
                  href="https://www.instagram.com/deppworth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                    <svg
                      className="w-6 h-6 mr-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <div>
                      <div className="font-semibold">Instagram</div>
                      <div className="text-sm opacity-90">Beni takip edin</div>
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.tiktok.com/@deppworth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="flex items-center p-4 bg-gradient-to-r from-slate-400 to-gray-800 text-white rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                    <img src={tiktok} className="w-6 h-6 mr-3" alt="" />
                    <div>
                      <div className="font-semibold">TikTok</div>
                      <div className="text-sm opacity-90">
                        Videolarıma göz atın
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="md:col-span-8">
              <div className="bg-white/50 dark:bg-white backdrop-blur rounded-xl shadow-xl p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 text-sm font-semibold mb-2">
                      <User size={18} className="text-gray-600" />
                      <span>Adınız</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-700 text-sm font-semibold mb-2">
                      <Mail size={18} className="text-gray-600" />
                      <span>E-posta Adresiniz</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-700 text-sm font-semibold mb-2">
                      <MessageSquare size={18} className="text-gray-600" />
                      <span>Mesajınız</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin">
                        <Send size={20} />
                      </div>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Gönder</span>
                      </>
                    )}
                  </button>

                  {submitStatus && (
                    <div
                      className={`mt-4 p-3 rounded-lg text-center ${
                        submitStatus === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {submitStatus === "success"
                        ? "Mesajınız başarıyla gönderildi!"
                        : "Bir hata oluştu. Lütfen tekrar deneyin."}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Contact;
