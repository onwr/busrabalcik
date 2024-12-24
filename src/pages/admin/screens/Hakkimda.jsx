import { doc, getDoc, setDoc } from "firebase/firestore";
import { UploadIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { db } from "../../../db/Firebase";
import Loader from "../../../layout/Loader";

const Hakkimda = () => {
  const [hakkimdaData, setHakkimdaData] = useState({
    baslik: "",
    metin: "",
    resim: "",
  });
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const veriCek = async () => {
      try {
        setLoading(true);
        const hakkimdaRef = doc(db, "hakkinda", "metin");
        const hakkimdaSnap = await getDoc(hakkimdaRef);

        if (hakkimdaSnap.exists()) {
          setHakkimdaData(hakkimdaSnap.data());
        } else {
          console.error("Belirtilen doküman bulunamadı.");
        }
      } catch (error) {
        console.error("Veri çekme sırasında hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    veriCek();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHakkimdaData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result);
        setHakkimdaData((prev) => ({ ...prev, resim: reader.result }));
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSave = async () => {
    try {
      const hakkimdaRef = doc(db, "hakkinda", "metin");
      await setDoc(hakkimdaRef, hakkimdaData);
      alert("Bilgiler başarıyla güncellendi!");
    } catch (error) {
      console.error("Veri kaydetme sırasında hata oluştu:", error);
    }
  };

  return (
    <div className="container max-w-screen-xl bg-white p-5 border rounded-lg">
      <p className="text-2xl font-semibold">Hakkımda</p>

      {loading ? (
        <Loader />
      ) : (
        <div className="my-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Başlık</label>
            <input
              type="text"
              name="baslik"
              value={hakkimdaData.baslik}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Metin</label>
            <textarea
              name="metin"
              value={hakkimdaData.metin}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              rows="5"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium">Resim Yükle</label>
            <input type="file" onChange={handleFileChange} className="w-full" />
          </div>

          {hakkimdaData.resim && (
            <div className="mt-4">
              <p className="text-sm font-medium">Yüklenen Resim:</p>
              <img
                src={hakkimdaData.resim}
                alt="Yüklenen"
                className="mt-2 w-full max-w-md rounded"
              />
            </div>
          )}

          <button
            onClick={handleSave}
            className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
          >
            Kaydet
          </button>
        </div>
      )}
    </div>
  );
};

export default Hakkimda;
