import React, { useCallback, useEffect, useState } from 'react';
import { FaTrophy, FaQuestionCircle, FaLock, FaSpinner, FaSignOutAlt, FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './Loading';
import QuizPage from './Quiz';
import Notification from './Notification';
import axios from 'axios';


const DashboardPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [fullname, setFullname] = useState('');
  const [lastScore, setLastScore] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const quizPacks = [
    { count: 20, color: 'bg-green-500', title: 'Sơ Cấp' },
    { count: 40, color: 'bg-yellow-500', title: 'Trung Cấp' },
    { count: 60, color: 'bg-red-500', title: 'Cao Cấp' }
  ];

  const getUserInfo = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const API_URL = `${import.meta.env.VITE_API_URL}/user/info`;
      const response = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const { user, last_score } = response.data;
        setFullname(user.fullname);
        setLastScore(last_score);
        setIsLoading(false);
        if(user.is_active === 0){
          setNotificationMessage('Tài khoản của bạn chưa được Kích hoạt, vui lòng liên hệ admin để kích hoạt tài khoản');
          setShowNotification(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    getUserInfo();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu không khớp');
      return;
    }

    if(newPassword.length < 8){
      alert('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    
    const API_URL = `${import.meta.env.VITE_API_URL}/user/update-password`;
    const response = await axios.post(API_URL, {
      old_password: oldPassword,
      new_password: newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      alert('Thành Công');
      
    } else {
      alert('Đổi mật khẩu thất bại');
    }

    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');

  };

  const handleStartQuiz = (count) => {
    navigate(`/quiz?count=${count}`);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    setIsLoading(true);
    localStorage.removeItem('token');
    navigate('/login');
    return;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if(showNotification){
    return <Notification message={notificationMessage} onConfirm={() => setShowNotification(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-opacity-90 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')"}}>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Welcome, {fullname}!</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-300 flex items-center"
            >
              <FaLock className="mr-2" />
              Đổi Mật Khẩu
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition duration-300 flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Đăng Xuất
            </button>
          </div>
        </div>
        
        <div className="mb-8 bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
            <FaTrophy className="mr-2 text-yellow-400" />
            Điểm Lần Trước
          </h2>
          <p className="text-4xl font-bold text-blue-400">{lastScore}</p>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-white">Các Gói Câu Hỏi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizPacks.map((pack, index) => (
            <div key={index} className={`${pack.color} p-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105`}>
              <h3 className="text-xl font-bold mb-2 text-gray-900 flex items-center">
                <FaQuestionCircle className="mr-2" />
                Gói {pack.title} ({pack.count} Câu Hỏi)
              </h3>
              <button className="mt-4 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300"
                onClick={() => handleStartQuiz(pack.count)}
              >
                Bắt Đầu
              </button>
            </div>
          ))}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Đổi Mật Khẩu</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Mật Khẩu Cũ"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật Khẩu Mới"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác Nhận Mật Khẩu Mới"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Đổi Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Xác nhận đăng xuất</h2>
            <p className="mb-6 text-gray-600">Bạn có chắc chắn muốn đăng xuất?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
