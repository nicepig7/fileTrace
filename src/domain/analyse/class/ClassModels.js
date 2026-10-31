/**
 * 통합 그래프 스키마(SQLite)에 맞춘 DTO 모델 정의 (Class Node)
 */

export class ClassDTO {
  constructor(projectId, packageName, className, classType) {
    this.projectId = projectId;
    this.packageName = packageName;
    this.className = className; // Unique identifier for class logic
    this.classType = classType; // e.g., 'Controller', 'Service', 'Component', 'DAO'
    
    // class_name 기준 하위 요소 리스트
    this.methods = []; // Array of MethodDTO
  }

  addMethod(method) {
    this.methods.push(method);
  }
}

export class MethodDTO {
  constructor(className, methodName, line, paramCount = 0) {
    this.className = className;
    this.methodName = methodName;
    this.line = line;
    this.paramCount = paramCount;
    
    // 관계 데이터
    this.calls = []; // Array of { targetPackage, targetClass, targetMethod, targetParamCount }
    this.endpoints = []; // Array of { url, httpMethod }
  }

  addCall(targetPackage, targetClass, targetMethod, targetParamCount = 0) {
    this.calls.push({ targetPackage, targetClass, targetMethod, targetParamCount });
  }

  addEndpoint(url, httpMethod) {
    this.endpoints.push({ url, httpMethod });
  }
}
