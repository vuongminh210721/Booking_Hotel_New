import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState<string | null>(null);
   const navigate = useNavigate();

   const validate = () => {
      if (!email.trim()) return "Vui lòng nhập email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ.";
      if (!password) return "Vui lòng nhập mật khẩu.";
      return null;
   };

   const submit = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const v = validate();
      if (v) return setError(v);

      // NOTE: placeholder behaviour — integrate real auth later
      if (email === "test@example.com" && password === "password") {
         // pretend login succeeded
         navigate("/");
         return;
      }

      // no account found — show hint to register
      setError("Không tìm thấy tài khoản. Vui lòng đăng ký.");
   };

   return (
      <div className="max-w-xl mx-auto py-20 px-4">
         <div className="bg-white p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-bold mb-4">Đăng nhập</h2>
            <p className="text-sm text-gray-600 mb-6">Nếu chưa có tài khoản, vui lòng <Link to="/register" className="text-teal-600 font-medium">đăng ký</Link>.</p>
            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            <form onSubmit={submit}>
               <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded-md" placeholder="email@example.com" />
               </div>
               <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Mật khẩu</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded-md" placeholder="••••••••" />
               </div>
               <div className="flex items-center justify-between gap-4">
                  <button className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600">Đăng nhập</button>
                  <Link to="/register" className="text-sm text-gray-600 hover:underline"> Đăng ký</Link>
               </div>
            </form>
         </div>
      </div>
   );
}
