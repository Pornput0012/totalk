import { useEffect, useState, useRef } from "react";
import { useSocketContext } from "../context/SocketContext";
import { motion } from "motion/react";
import Swal from "sweetalert2";

export default function QuestionView() {
  const { currentMessage, nextQuestion, historyQ, questionLength, isHost, successQuestion, success } = useSocketContext();
  const [showTimer, setShowTimer] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(240);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const handleNext = () => {
    if (isNextDisabled) return;
    setIsNextDisabled(true);
    if (historyQ.length === questionLength - 1) {
      successQuestion();
    } else {
      nextQuestion();
    }
    setTimeout(() => setIsNextDisabled(false), 1000); // ป้องกันกดรัว
  };

  const progressPercent = questionLength > 0
    ? (historyQ.length / questionLength) * 100
    : 0;

  useEffect(() => {
    if (currentMessage.includes("ใช้เวลา 4 นาที")) {
      setShowTimer(true);
    } else {
      setShowTimer(false);
    }
  }, [currentMessage]);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
      Swal.fire({
        icon: "info",
        title: "หมดเวลาแล้ว!",
        text: "ครบ 4 นาทีพอดี ลองตอบคำถามให้เร็วขึ้นในรอบต่อไปนะ 😊",
        confirmButtonText: "เข้าใจแล้ว!",
      });
      setShowTimer(false)
    }
    return () => clearTimeout(timerRef.current);
  }, [isRunning, secondsLeft]);
  useEffect(() => {
    if (success) {
      Swal.fire({
        title: "เยี่ยมมาก! 🎉",
        text: "พวกคุณตอบครบทุกคำถามแล้ว ขอให้ความสัมพันธ์แน่นแฟ้นยิ่งขึ้นนะ 💖",
        icon: "success",
        confirmButtonText: "กลับสู่หน้าแรก",
      }).then(() => {
        window.location.href = "/";
      });
    }
  }, [success])

  const startTimer = () => {
    setSecondsLeft(240);
    setIsRunning(true);
  };

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className="flex justify-center max-h-[120px] mt-6">
        <img
          src="/logo.svg"
          alt="Logo"
          className="w-full object-contain object-center"
        />
      </div>

      <motion.h1
        className="text-2xl md:text-3xl -mt-6 font-bold text-center text-yellow-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        คำถามคือ...
      </motion.h1>
      {(() => {
        const isCurrentTurn =
          (historyQ.length % 2 === 0 && isHost && historyQ.length !== 0) ||
          (historyQ.length % 2 === 1 && !isHost);

        return (
          <p className={`text-center font-medium mt-2 ${isCurrentTurn ? "text-green-600" : "text-blue-600"
            }`}>
            {isCurrentTurn
              ? "ถึงตาคุณตอบแล้ว 🎯"
              : ""}
          </p>
        );
      })()}

      <motion.p
        className="text-center text-gray-600 min-h-[120px] md:min-h-[80px] flex justify-center items-center text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {currentMessage ? `${currentMessage}...` : <span className="text-sm">Tip: ให้ตั้งใจฟังสิ่งที่คู่ของเราพูด <br />โดยที่ไม่ตัดสินหรือพูดแทรกขัดจังหวะกันเด็ดขาด</span>}
      </motion.p>

      {showTimer && (
        <div className="mt-4 flex flex-col items-center space-y-2">
          <div className="text-lg text-red-500 font-semibold">
            เหลือเวลา: {formatTime(secondsLeft)}
          </div>
          {!isRunning && (
            <motion.button
              onClick={startTimer}
              className="btn bg-red-400 hover:bg-red-500 text-white border-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              เริ่มจับเวลา 4 นาที
            </motion.button>
          )}
        </div>
      )}

      <div className="space-y-4 mt-10 px-4">
        <motion.button
          onClick={handleNext}
          className="btn text-white w-full bg-yellow-400 hover:bg-yellow-500 border-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {
            historyQ.length >= questionLength
              ? "จบแล้วจร้า 🎉"
              : historyQ.length === 0
                ? "เริ่มกันเลย 💕"
                : "ไปยังคำถามถัดไป 🚀"
          }
        </motion.button>


        <div className="mt-4">
          <progress
            className="progress progress-warning w-full"
            value={progressPercent}
            max="100"
          ></progress>
          <div className="text-center text-sm text-gray-600 mt-1">
            ตอบแล้ว {historyQ.length} / {questionLength} ข้อ ✨
          </div>
        </div>
      </div>
    </>
  );
}
