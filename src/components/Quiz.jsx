import React, { useState, useEffect, useRef } from 'react';
import { FaClock, FaCheck, FaTimes, FaRedo, FaTachometerAlt, FaMoon, FaSun, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom';
import LoadingSpinner from './Loading';
import Notification from './Notification';
import axios from 'axios';

const QuizPage = (props) => {
  const [searchParams] = useSearchParams();
  const indexedAnswer = ['A', 'B', 'C', 'D'];
  const count = searchParams.get('count');

  const token = localStorage.getItem('token');

  const [resultId, setResultId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const timeLeftRef = useRef(0);
  const timerRef = useRef(null);

  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const [isLoading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const [score, setScore] = useState(0);

  const [timeInterval, setTimeInterval] = useState(null);

  const getPercentMessage = (percentage) => {
    if (percentage < 20) return 'Cần Cố Gắng Hơn Nữa';
    if (percentage < 40) return 'Còn Nhiều Điểm Cần Cải Thiện';
    if (percentage < 60) return 'Đang Tiến Bộ';
    if (percentage < 80) return 'Khá Tốt';
    if (percentage < 100) return 'Rất Tốt';
    return 'Xuất Sắc';
  };

  useEffect(() => {
    setDarkMode(localStorage.getItem('darkMode') === 'true');
    setLoading(true);
    if (!token) {
      navigate('/login');
    }

    handleResetQuiz();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [count]);


  const fetchQuestions = async () => {
    const URL = `/api/quiz/get-package?count=${count}`;
    try {
      const response = await axios.get(URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      let { questions, result_id } = response.data;
      questions.forEach(question => {
        question.options = [question.option_a, question.option_b, question.option_c, question.option_d];
        try {
          question.correctAnswer = question.options[indexedAnswer.indexOf(question.correct_answer)];
          question.userAnswer = null;
        } catch (error) {
          question.correctAnswer = "";
        }
      });
      setQuestions(questions);
      setResultId(result_id);
      setLoading(false);

    } catch (error) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        console.log(error);
        setError(error.response.data.message);

        setLoading(false);
      }
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  const handleAnswerClick = (option) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestion].userAnswer = option;
    setQuestions(newQuestions);
  };


  const handleNextQuestion = (step) => {
    setCurrentQuestion(currentQuestion + step);
  };

  const updateScoreToAPI = async (score) => {
    const URL = `/api/user/update-score`;
    try {
      const response = await axios.post(URL, {
        result_id: resultId,
        score: score
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },

      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCompleteQuiz = () => {
    setIsQuizCompleted(true);
    clearInterval(timerRef.current);
    const newScore = questions.reduce((acc, question) => {
      return acc + (question.userAnswer === question.correctAnswer ? 1 : 0);
    }, 0);
    setScore(newScore);
    updateScoreToAPI(newScore);
  };

  const handleResetQuiz = () => {
    fetchQuestions();
    setIsQuizCompleted(false);
    setScore(0);
    setCurrentQuestion(0);

    // Clear existing interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Set initial time
    const initialTime = count * 60; // Assuming 60 seconds per question
    setTimeLeft(initialTime);
    timeLeftRef.current = initialTime;

    // Set new interval
    timerRef.current = setInterval(() => {
      if (timeLeftRef.current > 0) {
        timeLeftRef.current -= 1;
        setTimeLeft(timeLeftRef.current);
      } else {
        clearInterval(timerRef.current);
        handleCompleteQuiz();
      }
    }, 1000);
  };


  if (isLoading) {

    return <LoadingSpinner />;
  }
  if (error) {
    return <Notification message={error} onConfirm={() => navigate('/')} />;
  }
  if (isQuizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="flex w-full max-w-6xl gap-4 justify-center">
          <div className={`p-8 rounded-lg shadow-xl w-2/3 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
            <div className='flex flex-col items-center'>
              <h1 className="text-2xl font-bold mb-6">Kết Quả Bài Kiểm Tra</h1>
              <div className="mb-6 text-center">
                <p className="text-xl">Điểm số: {score}/{questions.length}</p>
                <p className="text-xl">Tỷ lệ đúng: {percentage}%</p>
                <p className="text-xl">{getPercentMessage(percentage)}</p>
              </div>
              <div className="flex justify-between mt-2 gap-4">
                <button
                  onClick={handleResetQuiz}
                  className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Thử Lại
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Trở về Trang Chủ
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="border-b pb-4">
                  <h2 className="text-lg font-semibold mb-2">Câu hỏi {index + 1}: {question.text}</h2>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      if (option === "") return null;
                      const isUserAnswer = option === question.userAnswer;
                      const isCorrectAnswer = option === question.correctAnswer;
                      return (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded ${isUserAnswer
                              ? isCorrectAnswer
                                ? 'bg-green-200 text-black'
                                : 'bg-red-200 text-black'
                              : isCorrectAnswer
                                ? 'bg-green-100 text-black'
                                : ''
                            }`}

                        >
                          {option}
                          {isUserAnswer && (
                            <span className="ml-2">
                              {isCorrectAnswer ? (
                                <FaCheckCircle className="text-green-500 inline" />
                              ) : (
                                <FaTimesCircle className="text-red-500 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex  mt-2 gap-4 items-center w-full">
              <button
                onClick={handleResetQuiz}

                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Thử Lại
              </button>
              <button
                onClick={() => navigate('/')}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Trở về Trang Chủ
              </button>
            </div>
          </div>

        </div>
      </div>

    );
  }
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="h-1/2 items-center justify-center flex-grow flex flex-col md:flex-row w-full max-w-6xl mx-auto p-4 gap-4">
        <div className={`p-4 md:p-8 rounded-lg shadow-xl w-full md:w-3/4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">Câu Hỏi {currentQuestion + 1}/{questions.length}</h1>
            <div className="flex items-center">
              <div className="flex items-center text-lg md:text-xl font-semibold mr-4">
                <FaClock className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60}s
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-yellow-400'}`}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
            </div>
          </div>

          <h2 className="text-lg md:text-xl mb-6">{questions[currentQuestion].text}</h2>

          <div className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => {
              if (option === "") return null;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  className={`w-full p-3 md:p-4 text-left rounded-lg transition duration-300 ${questions[currentQuestion].userAnswer === option
                      ? 'bg-green-500 text-white'
                      : darkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end mt-6 gap-4">
            <button
              onClick={() => handleNextQuestion(-1)}

              className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm md:text-base"
              disabled={currentQuestion === 0}
            >
              Trước Đó
            </button>
            <button
              onClick={() => handleNextQuestion(1)}
              className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm md:text-base"
              disabled={currentQuestion === questions.length - 1}
            >
              Tiếp Theo
            </button>
            <button
              onClick={() => handleCompleteQuiz()}
              className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm md:text-base"
            >
              Nộp Bài
            </button>

          </div>
        </div>

        {!isQuizCompleted && (
          <div className="mt-4 md:mt-0">
            <div className="grid grid-cols-10 md:grid-cols-10 gap-1">
              {questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-12 mr-5 aspect-square flex items-center justify-center rounded-lg transition duration-300 ${
                    questions[index].userAnswer
                      ? 'bg-green-500 text-white'

                      : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  } ${index === currentQuestion ? 'bg-blue-500 text-white' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default QuizPage;