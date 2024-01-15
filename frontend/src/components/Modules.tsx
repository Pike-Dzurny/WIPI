export interface User {
    account_name: string;
    bio: string | null;
    display_name: string;
    profile_picture: string | null;
  }
  
export interface Post {
    post: any;
    date_of_post: string;
    likes_count: number;
    comments_count: number;
    id: number;
    content: string;
    user_poster_id: number;
    user: User;
    profile_picture: string;
    user_display_name: string;
}


