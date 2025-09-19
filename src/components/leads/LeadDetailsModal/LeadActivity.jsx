/*
  File: components/LeadDetailsModal/LeadActivity.js
  Display timeline/activity correctly from backend — Match reference UI style
  ✅ Fixed: Timeline connector now scrolls with content and stretches correctly
  ✅ Added: Blinking effect on the last activity node
*/

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FaUserPlus, FaEdit, FaCheckCircle } from "react-icons/fa";

dayjs.extend(relativeTime);

const LeadActivity = ({ lead }) => {
  if (!lead) return null;

  const events = [];

  // Lead creation
  if (lead.createdAt) {
    events.push({
      type: "created",
      icon: <FaUserPlus className="text-gray-500" />,
      user: lead.assignedByNames?.join(", ") || "A user",
      date: lead.createdAt,
      message: "created this lead",
      isSpecial: false,
    });
  }

  // Lead assignments
  if (Array.isArray(lead.assignments)) {
    lead.assignments.forEach((a) => {
      events.push({
        type: "assignment",
        icon: <FaUserPlus className="text-gray-500" />,
        user: a.assignedByUser?.name || "A user",
        assignedTo: a.user?.name || "a user",
        date: a.createdAt || lead.updatedAt,
        message: `assigned the task to ${a.user?.name || "a user"}`,
        isSpecial: false,
      });
    });
  }

  // Lead updates
  if (lead.updatedAt && dayjs(lead.updatedAt).isAfter(dayjs(lead.createdAt))) {
    events.push({
      type: "update",
      icon: <FaEdit className="text-gray-500" />,
      user: "Lead",
      date: lead.updatedAt,
      message: "was updated",
      isSpecial: false,
    });
  }

  // Lead closed
  if (lead.closedAt) {
    events.push({
      type: "closed",
      icon: <FaCheckCircle className="text-green-500" />,
      user: lead.closedBy || "an admin",
      date: lead.closedAt,
      message: "was closed",
      isSpecial: true,
    });
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <svg
          className="w-12 h-12 mb-2 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  // Sort by date ascending
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="relative space-y-6 pb-6">
      {/* Timeline connector line — stretches with content */}
      <div
        className="absolute left-[71px] top-0 w-[3px] bg-gray-300 pointer-events-none"
        style={{
          height: "100%",
          minHeight: "100%",
        }}
      ></div>

      {events.map((event, idx) => {
        const isLast = idx === events.length - 1; // check if last event
        return (
          <div key={idx} className="relative pl-24">
            {/* Date column */}
            <div className="absolute left-0 top-6 w-16 text-xs font-medium text-gray-500 text-right pr-2">
              {dayjs(event.date).format("DD MMM")}
            </div>

            {/* Event node */}
            <div className="absolute left-16 top-6 w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
              <div
                className={`w-2 h-2 rounded-full ${
                  event.isSpecial ? "bg-blue-500" : "bg-gray-800"
                } ${isLast ? "animate-glow-blink" : ""}`}
              ></div>
            </div>

            {/* Event content card */}
            <div
              className={`p-3 rounded-lg ${
                event.isSpecial
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              } shadow-sm transition-all duration-200 hover:shadow`}
            >
              <p className="text-sm">
                <span className="font-medium">{event.user}</span> {event.message}.
              </p>
              <p
                className={`mt-1 text-xs ${
                  event.isSpecial ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {dayjs(event.date).fromNow()}
              </p>
            </div>
          </div>
        );
      })}

      {/* ✅ Inline blink animation */}
      <style jsx>{`
        @keyframes glowBlink {
          0%,
          100% {
            opacity: 1;
            box-shadow: 0 0 4px #3b82f6, 0 0 8px #3b82f6;
          }
          50% {
            opacity: 0.4;
            box-shadow: 0 0 2px #3b82f6;
          }
        }
        .animate-glow-blink {
          animation: glowBlink 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LeadActivity;
