'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, DollarSign, TrendingUp, FileText, ChevronLeft } from 'lucide-react';
import { generateDummyEmployees } from '@/lib/dummy-data';
import { calculateEmployeeLeave, calculateLeaveSettlement, EmployeeData } from '@/lib/leave-calculator';
import Link from 'next/link';

export default function EmployeeDetailPage() {
  const params = useParams();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const employees = generateDummyEmployees(400);
    const found = employees.find(emp => emp.id === params.id);
    setEmployee(found || null);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">데이터 로딩중...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">직원을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const leaveInfo = calculateEmployeeLeave(employee);
  const settlementInfo = leaveInfo.remainingDays > 0 
    ? calculateLeaveSettlement(leaveInfo.remainingDays, employee.monthlyWage)
    : null;

  // 정산 이력 총계 계산
  const totalSettlementDays = employee.settlementHistory?.reduce((sum, s) => sum + s.settledDays, 0) || 0;
  const totalSettlementAmount = employee.settlementHistory?.reduce((sum, s) => sum + s.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">직원 상세 정보</h1>
              <p className="text-sm text-gray-500 mt-1">{employee.name} ({employee.employeeNo})</p>
            </div>
            <Link 
              href="/employees"
              className="flex items-center text-sm text-blue-600 hover:text-blue-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              직원 목록으로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 직원 기본 정보 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">사번</dt>
                  <dd className="text-sm font-medium text-gray-900">{employee.employeeNo}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">이름</dt>
                  <dd className="text-sm font-medium text-gray-900">{employee.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">부서</dt>
                  <dd className="text-sm font-medium text-gray-900">{employee.department}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">직급</dt>
                  <dd className="text-sm font-medium text-gray-900">{employee.position}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">입사일</dt>
                  <dd className="text-sm font-medium text-gray-900">{employee.joinDate}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">월 통상임금</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {(employee.monthlyWage / 10000).toLocaleString()}만원
                  </dd>
                </div>
              </dl>
            </div>

            {/* 현재 연차 현황 */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">현재 연차 현황</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">연차년도</span>
                  <span className="text-sm font-medium text-gray-900">{leaveInfo.leaveYear}차년도</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">기간</span>
                  <span className="text-sm font-medium text-gray-900">
                    {leaveInfo.startDate} ~ {leaveInfo.endDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">총 연차</span>
                  <span className="text-sm font-medium text-gray-900">{leaveInfo.totalDays}일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">사용</span>
                  <span className="text-sm font-medium text-gray-900">{leaveInfo.usedDays}일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">잔여</span>
                  <span className="text-sm font-medium text-blue-600">{leaveInfo.remainingDays}일</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">다음 정산일</span>
                    <span className="text-sm font-medium text-orange-600">{leaveInfo.nextSettlementDate}</span>
                  </div>
                  {settlementInfo && (
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-500">예상 정산액</span>
                      <span className="text-sm font-medium text-green-600">
                        {(settlementInfo.netAmount / 10000).toLocaleString()}만원
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 정산 이력 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">연차 정산 이력</h2>
                  {employee.settlementHistory && employee.settlementHistory.length > 0 && (
                    <div className="text-sm text-gray-500">
                      총 {totalSettlementDays}일 / {(totalSettlementAmount / 10000).toLocaleString()}만원
                    </div>
                  )}
                </div>
              </div>
              
              {employee.settlementHistory && employee.settlementHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          연차년도
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          정산일
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          정산일수
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          정산금액
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          유형
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employee.settlementHistory.map((settlement, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {settlement.leaveYear}차년도
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {settlement.settlementDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-900">
                              {settlement.settledDays}일
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {(settlement.amount / 10000).toLocaleString()}만원
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              settlement.type === 'resignation' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {settlement.type === 'resignation' ? '퇴직정산' : '연차정산'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  정산 이력이 없습니다.
                </div>
              )}
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">총 정산 횟수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {employee.settlementHistory?.length || 0}회
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">총 정산 일수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalSettlementDays}일
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">총 정산 금액</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(totalSettlementAmount / 10000).toLocaleString()}만원
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* 연차 사용 패턴 분석 */}
            {employee.settlementHistory && employee.settlementHistory.length > 2 && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">연차 사용 패턴</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">평균 정산 일수</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(totalSettlementDays / employee.settlementHistory.length)}일/년
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">평균 정산 금액</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(totalSettlementAmount / employee.settlementHistory.length / 10000).toLocaleString()}만원/년
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">최대 정산 일수</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.max(...employee.settlementHistory.map(s => s.settledDays))}일
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}