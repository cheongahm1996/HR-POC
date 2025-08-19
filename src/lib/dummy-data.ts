// 400명 더미 데이터 생성

import { EmployeeData } from './leave-calculator';

const departments = [
  '생산1팀', '생산2팀', '생산3팀', '품질관리팀', 
  '기술개발팀', '영업팀', '마케팅팀', '인사팀', 
  '재무팀', '총무팀', 'IT팀', '구매팀'
];

const positions = [
  '사원', '주임', '대리', '과장', '차장', '부장', '이사'
];

const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'];
const firstNames = [
  '민준', '서연', '서준', '서윤', '지호', '지윤', '준서', '하은', '도윤', '수아',
  '주원', '하윤', '시우', '지아', '지후', '은우', '채원', '윤서', '준혁', '다은',
  '현우', '예준', '민서', '하준', '지안', '건우', '서진', '유준', '선우', '정우'
];

// 랜덤 날짜 생성 함수
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 입사일 기준으로 사용 연차 생성 (현실적인 사용 패턴)
function generateUsedDays(joinDate: Date, totalDays: number): number {
  const today = new Date();
  const tenure = (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  // 근속년수가 길수록 연차 사용률이 높아지는 경향
  let baseUsageRate = 0.3 + (tenure * 0.05);
  baseUsageRate = Math.min(baseUsageRate, 0.85); // 최대 85% 사용률
  
  // 랜덤 변동 추가 (±20%)
  const variation = (Math.random() - 0.5) * 0.4;
  const usageRate = Math.max(0.1, Math.min(0.95, baseUsageRate + variation));
  
  return Math.floor(totalDays * usageRate);
}

// 월급 생성 (직급별)
function generateSalary(position: string): number {
  const salaryMap: { [key: string]: [number, number] } = {
    '사원': [2800000, 3500000],
    '주임': [3200000, 4000000],
    '대리': [3800000, 4800000],
    '과장': [4500000, 5800000],
    '차장': [5500000, 7000000],
    '부장': [6500000, 8500000],
    '이사': [8000000, 12000000]
  };
  
  const [min, max] = salaryMap[position] || [3000000, 4000000];
  return Math.floor(min + Math.random() * (max - min));
}

// 직급 결정 (입사일 기준)
function determinePosition(joinDate: Date): string {
  const today = new Date();
  const yearsOfService = (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  if (yearsOfService < 2) return '사원';
  if (yearsOfService < 4) return Math.random() > 0.5 ? '사원' : '주임';
  if (yearsOfService < 7) return Math.random() > 0.5 ? '주임' : '대리';
  if (yearsOfService < 10) return Math.random() > 0.5 ? '대리' : '과장';
  if (yearsOfService < 15) return Math.random() > 0.5 ? '과장' : '차장';
  if (yearsOfService < 20) return Math.random() > 0.5 ? '차장' : '부장';
  return Math.random() > 0.8 ? '이사' : '부장';
}

// 연차 일수 계산 (leave-calculator의 로직 복사)
function calculateLeaveDays(joinDate: Date): number {
  const today = new Date();
  const years = Math.floor((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  if (years < 1) {
    return Math.min(months, 11);
  } else if (years < 3) {
    return 15;
  } else {
    const additionalDays = Math.floor((years - 1) / 2);
    return Math.min(15 + additionalDays, 25);
  }
}

// 정산 이력 생성 함수 (입사일 기준 매년 정산)
function generateSettlementHistory(joinDate: Date, monthlyWage: number) {
  const history = [];
  const today = new Date();
  const joinDateObj = new Date(joinDate);
  
  // 입사일부터 현재까지 몇 년차인지 계산
  let currentYear = 1;
  let checkDate = new Date(joinDateObj);
  checkDate.setFullYear(checkDate.getFullYear() + 1);
  
  // 1년차부터 현재까지 각 연차년도별 정산 이력 생성
  while (checkDate <= today) {
    // 연차 발생량 계산
    let totalDays = 0;
    if (currentYear === 1) {
      totalDays = 11; // 1년차는 11일 (월차)
    } else if (currentYear === 2) {
      totalDays = 15; // 2년차는 15일
    } else {
      // 3년차 이상: 15일 + 가산
      const additionalDays = Math.floor((currentYear - 2) / 2);
      totalDays = Math.min(15 + additionalDays, 25);
    }
    
    // 사용일수 랜덤 생성 (50~90% 사용)
    const usageRate = 0.5 + Math.random() * 0.4;
    const usedDays = Math.floor(totalDays * usageRate);
    const settledDays = totalDays - usedDays;
    
    // 정산이 있었다면 (잔여일수가 있으면)
    if (settledDays > 0) {
      // 과거 급여 계산 (연차별로 조금씩 인상)
      const yearlyWageIncrease = 1 + (currentYear - 1) * 0.03; // 연 3% 인상
      const adjustedWage = Math.floor(monthlyWage * yearlyWageIncrease * 0.85); // 과거는 현재의 85%
      const dailyWage = Math.floor(adjustedWage / 209 * 8);
      const amount = dailyWage * settledDays;
      
      history.push({
        settlementDate: checkDate.toISOString().split('T')[0],
        leaveYear: currentYear,
        settledDays,
        amount,
        type: 'annual' as const
      });
    }
    
    // 다음 연차년도로
    currentYear++;
    checkDate.setFullYear(checkDate.getFullYear() + 1);
  }
  
  return history;
}

// 400명 더미 데이터 생성
export function generateDummyEmployees(count: number = 400): EmployeeData[] {
  const employees: EmployeeData[] = [];
  
  // 부서별 인원 분배
  const employeesPerDept = Math.floor(count / departments.length);
  const extraEmployees = count % departments.length;
  
  let employeeNumber = 1;
  
  departments.forEach((dept, deptIndex) => {
    const deptEmployeeCount = employeesPerDept + (deptIndex < extraEmployees ? 1 : 0);
    
    for (let i = 0; i < deptEmployeeCount; i++) {
      // 입사일 생성 (최근 20년 이내)
      const joinDate = randomDate(
        new Date('2004-01-01'),
        new Date('2024-12-31')
      );
      
      // 직급 결정
      const position = determinePosition(joinDate);
      
      // 이름 생성
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const name = `${lastName}${firstName}`;
      
      // 연차 일수 계산
      const totalDays = calculateLeaveDays(joinDate);
      
      // 사용 연차 생성
      const usedDays = generateUsedDays(joinDate, totalDays);
      
      // 월급 생성
      const monthlyWage = generateSalary(position);
      
      // 정산 이력 생성
      const settlementHistory = generateSettlementHistory(joinDate, monthlyWage);
      
      employees.push({
        id: `EMP${String(employeeNumber).padStart(4, '0')}`,
        employeeNo: `EMP${String(employeeNumber).padStart(4, '0')}`,
        name,
        department: dept,
        position,
        joinDate: joinDate.toISOString().split('T')[0],
        monthlyWage,
        usedDays,
        settlementHistory: settlementHistory.length > 0 ? settlementHistory : undefined
      });
      
      employeeNumber++;
    }
  });
  
  return employees;
}

// 통계 요약 생성
export function generateSummaryStats(employees: EmployeeData[]) {
  const totalEmployees = employees.length;
  let totalUsedDays = 0;
  let totalAvailableDays = 0;
  let warningCount = 0;
  let expiredCount = 0;
  
  employees.forEach(emp => {
    const totalDays = calculateLeaveDays(new Date(emp.joinDate));
    totalUsedDays += emp.usedDays;
    totalAvailableDays += totalDays;
    
    const remainingDays = totalDays - emp.usedDays;
    if (remainingDays > 10) {
      warningCount++;
    }
    if (remainingDays > 15) {
      expiredCount++;
    }
  });
  
  return {
    totalEmployees,
    avgUsageRate: Math.round((totalUsedDays / totalAvailableDays) * 100),
    warningCount,
    expiredCount,
    totalUsedDays,
    totalAvailableDays,
    totalRemainingDays: totalAvailableDays - totalUsedDays
  };
}