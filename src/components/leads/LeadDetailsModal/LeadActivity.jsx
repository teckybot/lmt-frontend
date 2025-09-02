/*
  File: components/LeadDetailsModal/LeadActivity.js
  Display timeline/activity correctly from backend
*/

import React from "react";
import dayjs from "dayjs";

const LeadActivity = ({ lead }) => {
    if (!lead) return null;

    const events = [];

    // Lead creation
    if (lead.createdAt) {
        events.push({
            type: 'created',
            user: lead.assignedByNames?.join(', ') || 'A user',
            date: lead.createdAt,
            message: 'created this lead'
        });
    }

    // Lead assignments
    if (Array.isArray(lead.assignments)) {
        lead.assignments.forEach(a => {
            events.push({
                type: 'assignment',
                user: a.assignedByUser?.name || 'A user',
                assignedTo: a.user?.name || 'a user',
                date: a.createdAt || lead.updatedAt,
                message: `assigned the task to ${a.user?.name || 'a user'}`
            });
        });
    }

    // Lead updates
    if (lead.updatedAt && dayjs(lead.updatedAt).isAfter(dayjs(lead.createdAt))) {
        events.push({
            type: 'update',
            user: 'Lead',
            date: lead.updatedAt,
            message: 'was updated'
        });
    }

    // Lead closed
    if (lead.closedAt) {
        events.push({
            type: 'closed',
            user: lead.closedBy || 'an admin',
            date: lead.closedAt,
            message: 'was closed'
        });
    }

    if (events.length === 0) return <p className="text-gray-400">No activity yet</p>;

    return (
        <div className="relative pl-6 before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-gray-200">
            {events.map((event, idx) => (
                <div key={idx} className="relative mb-4">
                    <span className={`absolute left-[-26px] top-1 h-4 w-4 rounded-full ${event.type === 'closed' ? 'bg-green-500' : 'bg-blue-500'} border-2 border-white`}></span>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">{event.user}</span> {event.message}.
                        <span className="block text-xs text-gray-400">{dayjs(event.date).format('MMM DD, YYYY hh:mm A')}</span>
                    </p>
                </div>
            ))}
        </div>
    );
};

export default LeadActivity;
