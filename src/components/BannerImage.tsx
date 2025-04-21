
import React from "react";

const BannerImage = () => {
  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl bg-indigo-800">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-4xl">
          {/* Circular table */}
          <div className="w-64 h-64 md:w-80 md:h-80 bg-green-700 rounded-full mx-auto shadow-inner border-8 border-amber-900 flex items-center justify-center">
            {/* Cards in the middle */}
            <div className="relative h-24 w-24">
              {['rotate-[-10deg]', 'rotate-[5deg]', 'rotate-[20deg]'].map((rotation, idx) => (
                <div
                  key={idx}
                  className={`absolute top-${idx * 2} left-${idx * 2} w-16 h-24 rounded-lg bg-white shadow-md ${rotation} border border-gray-300`}
                  style={{ zIndex: 10 - idx }}
                >
                  <div className="flex justify-between p-1">
                    <div className="text-red-600 font-bold">♥</div>
                    <div className="text-red-600 font-bold">10</div>
                  </div>
                  <div className="flex justify-center items-center h-12 text-red-600 text-4xl">♥</div>
                </div>
              ))}
            </div>
          </div>

          {/* Players around the table */}
          {[
            { position: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2", color: "bg-blue-500" },
            { position: "top-1/4 right-0 translate-x-1/2", color: "bg-red-500" },
            { position: "bottom-1/4 right-0 translate-x-1/2", color: "bg-yellow-500" },
            { position: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", color: "bg-green-500" },
            { position: "bottom-1/4 left-0 -translate-x-1/2", color: "bg-purple-500" },
            { position: "top-1/4 left-0 -translate-x-1/2", color: "bg-pink-500" },
          ].map((player, idx) => (
            <div 
              key={idx}
              className={`absolute ${player.position} w-12 h-12 md:w-16 md:h-16 ${player.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white`}
            >
              P{idx + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerImage;
