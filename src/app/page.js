"use client";

import Banner from '@/components/Banner';
import CategoriesSidebar from '@/components/CategoriesSidebar';
import FeedNavigation from '@/components/FeedNavigation';
import PostCard from '@/components/PostCard';
import React, { useState } from 'react';

const Page = () => {
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: {
        name: "John Doe",
        username: "@johndoe",
        avatar: "/path/to/avatar.jpg"
      },
      timePosted: "2 hours ago",
      title: "My First Post",
      content: "This is a sample post content that will be truncated if it's too long...".repeat(5),
      image: "/path/to/image.jpg",
      tags: ["Technology", "Programming"],
      stats: {
        likes: 24,
        comments: [
          {
            id: 'c1',
            author: {
              name: "Jane Smith",
              username: "@janesmith"
            },
            text: "Great post!",
            createdAt: new Date()
          }
        ],
        reads: 150
      },
      isLiked: false
    },

    {
      id: '2',
      author: {
        name: "John Doe",
        username: "@johndoe",
        avatar: "/path/to/avatar.jpg"
      },
      timePosted: "2 hours ago",
      title: "My First Post",
      content: "This is a sample post content that will be truncated if it's too long...".repeat(5),
      image: "/path/to/image.jpg",
      tags: ["Technology", "Programming"],
      stats: {
        likes: 24,
        comments: [
          {
            id: 'c1',
            author: {
              name: "Jane Smith",
              username: "@janesmith"
            },
            text: "Great post!",
            createdAt: new Date()
          }
        ],
        reads: 150
      },
      isLiked: false
    },
  ]);

  const [gridNumber , setGridNumber] = useState(1);

  const currentUser = {
    name: "Current User",
    username: "@currentuser",
    avatar: "/path/to/currentuser.jpg"
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          stats: {
            ...post.stats,
            likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1
          }
        };
      }
      return post;
    }));
  };

  const handleCommentSubmit = (postId, commentText) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: `c${post.stats.comments.length + 1}`,
          author: currentUser,
          text: commentText,
          createdAt: new Date()
        };
        return {
          ...post,
          stats: {
            ...post.stats,
            comments: [...post.stats.comments, newComment]
          }
        };
      }
      return post;
    }));
  };

  const handleShare = (postId) => {
    console.log(`Sharing post ${postId}`);
    // Implement share functionality
  };

  const handleOptionSelect = (postId, option) => {
    console.log(`Option ${option} selected for post ${postId}`);
    // Implement option functionality
  };


  const handlefeedGrid = (num) => {
    setGridNumber(num)
  }


  return (
    <div className="">
      <Banner />
      <main role="main" className="p-6 flex items-start">
        <section aria-labelledby="category-heading" className='w-3/12'>
          
          {/* category section content */}
          <CategoriesSidebar />
        </section>
        
        <section aria-labelledby="feed-heading" className='w-6/12'>
          <FeedNavigation  handlefeedGrid={handlefeedGrid} />
          <div className={`grid grid-cols-${gridNumber} gap-4`}>
          {posts.map(post => (
        <PostCard
          key={post.id}
          postData={post}
          currentUser={currentUser}
          onLike={handleLike}
          onCommentSubmit={handleCommentSubmit}
          onShare={handleShare}
          onOptionSelect={handleOptionSelect}
        />
      ))}
          </div>
        </section>
        
        <section aria-labelledby="additional-heading" className='w-3/12'>
          {/* empty section content */}
        </section>
      </main>
    </div>
  );
};

export default Page;