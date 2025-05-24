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
  const [isRedZone, setIsRedZone] = useState(false);

  const [questionOptions] = useState([
    "เพิ่มความสนิทด้วย 36 คำถาม",
    "คำถาม deeptalk กับเพื่อนสนิท",
    "คำถามใช้ถามคนรัก เพื่อกระชับความสัมพันธ์",
    "เปิดใจหนึ่งครึ่ง รักกันมากขึ้น!",
    "คำถาม deeptalk กับคนคุย",
    "ถามจริงตอบจริง"
  ]);

  const [questionOptionsRedZone] = useState([
    "คำถามสนุกสุดแซ่บสำหรับคู่รัก",
    "คำถามเร่าร้อนจุดไฟรัก",
    "ถามจริงตอบจริงสุดแซ่บ",
    "คำถามรู้ใจคู่รัก",
    "คำถามเผยสิ่งที่ทำให้หลงรัก",
    "คำถามเคยทำรักสุดมัน",
    "คำถามแซ่บสำหรับเพื่อน",
  ]);

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
    document.getElementById("selectQuestion").showModal();
  };

  const confirmCreateRoom = () => {
    if (selectedQuestionIndex !== null) {
      createRoom(selectedQuestionIndex, isRedZone);
      document.getElementById("selectQuestion").close();
      document.getElementById("roomNumber").showModal();
    }
  };

  const currentQuestionOptions = isRedZone ? questionOptionsRedZone : questionOptions;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50/50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 space-y-6">
        {showQuestion ? (
          <QuestionView room={room} />
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
                onClick={handleCreateRoomFlow}
                className="btn text-white w-full bg-yellow-400 hover:bg-yellow-500 border-none"
              >
                สร้างห้อง
              </button>

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

                  <div className="flex justify-center mb-4 items-start gap-2 mt-4 mx-auto">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="questionType"
                        id="normalQuestion"
                        className="radio radio-warning"
                        checked={!isRedZone}
                        onChange={() => {
                          setIsRedZone(false);
                          setSelectedQuestionIndex(null);
                        }}
                      />
                      <label htmlFor="normalQuestion" className="text-sm font-medium text-gray-700">
                        คำถามทั่วไป
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="questionType"
                        id="redZoneQuestion"
                        className="radio radio-error"
                        checked={isRedZone}
                        onChange={() => {
                          setIsRedZone(true);
                          setSelectedQuestionIndex(null);
                        }}
                      />
                      <label htmlFor="redZoneQuestion" className="text-sm font-medium text-red-500">
                        คำถามเสวเสว
                      </label>
                    </div>
                  </div>


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
                    {currentQuestionOptions.map((ele, index) => (
                      <option key={index} value={index}>
                        {ele}
                      </option>
                    ))}
                  </select>

                  <div className="my-6 md:my-8 lg:my-10 text-lg md:text-xl lg:text-2xl font-semibold">
                    {selectedQuestionIndex !== null && currentQuestionOptions[selectedQuestionIndex]}
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

              <dialog
                id="roomNumber"
                className="modal"
                onClick={(e) => {
                  const dialog = document.getElementById("roomNumber");
                  if (e.target === dialog) dialog.close();
                }}
              >
                <div
                  className="modal-box text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-bold text-lg text-yellow-500">เลขห้อง</h3>
                  <p className="py-4 text-3xl font-semibold tracking-widest">{room == -1 ? "......" : room}</p>
                  <div className="modal-action flex justify-center">
                    <form method="dialog">
                      <button className="btn bg-yellow-400 text-white">
                        ตกลง
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
