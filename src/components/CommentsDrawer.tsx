import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { FeedPost, PostComment, SquashMember } from '../types';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  post: FeedPost | null;
  currentUser: SquashMember;
  onAddComment: (postId: string, commentText: string, author: SquashMember) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  post,
  currentUser,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && post?.comments?.length) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [post?.comments?.length, isOpen]);

  if (!isOpen || !post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(post.id, commentText.trim(), currentUser);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
      <div className="bg-[#161822] border-t sm:border border-white/[0.12] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-4 py-3 bg-[#11131a] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#f5c200]" />
            <h3 className="font-chivo font-black text-sm text-white">
              댓글 {post.commentsCount}개
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md"
          >
            <X size={18} />
          </button>
        </div>

        {/* Post Brief Reference */}
        <div className="px-4 py-2 bg-[#0c0e15]/70 border-b border-white/[0.06] text-xs text-gray-300 flex items-center gap-2">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-6 h-6 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="font-chivo font-bold text-white">{post.authorName}:</span>
          <span className="truncate text-gray-400">{post.caption}</span>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[45vh] no-scrollbar">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2.5">
              <img
                src={
                  comment.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt={comment.author}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 rounded-lg bg-[#11131a] border border-white/[0.06] p-2.5 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-chivo font-bold text-[#f5c200]">
                    {comment.author}
                  </span>
                  <span className="text-[10px] text-gray-500 font-chivo">
                    {comment.timeAgo}
                  </span>
                </div>
                <p className="text-gray-200 leading-relaxed font-normal">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}

          {post.comments.length === 0 && (
            <div className="py-8 text-center text-gray-500 text-xs">
              아직 작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-[#11131a] border-t border-white/[0.08] flex items-center gap-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover shrink-0"
            referrerPolicy="no-referrer"
          />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`${currentUser.name} (으)로 댓글 작성...`}
            className="flex-1 px-3 py-2 rounded-lg bg-[#161822] border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#f5c200]"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2 rounded-lg bg-[#f5c200] text-[#0f1118] font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
