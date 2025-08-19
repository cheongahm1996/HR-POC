// 연차 계산 로직 (근로기준법 제60조 기준)

import { differenceInYears, differenceInMonths, format, addYears, subDays } from 'date-fns';

export interface EmployeeData {
  id: string;
  employeeNo: string;
  name: string;
  department: string;
  position: string;
  joinDate: string;
  monthlyWage: number;
  usedDays: number;
  resignationDate?: string;
  settlementHistory?: SettlementRecord[];
}

export interface SettlementRecord {
  settlementDate: string;
  leaveYear: number;
  settledDays: number;
  amount: number;
  type: 'annual' | 'resignation';
}

export interface LeaveCalculation {
  employeeId: string;
  employeeName: string;
  leaveYear: number; // 연차년도 (1차, 2차...)
  startDate: string;
  endDate: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  settlementAmount?: number;
  status: 'active' | 'warning' | 'expired';
  daysUntilExpiry: number;
  nextSettlementDate: string; // 다음 정산일
}

// 근속년수 계산
export function calculateTenure(joinDate: Date, baseDate: Date = new Date()) {
  const years = differenceInYears(baseDate, joinDate);
  const months = differenceInMonths(baseDate, joinDate) % 12;
  
  return { years, months, totalMonths: differenceInMonths(baseDate, joinDate) };
}

// 연차 일수 계산 (입사일 기준)
export function calculateAnnualLeaveDays(joinDate: Date, baseDate: Date = new Date()): number {
  const { years, totalMonths } = calculateTenure(joinDate, baseDate);
  
  if (years < 1) {
    // 1년 미만: 1개월 개근 시 1일 발생 (최대 11일)
    return Math.min(totalMonths, 11);
  } else if (years < 3) {
    // 1-2년차: 15일
    return 15;
  } else {
    // 3년 이상: 15일 + 매 2년마다 1일 추가 (최대 25일)
    const additionalDays = Math.floor((years - 1) / 2);
    return Math.min(15 + additionalDays, 25);
  }
}

// 현재 연차 기간 계산 (입사일 기준)
export function getCurrentLeavePeriod(joinDate: Date, baseDate: Date = new Date()) {
  const joinDateObj = new Date(joinDate);
  const { years } = calculateTenure(joinDateObj, baseDate);
  
  // 현재 연차년도 계산
  const leaveYear = years + 1;
  
  // 연차 시작일: 입사일로부터 n년
  const startDate = addYears(joinDateObj, years);
  
  // 연차 종료일: 시작일로부터 1년 - 1일
  const endDate = subDays(addYears(startDate, 1), 1);
  
  return {
    leaveYear,
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
}

// 1일 통상임금 계산
export function calculateDailyWage(monthlyWage: number): number {
  // 월 소정근로시간: 209시간 (주40시간 × 52주 ÷ 12개월)
  const monthlyWorkingHours = 209;
  const hourlyWage = monthlyWage / monthlyWorkingHours;
  const dailyWage = hourlyWage * 8;
  
  return Math.floor(dailyWage);
}

// 연차수당 계산
export function calculateLeaveSettlement(
  unusedDays: number,
  monthlyWage: number
): {
  dailyWage: number;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
} {
  const dailyWage = calculateDailyWage(monthlyWage);
  const totalAmount = dailyWage * unusedDays;
  
  // 간이 세금 계산 (실제로는 더 복잡)
  let taxRate = 0;
  if (totalAmount <= 1000000) {
    taxRate = 0.03; // 3%
  } else if (totalAmount <= 3000000) {
    taxRate = 0.05; // 5%
  } else {
    taxRate = 0.08; // 8%
  }
  
  const taxAmount = Math.floor(totalAmount * taxRate);
  const netAmount = totalAmount - taxAmount;
  
  return {
    dailyWage,
    totalAmount,
    taxAmount,
    netAmount
  };
}

// 만료 경고 레벨 판단
export function getExpirationStatus(endDate: string): {
  status: 'active' | 'warning' | 'expired';
  daysUntilExpiry: number;
} {
  const end = new Date(endDate);
  const today = new Date();
  const daysUntilExpiry = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let status: 'active' | 'warning' | 'expired';
  if (daysUntilExpiry < 0) {
    status = 'expired';
  } else if (daysUntilExpiry <= 30) {
    status = 'warning';
  } else {
    status = 'active';
  }
  
  return { status, daysUntilExpiry };
}

// 다음 정산일 계산 (입사일 기준)
export function getNextSettlementDate(joinDate: Date, baseDate: Date = new Date()): string {
  const joinDateObj = new Date(joinDate);
  const today = new Date(baseDate);
  
  // 다음 연차 만료일 계산 (입사일 기준 다음 년도)
  const nextSettlementDate = new Date(joinDateObj);
  
  // 현재 연차년도 계산
  const { years } = calculateTenure(joinDateObj, today);
  
  // 다음 정산일 = 입사일로부터 (현재 연차년도 + 1)년 후
  nextSettlementDate.setFullYear(joinDateObj.getFullYear() + years + 1);
  
  return format(nextSettlementDate, 'yyyy-MM-dd');
}

// 직원별 연차 계산 (메인 함수)
export function calculateEmployeeLeave(employee: EmployeeData): LeaveCalculation {
  const joinDate = new Date(employee.joinDate);
  const today = new Date();
  
  // 현재 연차 기간
  const period = getCurrentLeavePeriod(joinDate, today);
  
  // 연차 일수
  const totalDays = calculateAnnualLeaveDays(joinDate, today);
  
  // 잔여 일수
  const remainingDays = totalDays - employee.usedDays;
  
  // 만료 상태
  const { status, daysUntilExpiry } = getExpirationStatus(period.endDate);
  
  // 다음 정산일
  const nextSettlementDate = getNextSettlementDate(joinDate, today);
  
  // 정산 금액 (잔여일수가 있을 경우)
  let settlementAmount = 0;
  if (remainingDays > 0 && status === 'expired') {
    const settlement = calculateLeaveSettlement(remainingDays, employee.monthlyWage);
    settlementAmount = settlement.netAmount;
  }
  
  return {
    employeeId: employee.id,
    employeeName: employee.name,
    leaveYear: period.leaveYear,
    startDate: period.startDate,
    endDate: period.endDate,
    totalDays,
    usedDays: employee.usedDays,
    remainingDays,
    settlementAmount,
    status,
    daysUntilExpiry,
    nextSettlementDate
  };
}

// 부서별 통계
export function calculateDepartmentStats(employees: EmployeeData[]) {
  const departmentMap = new Map<string, {
    totalEmployees: number;
    totalDays: number;
    usedDays: number;
    remainingDays: number;
    avgUsageRate: number;
    settlementAmount: number;
  }>();
  
  employees.forEach(employee => {
    const leave = calculateEmployeeLeave(employee);
    
    if (!departmentMap.has(employee.department)) {
      departmentMap.set(employee.department, {
        totalEmployees: 0,
        totalDays: 0,
        usedDays: 0,
        remainingDays: 0,
        avgUsageRate: 0,
        settlementAmount: 0
      });
    }
    
    const dept = departmentMap.get(employee.department)!;
    dept.totalEmployees++;
    dept.totalDays += leave.totalDays;
    dept.usedDays += leave.usedDays;
    dept.remainingDays += leave.remainingDays;
    
    if (leave.remainingDays > 0) {
      const settlement = calculateLeaveSettlement(leave.remainingDays, employee.monthlyWage);
      dept.settlementAmount += settlement.netAmount;
    }
  });
  
  // 평균 사용률 계산
  departmentMap.forEach(dept => {
    dept.avgUsageRate = dept.totalDays > 0 
      ? Math.round((dept.usedDays / dept.totalDays) * 100)
      : 0;
  });
  
  return departmentMap;
}