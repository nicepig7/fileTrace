import { sqliteService } from '@extern/sqlite/sqliteService.js';

// 내부 캐시 맵을 모듈 스코프에 준비하여 여러 컴포넌트에서 공유되도록 함 (싱글톤 역할)
const mciCache = new Map();

export function useMciInfo() {
  const getMciDetails = (mciId) => {
    // 밖에서 ID가 아닌 { mciId: '...' } 형태의 객체를 넘겼을 경우를 대비한 방어 로직
    if (mciId && typeof mciId === 'object') {
      mciId = mciId.mciId || mciId.asisId || mciId.id;
    }

    if (!mciId) return null;

    // 1. 캐시(Map)에 가지고 있는지 확인
    if (mciCache.has(mciId)) {
      return mciCache.get(mciId);
    }

    // 2. 캐시에 없으면 SQL로 조회해서 넣고 반환
    try {
      const results = sqliteService.query(`
        SELECT 
          id, 
          asis_id as asisId, 
          name_kr as nameKr, 
          name_en as nameEn, 
          name_vi as nameVi,
          in_out as inOut
        FROM fd_mci_info 
        WHERE id = $id OR asis_id = $id
      `, { $id: mciId });

      if (results && results.length > 0) {
        const data = results[0];
        mciCache.set(mciId, data); // 조회 결과 캐시
        return data;
      }
    } catch (error) {
      console.error('[useMciInfo] Error fetching MCI details:', error);
    }

    // 데이터가 존재하지 않을 경우 null 캐시 (동일한 쿼리 재실행 방지)
    mciCache.set(mciId, null);
    return null;
  };

  return {
    getMciDetails
  };
}
