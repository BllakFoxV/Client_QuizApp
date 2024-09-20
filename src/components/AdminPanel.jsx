import React, { useState, useEffect } from "react";
import { FaUserCircle, FaQuestionCircle, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import axios from "axios";
import LoadingSpinner from "./Loading";
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminPanel = () => {
    const [isLoading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");

    const [fullname, setFullname] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);

    const [stats, setStats] = useState({ totalUsers: 0, totalQuestions: 0, completionRate: 0 });
    const [filteredUsers, setFilteredUsers] = useState(null);
    const [filteredQuestions, setFilteredQuestions] = useState(null);
    const [newQuestion, setNewQuestion] = useState({ text: "", options: ["", "", "", ""], correctAnswer: "" });
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null });
    const [notification, setNotification] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const indexAnswer = ['A', 'B', 'C', 'D'];
    const navigate = useNavigate();
    useEffect(() => {
        setLoading(true);
        checkAdmin();
        getUsers();
        getQuestions();
        setLoading(false);
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const checkAdmin = async () => {
        const API_URL = `${import.meta.env.VITE_API_URL}/admin/auth`;
        const response = await axios.get(API_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = response.data;
        if (!data.is_admin) {
            navigate('/');
            return;
        }
        setFullname(data.fullname);
        setLoading(false);
    };

    const getQuestions = async () => {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/all-questions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const { questions } = await response.data;
        if (questions) {
            questions.forEach(q => {
                q.options = [q.option_a, q.option_b, q.option_c, q.option_d];
                try {
                    q.correctAnswer = q.options[indexAnswer.indexOf(q.correct_answer)];
                } catch (error) {
                    q.correctAnswer = "";
                }
            });
            setQuestions(questions);
        }
        setStats(prevStats => ({ ...prevStats, totalQuestions: questions.length }));
    };

    const getUsers = async () => {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const { users } = await response.data;
        const usersSorted = users.sort((a, b) => b.fullname.localeCompare(a.fullname) && b.email.localeCompare(a.email));
        setUsers(usersSorted);
        setFilteredUsers(null);
        setStats(prevStats => ({ ...prevStats, totalUsers: users.length }));
        setLoading(false);
    };
    const chartData = {
        labels: ["Completed", "Incomplete"],
        datasets: [
            {
                data: [stats.completionRate, 100 - stats.completionRate],
                backgroundColor: ["#4CAF50", "#F44336"],
                hoverBackgroundColor: ["#45a049", "#da190b"],
            },
        ],
    };

    const handleUserAction = async (action, userId) => {
        if (action === "delete") {
            setDeleteModal({ isOpen: true, type: 'user', id: userId });
        }
        else if (action === "activate" || action === "deactivate") {
            setLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/users/set-active`, {
                is_active: action === "activate",
                user_id: userId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                action === "activate" ? showNotification(`Kích hoạt thành công`) : showNotification(`Khóa thành công`);
            }
        }
        await getUsers();
    };

    const getRawCorrectAnswer = (question) => {
        try {
            index = parseInt(question.correct_answer) - 65;
            return question.options[index];
        }
        catch (error) {
            return "";
        }
    }

    const buildQuestionData = (question) => {
        const indexCorrect = question.options.indexOf(question.correctAnswer);
        let charCorrectAnswer = String.fromCharCode(65 + indexCorrect)
        if (indexAnswer.indexOf(charCorrectAnswer) === -1) {
            charCorrectAnswer = 'A'
        }
        return {
            text: question.text,
            option_a: question.options[0],
            option_b: question.options[1],
            option_c: question.options[2],
            option_d: question.options[3],
            options: question.options,
            correct_answer: String.fromCharCode(65 + indexCorrect)
        }
    }
    const handleBeforeAddQuestion = () => {
        setNewQuestion({ text: "", options: ["", "", "", ""], correctAnswer: "" });
        setIsAddModalOpen(true);
    }
    const handleQuestionAction = async (action, questionId) => {
        if (action === "add") {
            if (newQuestion.text === "" || newQuestion.options.some(option => option === "") || newQuestion.correctAnswer === "") {
                showNotification("Please fill in all fields", "error");
                return;
            }

            const data = buildQuestionData(newQuestion);
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/questions`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.status === 201) {
                    showNotification(`Question added successfully`);
                    await getQuestions();
                }
            } catch (error) {
                showNotification(`Failed to add question: ${error.message}`, 'error');
            } finally {
                setIsAddModalOpen(false);
            }
        } else if (action === "edit") {
            setEditingQuestion(questions.find(q => q.id === questionId));
            setIsEditModalOpen(true);
        } else if (action === "update") {
            const question = editingQuestion;
            if (questionId === "" || question.id === "" || question.text === "") {
                return;
            }

            const data = buildQuestionData(question);
            console.log(data);
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/admin/questions/${question.id}`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                showNotification(`Cập nhật thành công`);
                await getQuestions();
            }
            setIsEditModalOpen(false);
        } else if (action === "delete") {
            setDeleteModal({ isOpen: true, type: 'question', id: questionId });
        }
    };

    const confirmDelete = async () => {
        setLoading(true);
        const { type, id } = deleteModal;
        let api, successMessage;

        if (type === 'user') {
            api = `${import.meta.env.VITE_API_URL}/admin/users/${id}`;
            successMessage = 'Đã xoá người dùng thành công';
        } else if (type === 'question') {
            api = `${import.meta.env.VITE_API_URL}/admin/questions/${id}`;
            successMessage = 'Đã xoá câu hỏi thành công';
        }

        try {
            const response = await axios.delete(api, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                showNotification(successMessage);
                if (type === 'user') {
                    await getUsers();
                } else if (type === 'question') {
                    setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== id));
                }
            }
        } catch (error) {
            showNotification(`Xoá thất bại: ${error.message}`, 'error');
        }
        setLoading(false);
        setDeleteModal({ isOpen: false, type: null, id: null });
    };

    if (isLoading) {
        return <LoadingSpinner />
    }
    return (
        <div className="min-h-screen bg-gray-100">
            {deleteModal.isOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Xác nhận xoá {deleteModal.type === 'user' ? 'người dùng' : 'câu hỏi'}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Bạn có chắc chắn muốn xoá {deleteModal.type === 'user' ? 'người dùng' : 'câu hỏi'} này? Hành động này không thể hoàn tác.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" onClick={confirmDelete} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    Xoá
                                </button>
                                <button type="button" onClick={() => setDeleteModal({ isOpen: false, type: null, id: null })} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    Huỷ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {notification && (
                <div className={`fixed top-16 right-4 px-4 py-2 rounded-md text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                    {notification.message}
                </div>
            )}
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-2xl font-bold text-gray-800 cursor-pointer" onClick={() => setActiveTab("dashboard")}>Admin Panel</h1>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <button
                                    onClick={() => setActiveTab("dashboard")}
                                    className={`${activeTab === "dashboard"
                                        ? "border-indigo-500 text-gray-900"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setActiveTab("users")}
                                    className={`${activeTab === "users"
                                        ? "border-indigo-500 text-gray-900"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Users
                                </button>
                                <button
                                    onClick={() => setActiveTab("questions")}
                                    className={`${activeTab === "questions"
                                        ? "border-indigo-500 text-gray-900"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Câu Hỏi
                                </button>
                            </div>
                        </div>
                        {/* Add welcome text here */}
                        <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-700">Welcome, {fullname}</p>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {activeTab === "dashboard" && (
                    <div className="px-4 py-6 sm:px-0">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Số Lượng Người Dùng</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalUsers}</dd>
                                    </dl>
                                    <div className="mt-4 sm:hidden">
                                        <button
                                            onClick={() => setActiveTab("users")}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Quản Lý Người Dùng
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Số Lượng Câu Hỏi</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalQuestions}</dd>
                                    </dl>
                                    <div className="mt-4 sm:hidden">
                                        <button
                                            onClick={() => setActiveTab("questions")}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Quản Lý Câu Hỏi
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Tỷ Lệ Hoàn Thành</dt>
                                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.completionRate}%</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Thống Kê Hoàn Thành</h3>
                                <div className="w-full h-64">
                                    <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "users" && (
                    <div className="px-4 py-6 sm:px-0">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quản Lý Người Dùng</h2>

                        {/* Add search bar */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo email hoặc tên..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                onChange={(e) => {
                                    const searchTerm = e.target.value.toLowerCase();
                                    const filteredUsers = users.filter(user =>
                                        user.email.toLowerCase().includes(searchTerm) ||
                                        user.fullname.toLowerCase().includes(searchTerm)
                                    );
                                    setFilteredUsers(filteredUsers);
                                }}
                            />
                        </div>

                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {(filteredUsers || users).map((user) => (
                                    <li key={user.id}>
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center flex-grow">
                                                    <FaUserCircle className="h-10 w-10 text-gray-400" />
                                                    <div className="ml-4 flex-grow">
                                                        <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-500 ml-4 flex-grow text-center">{user.is_admin ? 'Admin' : 'User'}</div>
                                                </div>
                                                <div className="flex space-x-2 ml-4">
                                                    <button
                                                        onClick={() => handleUserAction(user.is_active ? "deactivate" : "activate", user.id)}
                                                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${user.is_active ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200" : "text-green-700 bg-green-100 hover:bg-green-200"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                                    >
                                                        {user.is_active ? "Khóa" : "Kích Hoạt"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUserAction("delete", user.id)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Xoá
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === "questions" && (
                    <div className="px-4 py-6 sm:px-0">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quản Lý Câu Hỏi</h2>
                        <div className="mb-4">
                            <button
                                onClick={() => handleBeforeAddQuestion()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                                Thêm Câu Hỏi
                            </button>
                        </div>
                        {/* Add search bar for questions */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Tìm kiếm câu hỏi..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                onChange={(e) => {
                                    const searchTerm = e.target.value.toLowerCase();
                                    if (searchTerm === '') {
                                        setFilteredQuestions(null);
                                    } else {
                                        const filtered = questions.filter(question =>
                                            question.text.toLowerCase().includes(searchTerm)
                                        );
                                        setFilteredQuestions(filtered);
                                    }
                                }}
                            />
                        </div>

                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {(filteredQuestions || questions || []).map((question) => (
                                    <li key={question.id}>
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{question.text}</div>
                                                    <div className="text-sm text-gray-500">
                                                        <ul className="list-disc list-inside">
                                                            {question.options.map((option, index) => (
                                                                <li key={index} className={option === question.correctAnswer ? "font-semibold text-green-500" : ""}>
                                                                    {option}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleQuestionAction("edit", question.id)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        <FaEdit className="-ml-0.5 mr-2 h-4 w-4" /> Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleQuestionAction("delete", question.id)}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        <FaTrash className="-ml-0.5 mr-2 h-4 w-4" /> Xoá
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </main>

            {/* Edit Question Modal */}
            <Transition appear show={isEditModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsEditModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Chỉnh Sửa Câu Hỏi
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <div>
                                            <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">
                                                Nội Dung Câu Hỏi
                                            </label>
                                            <input
                                                type="text"
                                                id="questionText"
                                                value={editingQuestion?.text}
                                                onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                        {editingQuestion?.options.map((option, index) => (
                                            <div key={index}>
                                                <label htmlFor={`option${index + 1}`} className="block text-sm font-medium text-gray-700">
                                                    Đáp Án {index + 1}
                                                </label>
                                                <input
                                                    type="text"
                                                    id={`option${index + 1}`}
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...editingQuestion.options];
                                                        newOptions[index] = e.target.value;
                                                        setEditingQuestion({ ...editingQuestion, options: newOptions });
                                                    }}
                                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700">
                                                Đáp Án Đúng
                                            </label>
                                            <select
                                                id="correctAnswer"
                                                value={editingQuestion?.correctAnswer}
                                                onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                {editingQuestion?.options.map((option, index) => (
                                                    <option key={index} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => handleQuestionAction("update")}
                                        >
                                            Cập Nhật Câu Hỏi
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Add Question Modal */}
            <Transition appear show={isAddModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsAddModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Thêm Câu Hỏi Mới
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <div>
                                            <label htmlFor="newQuestionText" className="block text-sm font-medium text-gray-700">
                                                Nội Dung Câu Hỏi
                                            </label>
                                            <input
                                                type="text"
                                                id="newQuestionText"
                                                value={newQuestion.text}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                        {newQuestion.options.map((option, index) => (
                                            <div key={index}>
                                                <label htmlFor={`newOption${index + 1}`} className="block text-sm font-medium text-gray-700">
                                                    Đáp Án {index + 1}
                                                </label>
                                                <input
                                                    type="text"
                                                    id={`newOption${index + 1}`}
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...newQuestion.options];
                                                        newOptions[index] = e.target.value;
                                                        setNewQuestion({ ...newQuestion, options: newOptions });
                                                    }}
                                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <label htmlFor="newCorrectAnswer" className="block text-sm font-medium text-gray-700">
                                                Đáp Án Đúng
                                            </label>
                                            <select
                                                id="newCorrectAnswer"
                                                value={newQuestion.correctAnswer}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                <option value=""></option>
                                                {newQuestion.options.map((option, index) => (
                                                    <option key={index} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => handleQuestionAction("add")}
                                        >
                                            Thêm Câu Hỏi
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default AdminPanel;
