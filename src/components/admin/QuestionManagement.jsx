import React, { useEffect, useRef, useCallback, useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const QuestionManagement = ({ questions, handleQuestionAction, handleBeforeAddQuestion, loadMoreQuestions, hasMore }) => {
    const [filteredQuestions, setFilteredQuestions] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const observer = useRef();

    const lastQuestionElementRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreQuestions();
            }
        });
        if (node) observer.current.observe(node);
    }, [hasMore, loadMoreQuestions]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = questions.filter(question => 
                question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                question.options.some(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredQuestions(filtered);
        } else {
            setFilteredQuestions(null);
        }
    }, [searchTerm, questions]);

    const displayedQuestions = filteredQuestions || questions;

    return (
        <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quản Lý Câu Hỏi</h2>
            
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={handleBeforeAddQuestion}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                    Thêm Câu Hỏi
                </button>
                <input
                    type="text"
                    placeholder="Tìm kiếm câu hỏi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-64 sm:text-sm border-gray-300 rounded-md"
                />
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {displayedQuestions.length === 0 ? (
                    <p className="text-center py-4">Không có câu hỏi nào.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {displayedQuestions.map((question, index) => (
                            <li key={question.id} ref={index === questions.length - 1 ? lastQuestionElementRef : null}>
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
                )}
            </div>
            {hasMore && <p className="text-center mt-4">Đang tải thêm...</p>}
        </div>
    );
};

export default QuestionManagement;
