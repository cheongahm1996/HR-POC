'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, Save, X } from 'lucide-react';
import { generateDummyEmployees } from '@/lib/dummy-data';
import { calculateEmployeeLeave, EmployeeData } from '@/lib/leave-calculator';
import Link from 'next/link';

export default function UsagePage() {
  const allEmployees = generateDummyEmployees(400);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeData[]>(allEmployees);
  const [usageData, setUsageData] = useState({
    date: new Date().toISOString().split('T')[0],
    days: '1',
    type: 'annual',
    reason: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allEmployees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered.slice(0, 10)); // 최대 10개만 표시
    } else {
      setFilteredEmployees([]);
    }
  }, [searchTerm, allEmployees]);

  const handleEmployeeSelect = (employee: EmployeeData) => {
    setSelectedEmployee(employee);
    setSearchTerm('');
    setFilteredEmployees([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      alert('직원을 선택해주세요.');
      return;
    }

    // 실제로는 여기서 API 호출
    console.log('연차 사용 등록:', {
      employee: selectedEmployee,
      usage: usageData
    });

    // 성공 메시지 표시
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // 폼 초기화
      setSelectedEmployee(null);
      setUsageData({
        date: new Date().toISOString().split('T')[0],
        days: '1',
        type: 'annual',
        reason: ''
      });
    }, 3000);
  };


  const selectedLeaveInfo = selectedEmployee ? calculateEmployeeLeave(selectedEmployee) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">연차 사용 입력</h1>
              <p className="text-sm text-gray-500 mt-1">직원별 연차 사용 내역 등록</p>
            </div>
            <Link 
              href="/"
              className="text-sm text-blue-600 hover:text-blue-900"
            >
              ← 대시보드로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 성공 메시지 */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  연차 사용이 성공적으로 등록되었습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 직원 검색 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">직원 선택</h2>
            
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="이름, 사번 또는 부서로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 검색 결과 드롭다운 */}
              {filteredEmployees.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => handleEmployeeSelect(emp)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium text-gray-900">{emp.name}</span>
                          <span className="ml-2 text-sm text-gray-500">({emp.employeeNo})</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {emp.department} / {emp.position}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 선택된 직원 정보 */}
            {selectedEmployee && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedEmployee.name} ({selectedEmployee.employeeNo})
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedEmployee.department} / {selectedEmployee.position}
                    </p>
                    {selectedLeaveInfo && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          연차년도: {selectedLeaveInfo.leaveYear}차년도 
                          ({selectedLeaveInfo.startDate} ~ {selectedLeaveInfo.endDate})
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">총 연차:</span> 
                          <span className="font-medium text-gray-900 ml-1">{selectedLeaveInfo.totalDays}일</span>
                          <span className="text-gray-600 ml-3">사용:</span> 
                          <span className="font-medium text-gray-900 ml-1">{selectedLeaveInfo.usedDays}일</span>
                          <span className="text-gray-600 ml-3">잔여:</span> 
                          <span className="font-medium text-blue-600 ml-1">{selectedLeaveInfo.remainingDays}일</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEmployee(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 연차 사용 정보 입력 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">사용 정보 입력</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용일
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={usageData.date}
                    onChange={(e) => setUsageData({...usageData, date: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용일수
                </label>
                <select
                  value={usageData.days}
                  onChange={(e) => setUsageData({...usageData, days: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="0.5">0.5일 (반차)</option>
                  <option value="1">1일</option>
                  <option value="2">2일</option>
                  <option value="3">3일</option>
                  <option value="4">4일</option>
                  <option value="5">5일</option>
                  <option value="6">6일</option>
                  <option value="7">7일</option>
                  <option value="8">8일</option>
                  <option value="9">9일</option>
                  <option value="10">10일</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  휴가 유형
                </label>
                <select
                  value={usageData.type}
                  onChange={(e) => setUsageData({...usageData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="annual">연차</option>
                  <option value="morning_half">오전 반차</option>
                  <option value="afternoon_half">오후 반차</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사유
                </label>
                <input
                  type="text"
                  value={usageData.reason}
                  onChange={(e) => setUsageData({...usageData, reason: e.target.value})}
                  placeholder="사유 입력 (선택사항)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 경고 메시지 */}
            {selectedLeaveInfo && parseFloat(usageData.days) > selectedLeaveInfo.remainingDays && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 잔여 연차({selectedLeaveInfo.remainingDays}일)보다 많은 일수를 입력했습니다.
                </p>
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={!selectedEmployee}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="h-5 w-5 mr-2" />
              등록하기
            </button>
          </div>
        </form>

        {/* 최근 등록 내역 (더미) */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 등록 내역</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <span className="font-medium">김민준</span>
                <span className="text-sm text-gray-500 ml-2">생산1팀</span>
              </div>
              <div className="text-sm text-gray-600">
                2025-08-15 / 1일 / 연차
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <span className="font-medium">이서연</span>
                <span className="text-sm text-gray-500 ml-2">인사팀</span>
              </div>
              <div className="text-sm text-gray-600">
                2025-08-14 / 0.5일 / 오전 반차
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <span className="font-medium">박지호</span>
                <span className="text-sm text-gray-500 ml-2">IT팀</span>
              </div>
              <div className="text-sm text-gray-600">
                2025-08-13 / 3일 / 연차
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}