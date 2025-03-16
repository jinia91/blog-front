import { type Article } from '../(domain)/post'

export const mocks: Article[] = [
  {
    id: 1,
    title: '포스트 1',
    content: '포스트 1 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'React', id: 1 }, { name: 'TypeScript', id: 2 }],
    likes: 10,
    comments: 5
  },
  {
    id: 2,
    title: '포스트 2',
    content: '포스트 2 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'React', id: 1 }],
    likes: 10,
    comments: 5
  },
  {
    id: 3,
    title: '포스트 3',
    content: '포스트 3 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'TypeScript', id: 2 }],
    likes: 10,
    comments: 5
  },
  {
    id: 4,
    title: '포스트 4',
    content: '포스트 4 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'Next.js', id: 3 }],
    likes: 10,
    comments: 5
  },
  {
    id: 5,
    title: '포스트 5',
    content: '포스트 5 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'Next.js', id: 3 }],
    likes: 10,
    comments: 5
  },
  {
    id: 6,
    title: '포스트 6',
    content: '포스트 6 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'Next.js', id: 3 }],
    likes: 10,
    comments: 5
  },
  {
    id: 7,
    title: '포스트 7',
    content: '포스트 7 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'React', id: 1 }],
    likes: 10,
    comments: 5
  }, {
    id: 8,
    title: '포스트 8',
    content: '포스트 8 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'React', id: 1 }],
    likes: 10,
    comments: 5
  }
]
