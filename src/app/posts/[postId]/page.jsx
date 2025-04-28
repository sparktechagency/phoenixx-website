"use client";
import { EllipsisOutlined, MessageOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Dropdown, Empty, Input, Menu, message, Select } from 'antd';
import moment from 'moment';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEye, FaHeart, FaRegHeart } from "react-icons/fa";

// API hooks
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useReplayCommentMutation,
  useUpdateCommentMutation
} from '@/features/comments/commentApi';
import { useLikePostMutation, usePostDetailsQuery } from '@/features/post/postApi';
import { useGetSaveAllPostQuery, useSavepostMutation } from '@/features/SavePost/savepostApi';

// Components
import ReportPostModal from '@/components/ReportPostModal';

// Utils
import { useGetProfileQuery } from '@/features/profile/profileApi';
import { baseURL } from '../../../../utils/BaseURL';

const PostDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { postId } = params;

  const commentInputRef = useRef(null);

  const {
    data: postDetails,
    isLoading,
    error: postError,
    refetch
  } = usePostDetailsQuery(postId);

  const [likePost] = useLikePostMutation();
  const [savepost] = useSavepostMutation();
  const { data: savedPostsData } = useGetSaveAllPostQuery();
  const [createComment, { isLoading: createCommentLoading }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [likeComment, { isLoading: likeCommentLoading }] = useLikeCommentMutation();
  const [replayComment, { isLoading: replayCommentLoading }] = useReplayCommentMutation();
  const [editComment, { isLoading: editCommentLoading }] = useUpdateCommentMutation();
  const { data: profile } = useGetProfileQuery();

  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [commentSort, setCommentSort] = useState('relevant');
  const [windowWidth, setWindowWidth] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [login_user_id, setLoginUserId] = useState(null);

  const post = postDetails?.data;
  const comments = post?.comments || [];
  const isSaved = savedPostsData?.data?.some(savedPost => savedPost?.postId?._id === postId);
  const isLiked = post?.likes?.includes(login_user_id);
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const currentUser = {
    _id: login_user_id || "",
    name: "Current User",
    avatar: "/images/profile2.jpg",
  };

  useEffect(() => {
    const userId = localStorage.getItem("login_user_id");
    setLoginUserId(userId);
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    if (timestamp === "Just now") return timestamp;

    const now = moment();
    const commentTime = moment(timestamp);

    if (now.diff(commentTime, 'seconds') < 60) {
      return "Just now";
    }

    return commentTime.fromNow();
  };
  const sortComments = (commentsToSort) => {
    if (!commentsToSort || !Array.isArray(commentsToSort)) return [];

    const sorted = [...commentsToSort];

    if (commentSort === 'recent') {
      // Sort by creation date, newest first
      return sorted.sort((a, b) => {
        // Handle "Just now" comments
        const aDate = a.createdAt === "Just now" ? new Date() : new Date(a.createdAt);
        const bDate = b.createdAt === "Just now" ? new Date() : new Date(b.createdAt);
        return bDate - aDate; // Newest first
      });
    } else if (commentSort === 'relevant') {
      // Sort by relevance (likes count first, then recency)
      return sorted.sort((a, b) => {
        const bLikes = b.likes?.length || 0;
        const aLikes = a.likes?.length || 0;

        // First sort by likes count
        if (bLikes !== aLikes) return bLikes - aLikes;

        // If likes are equal, sort by recency
        const aDate = a.createdAt === "Just now" ? new Date() : new Date(a.createdAt);
        const bDate = b.createdAt === "Just now" ? new Date() : new Date(b.createdAt);
        return bDate - aDate; // Newer comments are more relevant if likes are equal
      });
    }

    // Default to relevant sorting
    return sorted;
  };
  const handleLike = async () => {
    if (!login_user_id) {
      return message.warning("Please login to like this post");
    }

    try {
      await likePost(postId).unwrap();
      refetch();
      message.success("Post like status updated");
    } catch (error) {
      console.error("Error liking post:", error);
      message.error("Failed to like post");
    }
  };

  const handleSaveUnsave = async () => {
    if (!login_user_id) {
      return message.warning("Please login to save this post");
    }

    try {
      const response = await savepost({ postId }).unwrap();
      message.success(response?.data !== null ? 'Post saved successfully' : 'Post removed from saved items');
    } catch (error) {
      console.error('Save/Unsave error:', error);
      message.error('Failed to update saved status');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success("URL copied to clipboard"))
      .catch(() => toast.success("Failed to copy URL"));
  };

  const handleCommentButtonClick = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !login_user_id) {
      if (!login_user_id) {
        return message.warning("Please login to add a comment");
      }
      return;
    }

    try {
      const tempComment = {
        _id: `temp-${Date.now()}`,
        postId,
        author: {
          _id: login_user_id,
          userName: profile?.data?.userName || "You",
          profile: profile?.data?.profile
        },
        content: commentText,
        status: "active",
        likes: [],
        replies: [],
        createdAt: "Just now",
        updatedAt: "Just now"
      };

      const response = await createComment({
        postId,
        content: commentText
      }).unwrap();

      await refetch();
      setCommentText('');
      toast.success("Comment posted successfully");
    } catch (error) {
      console.error("Error creating comment:", error);
      message.error("Failed to add comment");
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!login_user_id) {
      return message.warning("Please login to like this comment");
    }

    try {
      await likeComment(commentId).unwrap();
      refetch();
    } catch (error) {
      console.error("Error liking comment:", error);
      message.error(error.data?.message || "Failed to like comment");
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyText.trim() || !login_user_id) {
      if (!login_user_id) return message.warning("Please login to reply to comments");
      return;
    }

    try {
      await replayComment({
        id: parentCommentId,
        body: {
          postId,
          content: replyText
        }
      }).unwrap();

      setReplyText('');
      setReplyingTo(null);
      refetch();
    } catch (error) {
      console.error("Error replying to comment:", error);
      message.error(error.data?.message || "Failed to add reply");
    }
  };

  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentText);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    try {
      await editComment({
        id: commentId,
        body: {
          content: editCommentText
        }
      }).unwrap();

      setEditingCommentId(null);
      setEditCommentText('');
      refetch();
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!login_user_id) {
      return message.warning("Please login to delete this comment");
    }

    try {
      await deleteComment(commentId).unwrap();
      toast.success("Comment deleted");
      refetch();
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error(error.data?.message || "Failed to delete comment");
    }
  };

  const postMenuItems = [
    {
      key: 'save',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Image
            src={"/icons/save_post.png"}
            height={16}
            width={16}
            alt="save"
          />
          <span>{isSaved ? "Unsave post" : "Save post"}</span>
        </div>
      ),
    },
    {
      key: 'report',
      label: (
        <div className="flex items-center gap-2 py-1">
          <Image src="/icons/report.png" height={16} width={16} alt="report" />
          <span>Report Post</span>
        </div>
      ),
    },
  ];

  const handlePostMenuClick = ({ key }) => {
    if (key === 'save') handleSaveUnsave();
    else if (key === 'report') setShowReportModal(true);
  };

  const renderCommentMenu = (comment) => {
    const isCurrentUserComment = comment.author?._id === login_user_id;

    return (
      <Menu>
        {isCurrentUserComment && (
          <>
            <Menu.Item key="edit" onClick={() => handleEditComment(comment._id, comment.content)}>
              Edit Comment
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => handleDeleteComment(comment._id)}>
              Delete Comment
            </Menu.Item>
          </>
        )}
        {!isCurrentUserComment && (
          <Menu.Item key="report">Report Comment</Menu.Item>
        )}
      </Menu>
    );
  };

  const renderComment = (comment, depth = 0) => {

    if (!comment) return null;

    const isEditing = editingCommentId === comment._id;
    const isCommentLiked = comment.likes?.includes(login_user_id);
    const commentAuthor = comment.author || { userName: "Unknown" };

    const authorImage = commentAuthor.profile || commentAuthor.avatar;
    return (
      <div
        key={comment._id}
        className={`mb-4 ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}
      >
        <Card className="rounded-2xl">
          <div className="flex items-center justify-start mb-3 ">
            {authorImage ? (
              <Avatar src={`${baseURL}${authorImage}`} size={32} />
            ) : (
              <Avatar size={32}>{commentAuthor.userName?.charAt(0).toUpperCase() || 'U'}</Avatar>
            )}
            <div className="ml-2">
              <div className="font-medium">{commentAuthor.userName}</div>
              <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
            </div>
            <div className="ml-auto">
              <Dropdown
                overlay={renderCommentMenu(comment)}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button type="text" icon={<EllipsisOutlined />} />
              </Dropdown>
            </div>
          </div>

          {isEditing ? (
            <div className="mb-3">
              <Input.TextArea
                value={editCommentText}
                onChange={(e) => setEditCommentText(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
              <div className="flex justify-end mt-2">
                <Button onClick={() => setEditingCommentId(null)} className="mr-2">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleUpdateComment(comment._id)}
                  disabled={!editCommentText.trim() || editCommentLoading}
                  loading={editCommentLoading && editingCommentId === comment._id}
                >
                  Update
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 mb-3 pl-10">
              {comment.content}
            </p>
          )}

          <div className="flex items-center text-gray-600">
            <button
              className="flex items-center mr-4 hover:text-blue-500 cursor-pointer"
              onClick={() => handleCommentLike(comment._id)}
              disabled={likeCommentLoading}
            >
              {isCommentLiked ? (
                <FaHeart className="mr-1 text-red-500" />
              ) : (
                <FaRegHeart className="mr-1" />
              )}
              <span>{comment.likes?.length || 0}</span>
            </button>

            <button
              className="flex items-center hover:text-blue-500 cursor-pointer"
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
            >
              <MessageOutlined className="mr-1" />
              <span>Reply</span>
            </button>
          </div>

          {replyingTo === comment._id && (
            <div className="mt-3 ml-10">
              <Input.TextArea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleReplySubmit(comment._id)}
                  loading={replayCommentLoading}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="mt-3 ml-6 border-l-2 border-gray-200 pl-4">
              {sortComments(comment.replies).map(reply =>
                renderComment(reply, depth + 1)
              )}
            </div>
          )}
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <Card loading={true} style={{ width: 300 }} />
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <Card className="text-center">
          <Empty
            description={
              <span className="text-red-500">
                {postError?.message || 'Post not found. It may have been deleted.'}
              </span>
            }
          />
          <Button type="primary" onClick={() => router.push('/')} className="mt-4">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] p-4">
      <main className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className={`rounded-lg bg-white shadow ${isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-5'}`}>
            <div onClick={() => router.push(`/profiles/${post?.author?._id}`)} className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                {post.author?.profile ? (
                  <img
                    src={`${baseURL}${post.author.profile}`}
                    alt="Author avatar"
                    className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full cursor-pointer`}
                  />
                ) : (
                  <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-gray-300 flex items-center justify-center text-xs`}>
                    {post.author?.userName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <div className="flex flex-col justify-start items-start">
                  <span className={`font-medium cursor-pointer ${isMobile ? 'text-xs' : 'text-base'} text-gray-900`}>
                    {post.author?.userName || "Anonymous"}
                  </span>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>

              <Dropdown
                menu={{ items: postMenuItems, onClick: handlePostMenuClick }}
                placement="bottomRight"
                trigger={['click']}
              >
                <button className="font-bold p-1 rounded hover:bg-gray-100 cursor-pointer">
                  <EllipsisOutlined className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </button>
              </Dropdown>
            </div>

            {post.title && (
              <h2 className={`${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'} font-bold mb-3`}>
                {post.title}
              </h2>
            )}

            <div
              className={`mb-3 text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post?.image && (
              <div className="mb-4">
                <Image
                  src={`${baseURL}${post?.image}`}
                  alt={post.title || "Post image"}
                  width={800}
                  height={350}
                  className="w-full h-[350px] rounded-lg object-cover"
                />
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 sm:gap-6">
                <button onClick={handleLike} className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                  {isLiked ?
                    <FaHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-red-500`} /> :
                    <FaRegHeart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
                  }
                  <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>{post.likes?.length || 0}</span>
                </button>

                <button
                  onClick={() => {
                    handleCommentButtonClick();
                    if (login_user_id) {
                      commentInputRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                >
                  <MessageOutlined className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-700`}>{comments.length}</span>
                </button>

                {post.category && (
                  <span className="bg-[#E6E6FF] text-xs py-1 px-2 rounded">
                    {post.category?.name || "General"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                  <FaEye className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  <span>{post.views || 0}</span>
                </div>

                <button onClick={handleShare} className="text-gray-500 px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-sm">
                  <Image src="/icons/share.png" width={20} height={20} alt="share button" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleCommentSubmit} className="mb-4">
          <div className="flex gap-3 items-center">
            {login_user_id ? (
              currentUser.avatar ? (
                <Avatar src={`${baseURL}${profile?.data?.profile}`} size={32} />
              ) : (
                <Avatar size={32}>{currentUser.name?.charAt(0).toUpperCase() || 'U'}</Avatar>
              )
            ) : (
              <Avatar size={32} icon={<MessageOutlined />} />
            )}
            <Input
              ref={commentInputRef}
              placeholder={login_user_id ? "Add a comment..." : "Login to comment"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="rounded-full bg-gray-100 border-gray-200"
              disabled={!login_user_id}
            />
          </div>
          <Button
            type="primary"
            htmlType="submit"
            className="mt-2 ml-12"
            disabled={!commentText.trim() || !login_user_id || createCommentLoading}
            loading={createCommentLoading}
          >
            Post Comment
          </Button>
          {!login_user_id && (
            <span className="text-sm text-gray-500 ml-2">
              Please login to comment
            </span>
          )}
        </form>

        <div id="comments" className='flex flex-col gap-3'>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-800">Comments ({comments.length})</h3>
            <Select
              value={commentSort}
              onChange={setCommentSort}
              className="text-gray-600"
              options={[
                { value: 'relevant', label: 'Most relevant' },
                { value: 'recent', label: 'Most recent' },
              ]}
            />
          </div>

          {comments.length === 0 ? (
            <Card className="text-center p-8">
              <Empty
                description={
                  <span className="text-gray-500">
                    No comments yet. Be the first to comment!
                  </span>
                }
              />
            </Card>
          ) : (
            sortComments(comments).map(comment => renderComment(comment))
          )}
        </div>
      </main>

      <ReportPostModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={postId}
      />
    </div>
  );
};

export default PostDetailsPage;
