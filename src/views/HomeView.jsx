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

  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [questionOptions, _] = useState([
    "เพิ่มความสนิทด้วย 36 คำถาม",
    "คำถาม deeptalk กับเพื่อนสนิท",
    "คำถามใช้ถามคนรัก เพื่อกระชับความสัมพันธ์",
    "เปิดใจหนึ่งครึ่ง รักกันมากขึ้น!"])

  useEffect(() => {
    if (userJoined) {
      setShowQuestion(true);
    }
  }, [userJoined]);

  useEffect(() => {
    if (lastUser) {
      Swal.fire({
        icon: "warning",
        title: "คู่ของคุณหลุดการเชื่อมต่อ",
        text: "คุณจะถูกนำกลับไปยังหน้าแรก",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#facc15",
      }).then(() => {
        window.location.href = "/";
      });
    }
  }, [lastUser]);

  const handleCreateRoomFlow = () => {
    // เปิด modal ให้เลือกคำถาม
    document.getElementById("selectQuestion").showModal();
  };

  const confirmCreateRoom = () => {
    if (selectedQuestionIndex !== null) {
      createRoom(selectedQuestionIndex);
      document.getElementById("selectQuestion").close();
      document.getElementById("roomNumber").showModal();
    }
  };

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
              {/* กดปุ่มสร้างห้อง */}
              <button
                onClick={handleCreateRoomFlow}
                className="btn text-white w-full bg-yellow-400 hover:bg-yellow-500 border-none"
              >
                สร้างห้อง
              </button>

              {/* Modal เลือกคำถาม */}
              <dialog
                id="selectQuestion"
                className="modal"
                onClick={(e) => {
                  const dialog = document.getElementById("selectQuestion");
                  if (e.target === dialog) dialog.close();
                }}
              >
                <div
                  className="modal-box text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-bold text-xl mb-4">เลือกชุดคำถาม</h3>

                  <select
                    value={selectedQuestionIndex ?? ""}
                    onChange={(e) =>
                      setSelectedQuestionIndex(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    className="select select-bordered w-full md:w-3/4 text-sm"
                  >
                    <option value="">-- กรุณาเลือกชุดคำถาม --</option>
                    {questionOptions.map((ele, index) => (
                      <option key={index} value={index}>
                        {ele}
                      </option>
                    ))}
                  </select>

                  <div className="my-6 md:my-8 lg:my-10 text-lg md:text-xl lg:text-2xl font-semibold">
                    {questionOptions[selectedQuestionIndex]}
                  </div>

                  <div className="modal-action mt-6">
                    <form method="dialog" className="w-full md:w-3/4 mx-auto flex flex-col gap-2">
                      <button
                        type="button"
                        disabled={selectedQuestionIndex === null}
                        onClick={confirmCreateRoom}
                        className="btn bg-yellow-500 text-white disabled:opacity-50"
                      >
                        ยืนยันสร้างห้อง
                      </button>
                      <button className="btn bg-gray-200">ยกเลิก</button>
                    </form>
                  </div>
                </div>
              </dialog>



              {/* Modal แสดงเลขห้อง */}
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
                  onClick={(e) => e.stopPropagation()}
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

              {/* ปุ่มเข้าร่วมห้อง */}
              <button
                onClick={() => {
                  document.getElementById("joinRoom").showModal();
                }}
                className="btn btn-outline w-full border-yellow-500 text-yellow-500 hover:text-yellow-50 hover:bg-yellow-600 hover:border-yellow-600"
              >
                เข้าร่วมห้อง
              </button>

              {/* Modal เข้าร่วมห้อง */}
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
                  onClick={(e) => e.stopPropagation()}
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
                    className="text-3xl py-2 font-mono tracking-widest bg-white rounded-lg inline-block w-64 text-center"
                    maxLength={6}
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
