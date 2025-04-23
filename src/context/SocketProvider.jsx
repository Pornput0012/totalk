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

  useEffect(() => {
    if (
      !socketRef.current ||
      socketRef.current.readyState === WebSocket.CLOSED
    ) {
      socketRef.current = new WebSocket(
        `ws://${import.meta.env.VITE_BACK_URL}`
      );

      socketRef.current.onopen = () => {
        console.log("เชื่อมต่อสำเร็จ!");
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
        const { type, room, msg, questionLength, number } = JSON.parse(
          res.data
        );
        console.table({ type, room, msg, questionLength, number });

        switch (type) {
          case "created":
            setRoomState(room);
            setQuestionLength(questionLength);
            setHistoryQ([]);
            setIsHost(true);
            break;
          case "joined":
            setRoomState(room);
            setQuestionLength(questionLength);
            setHistoryQ([]);
            setIsHost(false);
            setUserJoined(true);
            break;
          case "userJoined":
            setUserJoined(true);
            break;
          case "message":
            setCurrentMessage(msg);
            setHistoryQ((prev) => [...prev, number]);
            break;
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
          default:
            break;
        }
      };

      socketRef.current.onclose = (event) => {
        if (event.code !== 1000) {
          setTimeout(() => {
            setNext((prev) => prev + 1);
          }, 3000);
        }
      };

      socketRef.current.onerror = () => {
        console.log("เชื่อมต่อไม่สำเร็จ!");
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

  const createRoom = () => {
    socketRef.current.send(JSON.stringify({ type: "create" }));
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
        questionLength
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
