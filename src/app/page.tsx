'use client';

import React from 'react';
import { Users, Calendar, TrendingUp, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { generateDummyEmployees, generateSummaryStats } from '@/lib/dummy-data';
import { calculateEmployeeLeave, calculateLeaveSettlement, EmployeeData } from '@/lib/leave-calculator';
import Link from 'next/link';

export default function Dashboard() {
  // 즉시 데이터 생성
  const employees = generateDummyEmployees(400);
  const stats = generateSummaryStats(employees);

  // 정산 예정자 찾기 (30일 이내 만료)
  const settlementTargets = employees.filter(emp => {
    const leave = calculateEmployeeLeave(emp);
    return leave.status === 'warning' && leave.remainingDays > 0;
  });

  // 전체 정산 예상 금액 계산
  const totalSettlementAmount = employees.reduce((sum, emp) => {
    const leave = calculateEmployeeLeave(emp);
    if (leave.remainingDays > 0) {
      return sum + (leave.settlementAmount || 0);
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">연차 관리 시스템</h1>
              <p className="text-sm text-gray-500 mt-1">입사일 기준 개별 연차 관리</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 직원</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}명</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">평균 사용률</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgUsageRate}%</p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.totalUsedDays}/{stats.totalAvailableDays}일
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">정산 예정</p>
                <p className="text-2xl font-bold text-gray-900">{settlementTargets.length}명</p>
                <p className="text-xs text-gray-400 mt-1">30일 이내 만료</p>
              </div>
              <Clock className="h-10 w-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">총 잔여 연차</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRemainingDays.toLocaleString()}일
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  약 {Math.floor(totalSettlementAmount / 100000000)}억원
                </p>
              </div>
              <Calendar className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* 알림 섹션 */}
        {settlementTargets.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">연차 정산 예정 알림</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {settlementTargets.length}명의 직원이 30일 이내 연차 만료 예정입니다.
                </p>
                <div className="mt-2">
                  <Link 
                    href="/settlement" 
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                  >
                    정산 대상자 확인 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 다음 정산 예정자 리스트 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">다음 정산 예정자</h2>
            <p className="text-sm text-gray-500 mt-1">입사일 기준 연차 만료 예정</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사번
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    부서
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    다음 정산일
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    잔여일수
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    과거 정산
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예상 정산액
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {settlementTargets.slice(0, 10).map(employee => {
                  const leave = calculateEmployeeLeave(employee);
                  const settlement = leave.remainingDays > 0 
                    ? calculateLeaveSettlement(leave.remainingDays, employee.monthlyWage)
                    : null;
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.employeeNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {leave.nextSettlementDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-orange-600">
                          {leave.remainingDays}일
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {employee.settlementHistory && employee.settlementHistory.length > 0 ? (
                          <div className="text-sm text-gray-600">
                            {employee.settlementHistory.reduce((sum, s) => sum + s.settledDays, 0)}일
                            <span className="text-xs text-gray-400 ml-1">
                              ({employee.settlementHistory.length}회)
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">없음</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {settlement ? `${(settlement.netAmount / 10000).toLocaleString()}만원` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {settlementTargets.length > 10 && (
            <div className="px-6 py-3 border-t bg-gray-50">
              <Link
                href="/employees"
                className="text-sm text-blue-600 hover:text-blue-900"
              >
                전체 {settlementTargets.length}명 보기 →
              </Link>
            </div>
          )}
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link href="/employees" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">직원별 조회</h3>
                <p className="text-sm text-gray-500 mt-1">개인별 연차 현황 확인</p>
              </div>
            </div>
          </Link>

          <Link href="/usage" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">연차 사용 입력</h3>
                <p className="text-sm text-gray-500 mt-1">사용 연차 등록</p>
              </div>
            </div>
          </Link>

          <Link href="/calculator" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">정산 계산기</h3>
                <p className="text-sm text-gray-500 mt-1">연차수당 계산</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
