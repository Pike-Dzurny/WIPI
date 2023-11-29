import React, { RefObject } from 'react';
//import { Post } from './Post'; // Replace with your actual Post type import
import { RealPost } from './RealPost'; // Replace with your actual RealPost component import


interface User {
    id: number;
    account_name: string;
  }
  

interface Post {
    user_poster_id: number;
    content: string;
    date_of_post: string;
    id: number;
    user: User;
  }


interface PostListProps {
    data?: { pages: Post[][] };
    ref: ((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null;
}



const PostList: React.FC<PostListProps> = ({ data, ref }) => (
  <>
    {data?.pages.map((page, i) => (
      <React.Fragment key={i}>
        {page.map((post: Post, index: number) => {
          const postElement = (
            <div className="h-100" key={post.id}>
              <RealPost post={post} />
            </div>
          );

          // If it's the last post of the last page, attach the ref for intersection observer
          if (i === data.pages.length - 1 && index === page.length - 1) {
            return <div ref={ref} key={post.id}>{postElement}</div>;
          }

          return postElement;
        })}
      </React.Fragment>
    ))}
  </>
);

export default PostList;