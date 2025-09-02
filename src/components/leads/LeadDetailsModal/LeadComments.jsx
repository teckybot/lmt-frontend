// File: components/LeadDetailsModal/LeadComments.js
import React, { useState, useEffect } from 'react';
import { Avatar, Input, Button, message } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FiMessageSquare } from 'react-icons/fi';

dayjs.extend(relativeTime);

const { TextArea } = Input;

// Helper function to get initials for avatar
const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const LeadComments = ({ leadId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Function to fetch comments
  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`http://localhost:5002/api/comments/${leadId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setComments(data);
    } catch (err) {
      message.error("Failed to fetch comments.");
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Function to add a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      message.warning("Comment cannot be empty.");
      return;
    }
    setCommentSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5002/api/comments/${leadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      if (res.ok) {
        message.success("Comment added successfully!");
        setNewComment('');
        fetchComments(); // Refresh comments list after adding
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (err) {
      message.error("Failed to add comment.");
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchComments();
    }
  }, [leadId]);

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2"><FiMessageSquare className="text-gray-600" /> Comments</h3>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
        {/* Comment Input Box */}
        <div className="flex items-start gap-3">
          <Avatar shape="square" className="!rounded-md bg-blue-500 text-white">
            {getInitials(currentUser.name)}
          </Avatar>
          <TextArea
            rows={2}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow"
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="primary"
            onClick={handleAddComment}
            loading={commentSubmitting}
            disabled={!newComment.trim()}
          >
            Add Comment
          </Button>
        </div>

        {/* List of Existing Comments */}
        <div className="mt-4 max-h-64 overflow-y-auto">
          {commentsLoading ? (
            <div className="text-center text-gray-500">Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 my-2 p-3 bg-white rounded-lg border border-gray-100">
                <Avatar src={comment.user.avatar} shape="square" className="!rounded-md bg-gray-400 text-white">
                  {!comment.user.avatar && getInitials(comment.user.name)}
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-gray-700">{comment.user.name}</div>
                  <div className="text-sm text-gray-500">{dayjs(comment.createdAt).fromNow()}</div>
                  <p className="mt-1 text-gray-800">{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No comments yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadComments;