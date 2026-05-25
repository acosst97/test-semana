export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: any;
  gender: any;

  maidenName: string;
  age: number;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  bloodGroup: string;
}

export interface Reactions {
  likes: number;
  dislikes: number;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: Reactions; 
  views: number;
  userId: number;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}