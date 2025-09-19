import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Input, Button, message, Popconfirm, Dropdown, Menu, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MoreOutlined, CloseCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FiMessageSquare, FiSend, FiCornerUpLeft } from 'react-icons/fi';
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
    const [replyTo, setReplyTo] = useState(null);
    const inputRef = useRef(null);

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
            const payload = {
                content: newComment.trim(),
                replyToId: replyTo?.id || null,
            };
            await api.post(`/comments/${leadId}`, payload);
            setNewComment('');
            cancelReply();
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

    const startReply = (comment) => {
        setReplyTo({ id: comment.id, name: comment.user.name, content: comment.content });
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const cancelReply = () => {
        setReplyTo(null);
        setNewComment('');
    };

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    useEffect(() => {
        if (!leadId) return;
        (async () => {
            try {
                const { data: prof } = await api.get('/users/profile');
                setProfile(prof);
                try {
                    const { data: assignments } = await api.get(`/assigns/${leadId}/assignments`);
                    const assignedIds = (assignments || []).map(a => a.user?.id);
                    setIsAssigned(assignedIds.includes(prof.id));
                } catch {
                    setIsAssigned(true);
                }
            } catch { }
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
            } catch { }
        };
    }, [leadId]);

    const renderCommentContent = (comment) => {
        const parentComment = comment.replyTo;
        if (parentComment) {
            const parentAuthorName = parentComment.user?.name || 'User';
            return (
                <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
                        <FiCornerUpLeft className="text-blue-500 text-lg mt-1 rotate-180 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-xs font-medium text-blue-700 mb-1">
                                Replying to <span className="font-semibold">{parentAuthorName}</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed break-words whitespace-pre-wrap line-clamp-2">
                                {parentComment.content}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed break-words whitespace-pre-wrap pl-2 border-l-2 border-gray-200 ml-4">
                        {comment.content}
                    </p>
                </div>
            );
        }
        return (
            <p className="text-sm text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
                {comment.content}
            </p>
        );
    };

    const CommentActions = ({ comment }) => {
        if (editingId === comment.id) {
            return (
                <div className="flex flex-col gap-3 mt-3">
                    <TextArea
                        rows={3}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-end gap-2">
                        <Button 
                            size="small" 
                            onClick={cancelEdit}
                            className="px-4 py-1.5 text-sm font-medium"
                        >
                            Cancel
                        </Button>
                        <Button 
                            size="small" 
                            type="primary" 
                            onClick={() => saveEdit(comment)}
                            className="px-4 py-1.5 text-sm font-medium"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {profile && profile.id !== comment.user.id && (
                    <Button 
                        type="text" 
                        size="small" 
                        onClick={() => startReply(comment)} 
                        icon={<FiCornerUpLeft className="text-sm" />} 
                        className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors duration-200 text-sm"
                    >
                        Reply
                    </Button>
                )}
                {profile && profile.id === comment.user.id && (
                    <>
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<EditOutlined className="text-sm" />} 
                            onClick={() => startEdit(comment)}
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors duration-200 text-sm"
                        />
                        <Popconfirm
                            title="Delete this comment?"
                            description="This action cannot be undone."
                            onConfirm={() => deleteComment(comment)}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <Button 
                                type="text" 
                                size="small" 
                                icon={<DeleteOutlined className="text-sm" />} 
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors duration-200 text-sm"
                            />
                        </Popconfirm>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="-mt-1 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FiMessageSquare className="text-xl text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-800">Comments</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                            </p>
                        </div>
                    </div>
                    {comments.length > 0 && (
                        <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                            <span className="text-xs font-medium text-gray-600">Total:</span>
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {comments.length}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments List */}
            <div className="max-h-96 overflow-y-auto px-6 py-5 custom-scrollbar">
                {commentsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                        <p className="text-gray-500 text-sm">Loading comments...</p>
                    </div>
                ) : comments.length > 0 ? (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div 
                                key={comment.id} 
                                className="flex gap-4 group hover:bg-gray-50 p-4 rounded-xl transition-all duration-200 -mx-4 px-8"
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {comment.user.avatar ? (
                                        <img 
                                            src={comment.user.avatar} 
                                            alt={comment.user.name} 
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                            {getInitials(comment.user.name)}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Comment Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 text-sm">{comment.user.name}</span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">
                                                {dayjs(comment.createdAt).fromNow()}
                                            </span>
                                            {comment.createdAt !== comment.updatedAt && (
                                                <Tag color="blue" className="ml-2 text-xs">
                                                    edited
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {renderCommentContent(comment)}
                                    
                                    <CommentActions comment={comment} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FiMessageSquare className="text-3xl text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-700 mb-2">No comments yet</h4>
                        <p className="text-gray-500 text-sm max-w-md">
                            Be the first to leave a comment. Share your thoughts or ask questions about this lead.
                        </p>
                    </div>
                )}
                <div ref={commentsEndRef} />
            </div>

            {/* Comment Input */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-6">
                {replyTo && (
                    <div className="flex items-start gap-3 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <FiCornerUpLeft className="text-blue-500 text-lg mt-1 rotate-180 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-blue-700">Replying to {replyTo.name}</span>
                                <button 
                                    onClick={cancelReply}
                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1 rounded-full transition-colors duration-200"
                                    aria-label="Cancel reply"
                                >
                                    <CloseCircleOutlined className="text-sm" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-blue-100 break-words">
                                "{replyTo.content.substring(0, 100)}{replyTo.content.length > 100 ? '...' : ''}"
                            </p>
                        </div>
                    </div>
                )}
                
                <div className="flex gap-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0 mt-1">
                        {profile?.avatar ? (
                            <img 
                                src={profile.avatar} 
                                alt={profile.name} 
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                {getInitials(profile?.name)}
                            </div>
                        )}
                    </div>
                    
                    {/* Comment Form */}
                    <div className="flex-1">
                        <div className="relative">
                            <TextArea
                                placeholder={isAssigned ? "Write a comment..." : "Only assignees can comment on this lead"}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onPressEnter={(e) => {
                                    if (isAssigned && e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                                disabled={!isAssigned}
                                autoSize={{ minRows: 3, maxRows: 6 }}
                                ref={inputRef}
                                className={`w-full p-4 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                                    !isAssigned ? 'bg-gray-100 text-gray-400' : 'bg-white'
                                }`}
                            />
                            
                            {!isAssigned && (
                                <div className="absolute top-2 right-2">
                                    <Tag color="warning" className="text-xs">
                                        Assignee only
                                    </Tag>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                            <div className="text-xs text-gray-500">
                                {isAssigned ? "Press Enter to send, Shift+Enter for new line" : "You need to be assigned to comment"}
                            </div>
                            <Button
                                type="primary"
                                icon={<FiSend size={16} />}
                                onClick={handleAddComment}
                                loading={commentSubmitting}
                                disabled={!newComment.trim() || !isAssigned}
                                className="flex items-center gap-2 px-5 py-2 h-auto bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                                {commentSubmitting ? 'Sending...' : 'Post Comment'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadComments;