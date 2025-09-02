import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Input, Button, message, Popconfirm, Dropdown, Menu, Space } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MoreOutlined } from '@ant-design/icons';
import { FiMessageSquare, FiSend } from 'react-icons/fi';
import { io } from 'socket.io-client';
import api from '../../../utils/axiosInstance';

dayjs.extend(relativeTime);

const { TextArea } = Input;

const getInitials = (name) => {
  if (!name) return '?';
  const nameParts = name.split(' ');
  const initials = nameParts.length > 1 
    ? nameParts[0].charAt(0) + nameParts[1].charAt(0) 
    : nameParts[0].charAt(0);
  return initials.toUpperCase();
};

const LeadComments = ({ leadId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const socketRef = useRef(null);
  const commentsEndRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [isAssigned, setIsAssigned] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const { data } = await api.get(`/comments/${leadId}`);
      setComments(data);
    } catch (err) {
      message.error("Failed to fetch comments.");
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      message.warning("Comment cannot be empty.");
      return;
    }
    setCommentSubmitting(true);
    try {
      await api.post(`/comments/${leadId}`, { content: newComment.trim() });
        setNewComment('');
      
    } catch (err) {
      message.error("Failed to add comment.");
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const saveEdit = async (comment) => {
    if (!editingContent.trim()) return message.warning('Comment cannot be empty');
    try {
      await api.patch(`/comments/${leadId}/${comment.id}`, { content: editingContent.trim() });
      setEditingId(null);
      setEditingContent('');
    } catch (err) {
      console.error(err);
      message.error('Failed to edit comment');
    }
  };

  const deleteComment = async (comment) => {
    try {
      await api.delete(`/comments/${leadId}/${comment.id}`);
    } catch (err) {
      console.error(err);
      message.error('Failed to delete comment');
    }
  };

  // Auto-scroll to the bottom when new comments are added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  useEffect(() => {
    if (!leadId) return;
    // Fetch profile and assignment
    (async () => {
      try {
        const { data: prof } = await api.get('/users/profile');
        setProfile(prof);
        try {
          const { data: assignments } = await api.get(`/assigns/${leadId}/assignments`);
          const assignedIds = (assignments || []).map(a=>a.user?.id);
          setIsAssigned(assignedIds.includes(prof.id));
        } catch {
          setIsAssigned(true);
        }
      } catch {}
    })();
    fetchComments();

    const socket = io('http://localhost:5002', {
      withCredentials: true,
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.emit('joinLeadRoom', leadId);

    const handleAdded = (comment) => {
      if (comment.leadId === leadId) {
        setComments((prev) => [...prev, comment]);
      }
    };
    const handleEdited = (comment) => {
      if (comment.leadId === leadId) {
        setComments((prev) => prev.map((c) => (c.id === comment.id ? comment : c)));
      }
    };
    const handleDeleted = ({ id, leadId: evtLeadId }) => {
      if (evtLeadId === leadId) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    };

    socket.on('leadCommentAdded', handleAdded);
    socket.on('leadCommentEdited', handleEdited);
    socket.on('leadCommentDeleted', handleDeleted);

    return () => {
      try {
        socket.emit('leaveLeadRoom', leadId);
        socket.off('leadCommentAdded', handleAdded);
        socket.off('leadCommentEdited', handleEdited);
        socket.off('leadCommentDeleted', handleDeleted);
        socket.disconnect();
      } catch {}
    };
  }, [leadId]);

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <FiMessageSquare className="text-2xl text-indigo-500" />
        <h3 className="font-bold text-xl text-gray-800">Comments</h3>
      </div>
      
      {/* List of Existing Comments */}
      <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {commentsLoading ? (
          <div className="text-center text-gray-500 py-10">
            <span className="animate-pulse">Loading comments...</span>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-4 mb-6">
              <Avatar src={comment.user.avatar} className="!w-10 !h-10 border-2 border-gray-200">
                {!comment.user.avatar && getInitials(comment.user.name)}
              </Avatar>
              <div className="flex-1 bg-gray-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">{comment.user.name}</span>
                  <span className="text-xs text-gray-500">
                    {dayjs(comment.createdAt).fromNow()}
                  </span>
                  {(profile && (profile.id === comment.user.id || ['admin','super admin','superadmin'].includes(profile.role))) && (
                    <div className="ml-auto flex items-center gap-2 text-xs">
                      {editingId === comment.id ? (
                        <Space>
                          <Button size="small" type="primary" onClick={() => saveEdit(comment)}>Save</Button>
                          <Button size="small" onClick={cancelEdit}>Cancel</Button>
                        </Space>
                      ) : (
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item key="edit" onClick={() => startEdit(comment)}>
                                Edit
                              </Menu.Item>
                              <Menu.Item key="delete">
                                <Popconfirm
                                  title="Are you sure you want to delete this comment?"
                                  onConfirm={() => deleteComment(comment)}
                                  okText="Yes"
                                  cancelText="No"
                                >
                                  <div className="text-red-500">Delete</div>
                                </Popconfirm>
                              </Menu.Item>
                            </Menu>
                          }
                          trigger={['click']}
                        >
                          <a onClick={(e) => e.preventDefault()} className="text-gray-500 hover:text-gray-800 transition-colors">
                            <MoreOutlined style={{ fontSize: '18px' }} />
                          </a>
                        </Dropdown>
                      )}
                    </div>
                  )}
                </div>
                {editingId === comment.id ? (
                  <Input.TextArea rows={2} value={editingContent} onChange={(e)=>setEditingContent(e.target.value)} />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">No comments yet.</div>
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Comment Input Box */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
        <Avatar src={profile?.avatar} className="!w-10 !h-10 border-2 border-indigo-500">
          {!profile?.avatar && getInitials(profile?.name)}
        </Avatar>
        <Input
          placeholder={isAssigned ? "Write a new comment..." : "Only assignees can comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onPressEnter={isAssigned ? handleAddComment : undefined}
          disabled={!isAssigned}
          className="flex-1 rounded-full py-2 px-4 bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <Button
          type="primary"
          shape="circle"
          icon={<FiSend />}
          onClick={handleAddComment}
          loading={commentSubmitting}
          disabled={!newComment.trim() || !isAssigned}
          className="shadow-lg transition-all"
        />
      </div>
    </div>
  );
};

export default LeadComments;