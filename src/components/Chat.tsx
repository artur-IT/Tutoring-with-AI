import { Button } from "./ui/button";
import UserIcon from "../assets/icons/user.svg?url";
import PlusIcon from "../assets/icons/plus.svg?url";
import SendIcon from "../assets/icons/send.svg?url";

export default function Chat() {
  const studentDataJson = window.localStorage.getItem("studentData");

  if (studentDataJson) {
    try {
      JSON.parse(studentDataJson);
      // You can use studentData here:
      // - studentData.subject (e.g., "matematyka" or "chemia")
      // - studentData.problem (e.g., "równania, geometria")
      // - studentData.interests (e.g., "piłka nożna, książki")

      // Example: You can store it in a global variable or use it in your React component
      // const studentData = JSON.parse(studentDataJson);
      // window.studentData = studentData;
    } catch (error) {
      // Error parsing studentData - silently fail
      void error;
    }
  }

  //  <style>
  //   progress::-moz-progress-bar {
  //     background: blue !important;
  //   }

  //   progress::-webkit-progress-bar {
  //     background-color: #000;
  //     width: 100%;
  //    }

  //   progress::-webkit-progress-value {
  //     background: yellow;
  //     width: 100%;
  //   }

  //   progress {
  //     color: blue !important;
  //   }
  // </style>

  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-6 max-w-3xl mx-auto relative">
      {/* Header */}
      <div className="flex justify-center mb-6 relative">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8 mt-8">Chat</h1>
        <a href="/" className="inline-block absolute top-0 right-0">
          <Button variant="back">Koniec na dziś</Button>
        </a>
      </div>

      {/* Messages section */}
      <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
        {/* Tutor message */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <img src={UserIcon} alt="" className="w-5 h-5" />
            </div>
          </div>
          {/* Message bubble */}
          <div className="bg-yellow-200 rounded-2xl px-4 py-3 max-w-[80%]">
            <p className="text-sm font-semibold text-gray-900 mb-1">tutor + avatar</p>
            <p className="text-sm text-gray-900">Message. Lorem ipsum dolor.</p>
          </div>
        </div>

        {/* User message */}
        <div className="flex items-start gap-3 justify-end">
          {/* Message bubble */}
          <div className="bg-blue-600 rounded-2xl px-4 py-3 max-w-[80%]">
            <p className="text-sm font-semibold text-white mb-1">Me + avatar</p>
            <p className="text-sm text-white">Message. Lorem ipsum dolor.</p>
          </div>
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <img src={UserIcon} alt="" className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Input section */}
      <div className="bg-white rounded-xl shadow-md p-3 mb-4">
        <div className="flex items-center gap-2">
          {/* Plus icon button */}
          <button
            type="button"
            className="shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
            aria-label="Add attachment"
          >
            <img src={PlusIcon} alt="" className="w-5 h-5" />
          </button>
          {/* Input field */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Message"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Send button */}
          <button
            type="button"
            className="shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
            aria-label="Send message"
          >
            <img src={SendIcon} alt="" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress bar section */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 italic mb-2">wykorzystany czas</p>
        <div className="w-full h-1 rounded-full bg-red-500 overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: "35%" }}></div>
          {/* <progress value='35' max='100' className='w-full rounded-full'></progress>  */}
        </div>
      </div>
    </div>
  );
}
