import React, { useState } from "react";
import { Send, CheckCircle, Mail, User, MessageSquare } from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

export default function Contact() {
  useScrollToTop();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  function validate() {
    if (!name.trim()) return "Vui lòng nhập tên.";
    if (!email.trim()) return "Vui lòng nhập email.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Email không hợp lệ.";
    if (!message.trim()) return "Vui lòng nhập nội dung.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setStatus("sending");

    try {
      await new Promise((res) => setTimeout(res, 1000));
      setStatus("success");
      setTimeout(() => {
        setName("");
        setEmail("");
        setMessage("");
        setStatus("idle");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setError("Gửi không thành công, vui lòng thử lại.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2fd680] mb-6">
            Hãy kết nối với chúng tôi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gửi tin nhắn cho chúng tôi và chúng tôi sẽ phản hồi sớm nhất có thể.
            Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-4 rounded-xl">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600 mb-2">Liên hệ qua email</p>
                  <a href="mailto:contact@hotelhub.vn" className="text-blue-600 font-semibold hover:text-blue-700">
                    contact@hotelhub.vn
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-4 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Hotline</h3>
                  <p className="text-gray-600 mb-2">Hỗ trợ 24/7</p>
                  <a href="tel:1900123456" className="text-green-600 font-semibold hover:text-green-700">
                    1900 123 456
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-green-500 text-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-3">Giờ làm việc</h3>
              <div className="space-y-2 text-white/90">
                <p>Thứ 2 - Thứ 6: 8:00 - 22:00</p>
                <p>Thứ 7 - Chủ nhật: 9:00 - 20:00</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-gray-100">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-green-100 p-6 rounded-full mb-6 animate-bounce">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Gửi thành công!
                </h3>
                <p className="text-gray-600 text-lg">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gửi tin nhắn
                </h2>

                <div className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên của bạn"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nội dung
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-4 text-gray-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        placeholder="Nhập nội dung tin nhắn của bạn..."
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 resize-none font-medium"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={status === "sending"}
                    className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-green-600 hover:to-green-700 text-white font-bold py-5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
                  >
                    {status === "sending" ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Gửi liên hệ
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
