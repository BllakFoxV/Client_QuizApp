import React, { useState, useEffect } from 'react';
import { FaClock, FaCheck, FaTimes, FaRedo, FaTachometerAlt, FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import LoadingSpinner from './Loading';
import axios from 'axios';

const QuizPage = (props, ) => {
  const [resultID, setResultID] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [quizData, setQuizData] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const count = searchParams.get('count');
  const questionCount = parseInt(count);
  const [darkMode, setDarkMode] = useState(false);

  const indexAnswer = ['A', 'B', 'C', 'D'];
  useEffect(() => {
    if (!questionCount || isNaN(questionCount) || parseInt(questionCount) === 0) {
      navigate('/');
      return;
    }
    getQuizData();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [timeLeft, quizCompleted]);

  const handleTimeUp = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(60); // Reset time for next question
    } else {
      finishQuiz();
    }
  };

  const getRawCorrectAnswer = (question) => {
    try{
      console.log(question.correct_answer)
      index = parseInt(question.correct_answer) - 65;
      return question.options[index];
    }catch(error){
      return "";
    }
  }
  const getQuizData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/quiz/get-package?count=${questionCount}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (response.status === 200) {
        const data = response.data;
        const questions = data.questions;
        if (questions.length === 0) {
          throw new Error('No questions found');
        }
        // Preprocess questions

        if (questions.length === 0) {
          setErrorMessage('Không Có Dữ Liệu Câu Hỏi');
          setShowErrorModal(true);
          setIsLoading(false);
          return;
        }

        questions.forEach(question => {
          question.options = [question.option_a, question.option_b, question.option_c, question.option_d];
          try{
            const charCorrectAnswer = question.correct_answer;
            question.correctAnswer = question.options[indexAnswer.indexOf(charCorrectAnswer)];
          }catch(error){
            console.error('Error fetching quiz data:', error);
            setErrorMessage(error.message || 'Lỗi khi lấy dữ liệu câu hỏi');
            setShowErrorModal(true); // Show error modal
          }
        });

        setQuizData(questions);
        
        // Set Result ID
        setResultID(data.result_id);

        setIsLoading(false);
      } else {
        setErrorMessage('Không Có Dữ Liệu Câu Hỏi');
        setShowErrorModal(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      setErrorMessage(error.message || 'Lỗi khi lấy dữ liệu câu hỏi');
      setShowErrorModal(true); // Show error modal
    }
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    navigate('/'); // Navigate to home page
  };

  const handleAnswerClick = (answer) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks

    setSelectedAnswer(answer);
    if (answer === quizData[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestion + 1 < quizData.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(60); // Reset time for next question
      } else {
        finishQuiz();
      }
    }, 1000);
  };

  const finishQuiz = () => {
    // API call to save the result
    console.log("Finish Quiz", score);
    saveQuizResult(score);
    setQuizCompleted(true);
  };

  const saveQuizResult = async (finalScore) => {
    try {
      const API_URL = `${import.meta.env.VITE_API_URL}/user/update-score`;
      const response = await axios.post(API_URL, {
        result_id: resultID,
        score: finalScore
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        console.log("Save Quiz Result Successfully");
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
      setErrorMessage(error.message || 'Lỗi khi lưu kết quả');
      setShowErrorModal(true); // Show error modal
    }
  }

  const retryQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(60);
    setQuizCompleted(false);
    setSelectedAnswer(null);
  };

  const goToDashboard = () => {
    navigate('/');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (quizCompleted) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`p-8 rounded-lg shadow-xl w-full max-w-md text-center ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <h1 className="text-3xl font-bold mb-4">Hoàn Thành!</h1>
          <p className="text-xl mb-4">Bạn Trả Lời Đúng: {score} / {quizData.length} Câu Hỏi</p>
          <p className="text-lg mb-6">Đạt: {((score / quizData.length) * 100).toFixed(2)}%</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={retryQuiz}
              className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded flex items-center`}
            >
              <FaRedo className="mr-2" /> Thử Lại
            </button>
            <button
              onClick={goToDashboard}
              className={`${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white font-bold py-2 px-4 rounded flex items-center`}
            >
              <FaTachometerAlt className="mr-2" /> Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`p-8 rounded-lg shadow-xl w-full max-w-2xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Câu Hỏi {currentQuestion + 1}/{quizData.length}</h1>
          <div className="flex items-center">
            <div className="flex items-center text-xl font-semibold mr-4">
              <FaClock className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              {timeLeft} giây
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-yellow-400'}`}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>

        <h2 className="text-xl mb-6">{quizData[currentQuestion].text}</h2>

        <div className="space-y-4">
          {quizData[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(option)}
              className={`w-full p-4 text-left rounded-lg transition duration-300 ${
                selectedAnswer === option
                  ? option === quizData[currentQuestion].correctAnswer
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              disabled={selectedAnswer !== null}
            >
              {option}
              {selectedAnswer === option && (
                <span className="float-right">
                  {option === quizData[currentQuestion].correctAnswer ? (
                    <FaCheck className="text-white" />
                  ) : (
                    <FaTimes className="text-white" />
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {selectedAnswer && (
          <button
            onClick={() => {
              if (currentQuestion + 1 < quizData.length) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
              } else {
                finishQuiz();
              }
            }}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Câu hỏi tiếp theo
          </button>
        )}
      </div>

      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Lỗi</h2>
            <p className="mb-4">{errorMessage}</p>
            <button
              onClick={handleErrorModalClose}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;