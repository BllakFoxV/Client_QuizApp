import React, { useState, useEffect } from 'react';
import { FaClock, FaCheck, FaTimes, FaRedo, FaTachometerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const QuizPage = (props) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const { count } = props;
  const navigate = useNavigate();
  if(count === 0){
    navigate('/');
    return;
  }
  const fetchQuizData = async () => {
    const response = await fetch('https://api.example.com/quiz-data');
    const data = await response.json();
    setQuizData(data);
  };
  // Sample quiz data
  const quizData = [
    {
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris'
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 'Mars'
    },
    {
      question: 'Who painted the Mona Lisa?',
      options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
      correctAnswer: 'Leonardo da Vinci'
    }
    // Add more questions here
  ];

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finishQuiz();
    }
  }, [timeLeft, quizCompleted]);

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    if (answer === quizData[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    if (currentQuestion + 1 < quizData.length) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      }, 1000);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizCompleted(true);
    // API call to save the result
    saveQuizResult(score);
  };

  const saveQuizResult = async (finalScore) => {
    try {
      const response = await fetch('https://api.example.com/save-quiz-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score: finalScore }),
      });
      if (!response.ok) {
        throw new Error('Failed to save quiz result');
      }
      // Handle successful save
    } catch (error) {
      console.error('Error saving quiz result:', error);
      // Handle error
    }
  };

  const retryQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(60);
    setQuizCompleted(false);
    setSelectedAnswer(null);
  };

  const goToDashboard = () => {
    // Implement navigation to dashboard
    console.log('Navigating to dashboard');
  };

  if (quizCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Hoàn Thành!</h1>
          <p className="text-xl mb-4">Bạn Trả Lời Đúng: {score} / {quizData.length} Câu Hỏi</p>
          <p className="text-lg mb-6">Đạt: {((score / quizData.length) * 100).toFixed(2)}%</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={retryQuiz}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaRedo className="mr-2" /> Thử Lại
            </button>
            <button
              onClick={goToDashboard}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaTachometerAlt className="mr-2" /> Về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Câu Hỏi {currentQuestion + 1}/{quizData.length}</h1>
          <div className="flex items-center text-xl font-semibold">
            <FaClock className="mr-2 text-blue-500" />
            {timeLeft} giây
          </div>
        </div>
        
        <h2 className="text-xl mb-6">{quizData[currentQuestion].question}</h2>
        
        <div className="space-y-4">
          {quizData[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(option)}
              className={`w-full p-4 text-left rounded-lg transition duration-300 ${selectedAnswer === option
                ? option === quizData[currentQuestion].correctAnswer
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'}`}
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
      </div>
    </div>
  );
};

export default QuizPage;