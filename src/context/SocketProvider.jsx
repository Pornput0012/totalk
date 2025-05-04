// src/context/SocketProvider.js
import { useEffect, useRef, useState } from "react";
import { SocketContext } from "./SocketContext";

export default function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [roomState, setRoomState] = useState(-1);
  const [roomInput, setRoomInput] = useState(0);
  const [_, setNext] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [questionLength, setQuestionLength] = useState(0);
  const [historyQ, setHistoryQ] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [userJoined, setUserJoined] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastUser, setLastUser] = useState(false);
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (
      !socketRef.current ||
      socketRef.current.readyState === WebSocket.CLOSED
    ) {
      socketRef.current = new WebSocket(import.meta.env.VITE_BACK_URL);

      socketRef.current.onopen = () => {
        if (roomState !== 0) {
          const currentRoom = roomState;
          setTimeout(() => {
            socketRef.current.send(
              JSON.stringify({ type: "join", room: Number(currentRoom) })
            );
          }, 500);
        }
      };

      socketRef.current.onmessage = (res) => {
        const { type, room, msg, questionLength, number, questionIndex } = JSON.parse(
          res.data
        );

        switch (type) {
          case "created":
            setRoomState(room);
            setQuestionLength(questionLength);
            setHistoryQ([]);
            setIsHost(true);
            localStorage.setItem("room", room);

            break;
          case "joined":
            setRoomState(room);
            setQuestionLength(questionLength);
            setHistoryQ([]);
            setIsHost(false);
            setUserJoined(true);
            localStorage.setItem("room", room);

            break;
          case "userJoined":
            setUserJoined(true);
            break;
          case "message":
            setCurrentMessage(msg);
            setHistoryQ((prev) => [...prev, number]);
            break;
          case "success":
            console.log("success");

            setSuccess(true)
          case "deleted":
            setRoomState(0);
            setCurrentMessage("");
            setQuestionLength(0);
            setHistoryQ([]);
            setIsHost(false);
            setUserJoined(false);
            setErrorMsg("");
            break;
          case "error":
            setErrorMsg(msg);
            setTimeout(() => {
              setErrorMsg("");
            }, 5000);
            break;
          case "disconnect":
            setLastUser(true);
            break;
          case "reconnected":
            setRoomState(room);
            setQuestionLength(questionLength);
            setCurrentMessage(currentMessage);
            setHistoryQ((prev) =>
              Array.from({ length: questionIndex }, (_, i) => i)
            );
            break;

          default:
            break;
        }
      };

      socketRef.current.onclose = () => {
        console.log("Socket ถูกตัดการเชื่อมต่อ กำลัง reconnect...");

        const savedRoom = localStorage.getItem("room");
        if (savedRoom) {
          setTimeout(() => {
            const reconnectMessage = {
              type: "reconnect",
              room: savedRoom,
            };
            socketRef.current.send(JSON.stringify(reconnectMessage));
          }, 1000); 
        }
      };

      socketRef.current.onerror = () => {
      };
    }

    return () => {
      if (
        socketRef.current &&
        socketRef.current.readyState !== WebSocket.CLOSED
      ) {
        socketRef.current.close(1000);
      }
    };
  }, []);

  const createRoom = (questionIndex) => {
    socketRef.current.send(JSON.stringify({ type: "create", questionIndex }));
  };

  const joinRoom = () => {
    socketRef.current.send(
      JSON.stringify({ type: "join", room: Number(roomInput) })
    );
  };

  const deleteRoom = () => {
    socketRef.current.send(JSON.stringify({ type: "delete", room: roomState }));
  };

  const nextQuestion = () => {
    if (historyQ.length >= questionLength) {
      setCurrentMessage("คำถามหมดแล้ว! กดสร้างห้องใหม่เพื่อเริ่มต้นใหม่");
      return;
    }

    let random;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      random = Math.floor(Math.random() * questionLength);
      attempts++;
      if (attempts > maxAttempts) return;
    } while (historyQ.includes(random));

    socketRef.current.send(
      JSON.stringify({ type: "message", room: roomState, msg: random })
    );
    setNext(random);
  };

  const successQuestion = () => {
    socketRef.current.send(JSON.stringify({ type: "success", room: roomState }));
  }

  return (
    <SocketContext.Provider
      value={{
        room: roomState,
        roomInput,
        setRoomInput,
        currentMessage,
        isHost,
        createRoom,
        joinRoom,
        deleteRoom,
        nextQuestion,
        userJoined,
        errorMsg,
        historyQ,
        questionLength,
        lastUser,
        successQuestion,
        success
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
