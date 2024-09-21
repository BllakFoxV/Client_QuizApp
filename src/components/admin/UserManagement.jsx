import React, { useEffect, useRef, useCallback } from 'react';
import { FaUserCircle } from 'react-icons/fa';

const UserManagement = ({ users, handleUserAction, setFilteredUsers, loadMoreUsers, hasMore }) => {
    const observer = useRef();
    const lastUserElementRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreUsers();
            }
        });
        if (node) observer.current.observe(node);
    }, [hasMore, loadMoreUsers]);

    return (
        <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quản Lý Người Dùng</h2>

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
                {users.length === 0 ? (
                    <p className="text-center py-4">Không có người dùng nào.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {users.map((user, index) => (
                            <li key={user.id} ref={index === users.length - 1 ? lastUserElementRef : null}>
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
                )}
            </div>
            {hasMore && <p className="text-center mt-4">Đang tải thêm...</p>}
        </div>
    );
};

export default UserManagement;
