"use client";

import { useState, useEffect } from 'react';
import { AiOutlineHeart, AiFillHeart, AiOutlineShareAlt, AiOutlineSend, AiOutlineMessage, 
         AiOutlineEye, AiOutlineCalendar, AiOutlineTag, AiOutlineBook } from 'react-icons/ai';

export default function PostPage({ params }) {
  const { category, postName, postId } = params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    name: "Current User",
    avatar: "",
    username: "currentuser"
  });

  useEffect(() => {
    // In a real app, you would fetch the post data from an API
    // using the postId from params
    const fetchPost = async () => {
      try {
        // Simulating API response for demo purposes
        const mockPost = {
          id: postId,
          title: postName.split('-').join(' '),
          content: "This is a placeholder content for the post. In a real application, this would be fetched from an API. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras porttitor metus in sem finibus, sit amet ultricies sem pretium. Donec finibus sapien eget semper fringilla. Sed eget ex sit amet magna euismod accumsan. Integer efficitur, arcu vitae ullamcorper ullamcorper, urna dui lobortis urna, vel vehicula ex augue id urna. Proin quis tellus at magna efficitur aliquet.",
          author: {
            name: "John Doe",
            username: "johndoe",
            avatar: "",
            bio: "Content creator passionate about technology and design"
          },
          timePosted: "April 5, 2025",
          category: category,
          image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
          tags: ["technology", "design", "tutorial"],
          stats: {
            likes: 42,
            comments: [
              {
                id: "comment1",
                author: {
                  name: "Jane Smith",
                  username: "janesmith",
                  avatar: ""
                },
                text: "Great post! Thanks for sharing.",
                createdAt: new Date().toISOString(),
                likes: 5,
                isLiked: false,
                replies: [
                  {
                    id: "reply1",
                    author: {
                      name: "Mike Johnson",
                      username: "mikej",
                      avatar: ""
                    },
                    text: "I agree with Jane, this is really helpful!",
                    createdAt: new Date().toISOString(),
                    likes: 2,
                    isLiked: false
                  }
                ]
              }
            ],
            reads: 128
          },
          isLiked: false,
          estimatedReadTime: "5 min read",
          relatedPosts: [
            { id: "related1", title: "Related Post 1", image: "" },
            { id: "related2", title: "Related Post 2", image: "" }
          ]
        };
        
        setPost(mockPost);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, postName, category]);




  useEffect(() => {
    // This runs after the post data is loaded
    if (!loading && post) {
      // Check the URL hash
      const hash = window.location.hash;
      
      if (hash === '#comments') {
        // Scroll to and focus the comment input
        const commentInput = document.querySelector('input[type="text"]');
        if (commentInput) {
          commentInput.focus();
          commentInput.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Scroll to top if no hash or hash is #top
        window.scrollTo(0, 0);
      }
    }
  }, [loading, post]);

  const handleLike = () => {
    if (post) {
      setPost({
        ...post,
        isLiked: !post.isLiked,
        stats: {
          ...post.stats,
          likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1
        }
      });
    }
  };

  const handleCommentLike = (commentId, isReply = false, replyId = null) => {
    if (!post) return;

    setPost({
      ...post,
      stats: {
        ...post.stats,
        comments: post.stats.comments.map(comment => {
          if (isReply && comment.id === commentId) {
            // Handle reply like
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply.id === replyId) {
                  return {
                    ...reply,
                    isLiked: !reply.isLiked,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                  };
                }
                return reply;
              })
            };
          } else if (!isReply && comment.id === commentId) {
            // Handle comment like
            return {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
            };
          }
          return comment;
        })
      }
    });
  };

  const handleReply = (commentId, authorUsername) => {
    setReplyingTo({ commentId, authorUsername });
    setCommentText(`@${authorUsername} `);
    document.querySelector('input[type="text"]')?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    
    if (commentText.trim() && post) {
      const newCommentOrReply = {
        id: `comment${Date.now()}`,
        author: currentUser,
        text: commentText,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };

      if (replyingTo) {
        // Add reply to existing comment
        setPost({
          ...post,
          stats: {
            ...post.stats,
            comments: post.stats.comments.map(comment => {
              if (comment.id === replyingTo.commentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newCommentOrReply]
                };
              }
              return comment;
            })
          }
        });
        cancelReply();
      } else {
        // Add new top-level comment
        setPost({
          ...post,
          stats: {
            ...post.stats,
            comments: [...post.stats.comments, newCommentOrReply]
          }
        });
        setCommentText('');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Post Not Found</h2>
        <p className="text-gray-600">The post you are looking for might have been removed or is temporarily unavailable.</p>
      </div>
    );
  }

  const renderCommentActions = (comment, isReply = false, parentId = null) => {
    return (
      <div className="flex items-center gap-4 mt-2 text-sm">
        <button 
          onClick={() => handleCommentLike(comment.id, isReply, isReply ? comment.id : null)}
          className="flex items-center gap-1 text-gray-500 hover:text-red-500"
        >
          {comment.isLiked ? 
            <AiFillHeart className="w-4 h-4 text-red-500" /> : 
            <AiOutlineHeart className="w-4 h-4" />
          }
          <span>{comment.likes || 0}</span>
        </button>
        
        {!isReply && (
          <button 
            onClick={() => handleReply(parentId || comment.id, comment.author.username)}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
          >
            <AiOutlineMessage className="w-4 h-4" />
            <span>Reply</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero section with image */}
      {post.image && (
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${post.image})` }}
          >
            <div className="absolute inset-0 bg- bg-opacity-50"></div>
          </div>
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
            <div className="inline-block bg-primary  text-white text-sm font-medium px-3 py-3 w-20 text-center rounded mb-4">
              {post.category}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl">
              {post.title}
            </h1>
            <div className="flex items-center text-white gap-4">
              <div className="flex items-center gap-2">
                <AiOutlineCalendar className="w-4 h-4" />
                <span className="text-sm">{post.timePosted}</span>
              </div>
              <div className="flex items-center gap-2">
                <AiOutlineBook className="w-4 h-4" />
                <span className="text-sm">{post.estimatedReadTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <AiOutlineEye className="w-4 h-4" />
                <span className="text-sm">{post.stats.reads} reads</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md -mt-10 relative z-20 p-6 md:p-8">
          {/* Author information */}
          <div className="flex items-center justify-between mb-8 border-b pb-6">
            <div className="flex items-center gap-4">
              {post.author.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt="Author avatar" 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-lg text-white font-bold border-2 border-white shadow-sm">
                  {post.author.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-bold text-gray-900">{post.author.name}</div>
                <div className="text-sm text-gray-500">@{post.author.username}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLike}
                className="flex items-center gap-1 px-3 py-2 border rounded-full hover:bg-gray-50 transition-colors"
              >
                {post.isLiked ? 
                  <AiFillHeart className="w-5 h-5 text-red-500" /> : 
                  <AiOutlineHeart className="w-5 h-5 text-gray-500" />
                }
                <span className="font-medium">{post.stats.likes}</span>
              </button>
              
              <button 
                onClick={() => {/* Share functionality */}}
                className="flex items-center gap-1 px-3 py-2 border rounded-full hover:bg-gray-50 transition-colors"
              >
                <AiOutlineShareAlt className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Share</span>
              </button>
            </div>
          </div>
          
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <AiOutlineTag className="w-5 h-5 text-gray-500" />
              {post.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-700 text-sm py-1 px-3 rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Post content */}
          <div className="prose prose-lg max-w-none mb-10">
            <p className="text-gray-700 leading-relaxed">{post.content}</p>
          </div>
        </div>
      </div>
      
      {/* Comments section */}
      <div className="container mx-auto px-4 max-w-3xl mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Comments ({post.stats.comments?.length || 0})</h2>
          
          {/* Comment form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-8">
            {currentUser?.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt="Your avatar" 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-lg text-white font-bold">
                {currentUser?.name?.charAt(0).toUpperCase() || 'Y'}
              </div>
            )}
            <div className="flex-1 flex flex-col gap-2">
              {replyingTo && (
                <div className="flex items-center justify-between bg-blue-50 px-3 py-1 rounded-t-lg">
                  <span className="text-sm text-blue-600">Replying to @{replyingTo.authorUsername}</span>
                  <button 
                    type="button"
                    onClick={cancelReply}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex">
                    <input
                    id="comment-input"
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyingTo ? "Write your reply..." : "Add to the discussion"}
                    className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="bg-blue-600 text-white rounded-r-lg px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <AiOutlineSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
          
          {/* Existing comments */}
          {post.stats.comments?.length > 0 ? (
            <div className="space-y-6">
              {post.stats.comments.map(comment => (
                <div key={comment.id} className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    {comment.author?.avatar ? (
                      <img 
                        src={comment.author.avatar} 
                        alt="Comment author avatar" 
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-lg text-white font-bold">
                        {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            {comment.author?.username || comment.author?.name || 'Unknown'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p>{comment.text}</p>
                        {renderCommentActions(comment)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Replies */}
                  {comment.replies?.length > 0 && (
                    <div className="ml-14 pl-4 border-l-2 border-gray-200 space-y-4">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-3">
                          {reply.author?.avatar ? (
                            <img 
                              src={reply.author.avatar} 
                              alt="Reply author avatar" 
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-sm text-white font-bold">
                              {reply.author?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-sm">
                                  {reply.author?.username || reply.author?.name || 'Unknown'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm">{reply.text}</p>
                              {renderCommentActions(reply, true, comment.id)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-gray-500 font-medium">Be the first to add to the discussion!</div>
              <p className="text-gray-400 text-sm mt-2">Your thoughts and opinions matter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}