import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";

export default function useSocket() {
  const socketRef = useRef(null);
  const [roomState, setRoomState] = useState(0);
  const [roomInput, setRoomInput] = useState(0);
  const [_, setNext] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [questionLength, setQuestionLength] = useState(0);
  const [historyQ, setHistoryQ] = useState([]);
  const [isHost, setIsHost] = useState(false);

  const [userJoined, setUserJoined] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    socketRef.current = new WebSocket(`ws://${import.meta.env.VITE_BACK_URL}`);

    socketRef.current.onopen = () => {
      console.log("เชื่อมต่อสำเร็จ!");
    };

    socketRef.current.onmessage = (res) => {
      const { type, room, msg, questionLength, number } = JSON.parse(res.data);
      switch (type) {
        case "created":
          console.log("สร้างห้องแล้ว");
          setRoomState(room);
          setQuestionLength(questionLength);
          setHistoryQ([]);
          setIsHost(true);
          break;
        case "joined":
          if (roomState === room) {
            console.log("มีคนเข้าร่วมห้องแล้ว!");
            return;
          }
          console.log("เข้าร่วมห้องแล้ว!");
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
          console.log("ห้องถูกลบแล้ว");
          break;
        case "error":
          setErrorMsg(msg);
          break;
        default:
          break;
      }
    };

    socketRef.current.onerror = () => {
      console.log("เชื่อมต่อไม่สำเร็จ!");
    };

    socketRef.current.onclose = () => {
      console.log("การเชื่อมต่อถูกตัดแล้ว");
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  useEffect(() => {
    console.log("roomState เปลี่ยนเป็น:", roomState);
  }, [roomState]);

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

  const reCreateRoom = () => {
    deleteRoom();
    setTimeout(() => {
      createRoom();
    }, 300); // wait a bit before recreating
  };

  const randomIndex = () => {
    let result;
    do {
      result = Math.floor(Math.random() * questionLength);
    } while (historyQ.includes(result));
    return result;
  };

  const nextQuestion = () => {
    if (historyQ.length === questionLength) {
      console.log("End Question");
      return;
    }
    const random = randomIndex();
    socketRef.current.send(
      JSON.stringify({ type: "message", room: roomState, msg: random })
    );
    setNext(random);
  };

  return {
    room: roomState,
    roomInput,
    setRoomInput,
    currentMessage,
    isHost,
    createRoom,
    joinRoom,
    deleteRoom,
    reCreateRoom,
    nextQuestion,
    userJoined,
    errorMsg,
  };
}
