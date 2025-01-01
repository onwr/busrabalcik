import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Hakkimda from "./screens/Hakkimda";
import Anasayfa from "./screens/Anasayfa";
import Kitaplar from "./screens/Kitaplar";
import { db } from "../../db/Firebase";
import { doc, getDoc } from "firebase/firestore";

const Panel = () => {
  const [screen, setScreen] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("aniliscenanisAdminLoggedenIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "admin", "bilgiler");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const adminData = docSnap.data();
        if (adminData.kullanici === username && adminData.sifre === password) {
          setIsLoggedIn(true);
          localStorage.setItem("aniliscenanisAdminLoggedenIn", "true");
          setError("");
        } else {
          setError("Kullanıcı adı veya şifre hatalı!");
        }
      } else {
        setError("Admin bilgileri bulunamadı!");
      }
    } catch (error) {
      setError("Giriş yapılırken bir hata oluştu!");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Yönetici Girişi
          </h2>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Giriş Yap
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar screen={setScreen} value={screen} />
      <div className="bg-neutral-50/50 shadow-inner w-full flex items-center justify-center">
        {screen === 0 && <Hakkimda />}
        {screen === 1 && <Anasayfa />}
        {screen === 2 && <Kitaplar />}
      </div>
    </div>
  );
};

export default Panel;
