import { useEffect, useState } from "react";
import QuestionView from "./QuestionView";
import Swal from "sweetalert2";

import { useSocketContext } from "../context/SocketContext";
export default function HomeView() {
  const {
    room,
    roomInput,
    setRoomInput,
    createRoom,
    joinRoom,
    deleteRoom,
    userJoined,
    lastUser,
  } = useSocketContext();

  const [showQuestion, setshowQuestion] = useState(false);
  useEffect(() => {
    if (userJoined) {
      setshowQuestion(true);
    }
  }, [userJoined]);

  useEffect(() => {
    if (lastUser) {
      Swal.fire({
        icon: "warning",
        title: "คู่ของคุณหลุดการเชื่อมต่อ",
        text: "คุณจะถูกนำกลับไปยังหน้าแรก",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#facc15", // สีเหลือง
      }).then(() => {
        window.location.href = "/";
      });
    }
  }, [lastUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50/50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 space-y-6">
        {showQuestion ? (
          <QuestionView />
        ) : (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-center text-yellow-500">
              Have a good day ◡̈
            </h1>
            <p className="text-center text-gray-500">
              สร้างหรือเข้าร่วมห้องแล้วเริ่มต้นสนทนาที่มีความหมายกันเลย
            </p>

            <div className="flex justify-center max-h-[200px]">
              <img
                src="/logo.svg"
                alt="Logo"
                className="w-full object-cover object-center"
              />
            </div>

            <div className="space-y-4 mt-10">
              <button
                onClick={() => {
                  createRoom();
                  document.getElementById("roomNumber").showModal();
                }}
                className="btn text-white w-full bg-yellow-400 hover:bg-yellow-500 border-none"
              >
                สร้างห้อง
              </button>
              <dialog
                id="roomNumber"
                className="modal"
                onClick={(e) => {
                  const dialog = document.getElementById("roomNumber");
                  if (e.target === dialog) {
                    deleteRoom();
                    dialog.close();
                  }
                }}
              >
                <div
                  className="modal-box text-center"
                  onClick={(e) => e.stopPropagation()} // กันไม่ให้คลิกภายในปิด modal
                >
                  <h3 className="font-bold text-xl mb-4">ห้องของคุณ</h3>
                  <p className="text-4xl font-mono tracking-widest bg-white rounded-lg px-8 py-2 inline-block">
                    {room}
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    แชร์เลขห้องให้เพื่อน join เลย!
                  </p>
                  <div className="modal-action mt-6">
                    <form method="dialog">
                      <button
                        onClick={deleteRoom}
                        className="btn border-yellow-400 bg-yellow-500"
                      >
                        ปิด
                      </button>
                    </form>
                  </div>
                </div>
              </dialog>
              <button
                onClick={() => {
                  document.getElementById("joinRoom").showModal();
                }}
                className="btn btn-outline w-full border-yellow-500 text-yellow-500 hover:text-yellow-50 hover:bg-yellow-600 hover:border-yellow-600"
              >
                เข้าร่วมห้อง
              </button>
              <dialog
                id="joinRoom"
                className="modal"
                onClick={(e) => {
                  const dialog = document.getElementById("joinRoom");
                  if (e.target === dialog) {
                    deleteRoom();
                    dialog.close();
                  }
                }}
              >
                <div
                  className="modal-box text-center"
                  onClick={(e) => e.stopPropagation()} // กันไม่ให้คลิกภายในปิด modal
                >
                  <h3 className="font-bold text-xl mb-4">ใส่เลขห้อง</h3>
                  <input
                    onInput={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setRoomInput(value);
                      }
                    }}
                    value={roomInput == 0 ? "" : roomInput}
                    className="text-3xl py-2 font-mono  tracking-widest bg-white rounded-lg inline-block w-64 text-center"
                    maxLength={6}
                    pattern="[0-9]"
                    type="text"
                    placeholder="xxxxxx"
                  />
                  <br />
                  <button
                    onClick={joinRoom}
                    className="btn bg-yellow-500 border-yellow-400 mt-6 px-4 w-[50%]"
                  >
                    เข้าร่วมห้อง
                  </button>
                  <div className="modal-action mt-6">
                    <form method="dialog">
                      <button onClick={deleteRoom} className="btn bg-gray-200">
                        ปิด
                      </button>
                    </form>
                  </div>
                </div>
              </dialog>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
