import { type Command } from '../domain/command'
import type { TerminalContext } from '../domain/terminal-context'

export const whoami = async (
  setContext: (args: ((prev: TerminalContext) => TerminalContext) | TerminalContext) => void
): Promise<void> => {
  const lines = [
    '',
    '# Jinia — Backend Developer',
    '안녕하세요! 함께 성장하는 개발자 최원진 입니다! 만나서 반가워요 😀',
    '',
    '# Introduction',
    '저는 새로운 지식과 기술을 배우는것을 좋아하며, 경험을 공유하고 함께 성장하는 가치를 가장 중요시합니다.',
    '나 혼자의 역량만이 아니라 내 주변, 그리고 함께하는 팀의 성장을 도울 수 있는 개발자가 되기 위해 노력하고 있습니다.',
    'Kotlin & Spring을 메인으로 cs, 자료구조와 알고리즘, 클린코드와 OOP를 독학과 그룹스터디를 통해 학습해왔으며,',
    '현재는 Webflux, GRPC, 그리고 테스트 플랫폼 구축을 포함한 테스트 전반에 관심이 많습니다!',
    '개발자는 비즈니스 임팩트가 있으며,',
    '좋은 퍼포먼스와 읽기 쉽고 확장에 유연한 독자 중심주의 코드를 작성해야한다고 생각하며 이를 달성하기 위해 계속 고민하고 있습니다.',
    '',
    '# Skill',
    '- Kotlin, Java, TypeScript',
    '- Spring Boot, Webflux',
    '- MySQL, Redis, Kafka, KSQL, Kafka Streams',
    '- Kubernetes, GitOps, ArgoCD, aws',
    ''
  ]

  // 한번에 모든 줄 출력
  setContext(prev => ({
    ...prev,
    view: [...prev.view, ...lines],
    processContext: null
  }))
}

export const whoAmICommand: Command = {
  name: 'whoami',
  description: '저에대한 소개를 출력합니다',
  category: 'util',
  execute: async (setContext) => {
    await whoami(setContext)
  }
}
