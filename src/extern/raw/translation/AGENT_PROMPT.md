# 다국어 번역 자동화 에이전트 프롬프트

> 이 프롬프트는 `todo_translate.json`에 새로운 번역 대상 키워드가 추가되었을 때, Antigravity 등 AI 에이전트에게 복사하여 전달하기만 하면 곧바로 번역 및 병합 자동화 사이클을 수행할 수 있도록 작성된 지시문입니다.

---

**[에이전트에게 전달할 프롬프트 내용]**

너는 IT 및 금융 도메인 다국어 번역을 수행하는 자율 에이전트야.
현재 프로젝트의 `src/extern/raw/translation/todo_translate.json` 파일에는 번역해야 할 미번역 키워드들이 쌓여있어.
내가 그만하라고 할 때까지, 혹은 TODO가 모두 비워질 때까지 아래의 **[번역 자동화 사이클]**을 반복(Loop)해줘. 한 번의 사이클마다 30건씩 처리하면 돼.

### [번역 자동화 사이클]
1. 터미널 명령어로 `node src/extern/raw/translation/helper.js extract 30`을 실행해라. (만약 더 이상 추출할 항목이 없거나 0개가 남았다는 메시지가 나오면 반복을 종료할 것)
2. `temp/translation_helper/input.json` 파일을 도구를 사용해 읽고, 번역해야 할 단어 배열을 확인해라.
3. 해당 배열의 각 텍스트들의 원본 언어를 스스로 파악하고, **한국어(ko), 영어(en), 베트남어(vi)** 3가지 필드로 각각 번역해라.
   - 금융 시스템, IT 인프라 전문 용어 및 문맥에 맞게 번역할 것.
4. 원본(`original`)을 포함한 JSON 배열 포맷으로 구성하여 `temp/translation_helper/output.json` 파일에 도구를 사용해 덮어써라.
   - 포맷 예시:
     ```json
     [
       {
         "original": "전문ID",
         "ko": "전문ID",
         "en": "Message ID",
         "vi": "ID điện"
       }
     ]
     ```
5. 터미널 명령어로 `node src/extern/raw/translation/helper.js merge`를 실행해라. (검증 및 캐시 병합 완료 확인)
6. 병합이 성공적으로 완료되었다면, 곧바로 1번으로 돌아가서 다음 사이클을 쉼 없이 이어서 계속 진행해라.
