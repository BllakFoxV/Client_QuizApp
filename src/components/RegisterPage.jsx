import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
const RegistrationPage = () => {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ fullName: '', email: '', password: '' });
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleFullNameChange = (e) => {
    setFullname(e.target.value);
    if (e.target.value.length < 2) {
      setErrors({ ...errors, fullName: 'Họ và tên quá ngắn' });
    } else {
      setErrors({ ...errors, fullName: '' });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (!validateEmail(e.target.value)) {
      setErrors({ ...errors, email: 'Email không đúng định dạng' });
    } else {
      setErrors({ ...errors, email: '' });
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value.length < 8) {
      setErrors({ ...errors, password: 'Mật khẩu quá ngắn' });
    } else {
      setErrors({ ...errors, password: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!errors.fullName && !errors.email && !errors.password) {
      setIsLoading(true);
      if(!fullname || !email || !password){
        setIsLoading(false);
        setErrors({ ...errors, fullname: 'Họ và tên không được để trống', email: 'Email không được để trống', password: 'Mật khẩu không được để trống' });
      }
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/auth/register`;
        console.log('Attempting to register with URL:', apiUrl);
        
        const response = await axios.post(apiUrl, 
          { fullname, email, password },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if(response.status === 201){  
          setSuccess('Đăng ký thành công, Bạn Sẽ Được Chuyển Hướng Đến Trang Đăng Nhập Sau 5s');
          setTimeout(() => {
            navigate('/login');
          }, 5000);
        }
        else{
          const { data } = response;
          console.log(data);
          if(data.message){
            setErrors({ ...errors, email: data.message });
          }
        }
      } catch (error) {
        if(error.message){
          setErrors({ ...errors, email: error?.response?.data?.message });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-opacity-90 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')"}}>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Đăng Ký</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              value={fullname}
              onChange={handleFullNameChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Nhập họ và tên của bạn"
              aria-label="Full name"
              required
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Nhập email của bạn"
              aria-label="Email address"
              required
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="Nhập mật khẩu của bạn"
                aria-label="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                aria-label={showPassword ? 'Ẩn Mật Khẩu' : 'Hiện Mật Khẩu'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            {success && <p className="mt-1 text-xs text-green-400">{success}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Đang đăng ký...
              </>
            ) : (
              'Đăng Ký'
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300 transition duration-200">Đăng Nhập Ngay</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;