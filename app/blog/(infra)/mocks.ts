import { type Article } from '../(domain)/article'

export const mocks: Article[] = [
  {
    id: 1,
    title: '포스트 1',
    content: '포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용포스트 1 내용',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'React', id: 1 }, { name: 'TypeScript', id: 2 }],
    likes: 10,
    comments: 5
  },
  {
    id: 2,
    title: '포스트 2',
    content: '\n' +
      '\n' +
      '# 암호화\n' +
      '\n' +
      '- 평문(PainText)을 부호화하여 암호문(ChiperText)으로 만드는 행위\n' +
      '- Encryption / Decryption \n' +
      '\n' +
      '> 양방향 암호화\n' +
      '\n' +
      '- 양방향 암호화의 핵심은 혼돈과 확산\n' +
      '    - 혼돈 : 키와 암호문의 관계를 감추기위해 치환하기\n' +
      '    - 확산 :  평문과 암호문의 관계를 감추기 위해 0MixColumn으로 뒤섞기\n' +
      '\n' +
      '\n' +
      '![uploaded image](https://github.com/jinia91/blogBackUp/blob/main/img/213963220066336?raw=true)\n' +
      '\n' +
      '- 단순 치환만 한다면 위와같이 원문의 패턴이 그대로 드러나게된다.\n' +
      '- ECB 방식이며 CBC 방식이 추천되는 이유\n' +
      '\n' +
      '\n' +
      '# Hash\n' +
      '\n' +
      '- 복호화가 불가능하도록 암호화하는 행위\n' +
      '- 일반적으로 고정길이 값으로 반환하며 실 데이터가 해시값과 동일한지로 판단\n' +
      '- 암호화된 값을 Digest라 부름\n' +
      '- 동일한 평문에 대해 해시값 일치 문제를 해소하기 위해 Salt 사용\n' +
      '\n' +
      '> 단방향 암호화\n' +
      '\n' +
      '# Salt\n' +
      '\n' +
      '- 평문에 임의값을 추가함을 의미\n' +
      '- 다이제스트는 다르지만 일치여부는 체크 가능\n' +
      '\n' +
      '\n' +
      '## 암호화 방식\n' +
      '\n' +
      '- 대칭 암호화\n' +
      '    - DES(Data Encryption)\n' +
      '    - AES(Advanced Encryption)     \n' +
      '\n' +
      '# 암호화\n' +
      '\n' +
      '- 평문(PainText)을 부호화하여 암호문(ChiperText)으로 만드는 행위\n' +
      '- Encryption / Decryption \n' +
      '\n' +
      '> 양방향 암호화\n' +
      '\n' +
      '# Hash\n' +
      '\n' +
      '- 복호화가 불가능하도록 암호화하는 행위\n' +
      '- 일반적으로 고정길이 값으로 반환하며 실 데이터가 해시값과 동일한지로 판단\n' +
      '- 암호화된 값을 Digest라 부름\n' +
      '- 동일한 평문에 대해 해시값 일치 문제를 해소하기 위해 Salt 사용\n' +
      '\n' +
      '> 단방향 암호화\n' +
      '\n' +
      '# Salt\n' +
      '\n' +
      '- 평문에 임의값을 추가함을 의미\n' +
      '- 다이제스트는 다르지만 일치여부는 체크 가능\n' +
      '\n' +
      '\n' +
      '## 암호화 방식\n' +
      '\n' +
      '- 대칭 암호화\n' +
      '    - DES(Data Encryption)\n' +
      '    - AES(Advanced Encryption)     \n' +
      '\n' +
      '## 해시 방식\n' +
      '- MD5(Message Digest)\n' +
      '- SHA(Secure Hash)\n' +
      '\n' +
      ' \n' +
      '</details>\n' +
      '\n' +
      '\n' +
      '\n',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'React', id: 1 }],
    likes: 10,
    comments: 5
  },
  {
    id: 3,
    title: '포스트 3',
    content: '# Manual Scaling\n' +
      '\n' +
      '- 스케쥴러가 없어서 Pod가 노드에 배치되지 않는 상황이 있을시\n' +
      '- 파드에 직접 배치하기\n' +
      '- \n' +
      '\n' +
      '```yaml\n' +
      '---\n' +
      'apiVersion: v1\n' +
      'kind: Pod\n' +
      'metadata:\n' +
      '  name: nginx\n' +
      'spec:\n' +
      '  nodeName: node01\n' +
      '  containers:\n' +
      '  -  image: nginx\n' +
      '     name: nginx\n' +
      '```\n' +
      '\n' +
      '\n' +
      '# in-place resize of pod\n' +
      '- 팟 리소스 수직확장시 기본동작은 기존 팟을 죽이고 새로운 팟을 생성\n' +
      '- 현재 최신버전 기준 베타 기능인 팟을 그대로 유지하며 리소스 변경가능\n' +
      '\n' +
      '```\n' +
      'FEATURE_GATES=InPlacePodVerticalScaling=true\n' +
      '```',
    thumbnail: 'https://next-blog-starter.vercel.app/_next/image?url=%2Fassets%2Fblog%2Fhello-world%2Fcover.jpg&w=3840&q=75',
    createdAt: new Date(),
    tags: [{ name: 'TypeScript', id: 2 }],
    likes: 10,
    comments: 5
  },
  {
    id: 4,
    title: '포스트 4',
    content: '# Inline 함수\n' +
      '- Inline Class(Value Class)와 비슷한 뉘앙스로 코틀린 컴파일러가 흑마법을 부려 해당 코드 조각을 사용하는 곳에 직접 넣어 함수 호출 오버헤드를 줄이는 방식\n' +
      '- 고차 함수\n' +
      '- \n' +
      '\n' +
      '# Reified 타입 파라미터\n' +
      '\n' +
      '- Jvm 언어의 제네릭정보는 기본적으로 런타임 시점에 지워진다.\n' +
      '- 하지만 Inlline과 reified를 함께쓰면 이 제약 우회가 가능\n' +
      '- \n' +
      '\n' +
      '```kotlin\n' +
      'inline fun <reified T> getType(): T? {\n' +
      '    return when (T::class) {\n' +
      '        String::class -> "This is a string" as T\n' +
      '        Int::class -> Integer.valueOf(42) as T\n' +
      '        else -> null\n' +
      '    }\n' +
      '}\n' +
      '\n' +
      '```\n' +
      '\n' +
      '![uploaded image](https://github.com/jinia91/blogBackUp/blob/main/img/236997827964960?raw=true)\n' +
      '\n' +
      '컴파일러가 코드 스냅셋을 인라인시키면서 제네릭 T의 실제 타입을 바이트코드 레벨로 남겨버림으로서 함수 내에서 T 타입에 접근 가능해진다.\n' +
      'reified가 없다면 불가능!',
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
