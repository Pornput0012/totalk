import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const socketRef = useRef(null)
  const [room, setRoom] = useState(0);
  const [roomInput, setRoomInput] = useState(0);
  const [next, setNext] = useState(0);

  const [currentMessage, setCurrectMessage] = useState("")
  const [questionLength, setQuestionLength] = useState(0);

  const [historyQ, setHistoryQ] = useState([])


  useEffect(() => {
    socketRef.current = new WebSocket(`ws://${import.meta.env.VITE_BACK_URL}`)

    socketRef.current.onopen = () => {
      console.log("เชื่อมต่อสำเร็จ!");
    }

    socketRef.current.onmessage = (res) => {
      const { type, room, msg, questionLength,number } = JSON.parse(res.data)
      console.log(res.data);

      switch (type) {
        case "created":
          setRoom(room)
          setQuestionLength(questionLength)
          break;
        case "joined":
          setRoom(room)
          setQuestionLength(questionLength)
          break
        case "message":
          setCurrectMessage(msg)
          console.log(number);
          
          setHistoryQ((prev) => {
            return [...prev, number]
          })
          break
        default:
          break;
      }
    };

    socketRef.current.onerror = () => {
      console.log("เชื่อมต่อไม่สำเร็จ!");
    }

    socketRef.current.onclose = () => {
      console.log("การเชื่อมต่อถูกตัดแล้ว");
    }

    return () => {
      socketRef.current.close();
    };
  }, [])

  const createRoom = () => {
    socketRef.current.send(JSON.stringify({ type: "create" }))
  }

  const joinRoom = () => {
    socketRef.current.send(JSON.stringify({ type: "join", room: roomInput }))
  }

  const randomIndex = () => {
    let result = Math.floor(Math.random() * questionLength)
    do {
      result = Math.floor(Math.random() * questionLength)
    } while (historyQ.includes(result))
    return result
  }

  const nextQuestion = () => {
    if (historyQ.length === questionLength) { console.log("End Question"); return; }

    socketRef.current.send(JSON.stringify({ type: "message", room: room, msg: next }))
    setNext(randomIndex)
  }

  return (
    <div >
      <button onClick={createRoom} className="btn btn-primary">CreateRoom</button>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">join room?</legend>
        <input type="text" className="input" placeholder="RoomNumber" onInput={(e) => setRoomInput(e.target.value)} />
      </fieldset>
      <button onClick={joinRoom} className="btn btn-secondary">JoinRoom</button>

      <button onClick={nextQuestion} className="btn btn-secondary">sendMessage</button>

      {currentMessage && <h1 className="text-2xl">{currentMessage}</h1>}
    </div>
  )
}
