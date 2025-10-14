import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { message } from "antd";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import StaffManagement from "./pages/Staff/StaffManagement";
import PasswordManagement from "./pages/Staff/PasswordManagement";
import { DepartmentManagement } from "./pages/Department";
import AttendanceManagement from "./pages/Attendance/AttendanceManagement";
import AttendanceHistory from "./pages/Attendance/AttendanceHistory";
import AttendanceApproval from "./pages/Attendance/AttendanceApproval";
import RecruitmentInfo from "./pages/Recruitment/RecruitmentInfo";
import RecruitmentForm from "./pages/Recruitment/RecruitmentForm";
import RecruitmentDetail from "./pages/Recruitment/RecruitmentDetail";
import CandidateManagement from "./pages/Candidate/CandidateManagement";
import CandidateForm from "./pages/Candidate/CandidateForm";
import CandidateDetail from "./pages/Candidate/CandidateDetail";
import RankManagement from "./pages/Rank/RankManagement";
import SalaryGiving from "./pages/Salary/SalaryGiving";
import SalaryGivingDetail from "./pages/Salary/SalaryGivingDetail";
import SalaryDetail from "./pages/Salary/SalaryDetail";
import SalaryDetailForm from "./pages/Salary/SalaryDetailForm";
import SalaryHistory from "./pages/Salary/SalaryHistory";
import ExamInfo from "./pages/Exam/ExamInfo";
import ExamHistory from "./pages/Exam/ExamHistory";
import NotificationManagement from "./pages/Notification/NotificationManagement";
import AuthorityManagement from "./pages/Authority/AuthorityManagement";
import RolePermissionManagement from "./pages/Authority/RolePermissionManagement";
import OperationLogManagement from "./pages/OperationLog/OperationLogManagement";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import NotFound from "./components/Layout/NotFound";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { AuthProvider } from "./components/Auth/AuthContext";
import CandidateInterview from "./pages/Candidate/CandidateInterview";
import StaffOnboard from "./pages/Staff/StaffOnboard";
import StaffPromotion from "./pages/Staff/StaffPromotion";
import StaffTransfer from "./pages/Staff/StaffTransfer";
import StaffResignation from "./pages/Staff/StaffResignation";
import AttendanceForm from "./pages/Attendance/AttendanceForm";
// 配置全局message
message.config({
  top: 100,
  duration: 3,
  maxCount: 3,
});

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router basename="/app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route
                path="staff"
                element={<Navigate to="/staff/info" replace />}
              />
              <Route path="staff/info" element={<StaffManagement />} />
              <Route path="staff/password" element={<PasswordManagement />} />
              <Route path="staff/onboard" element={<StaffOnboard />} />
              <Route path="staff/promotion" element={<StaffPromotion />} />
              <Route path="staff/transfer" element={<StaffTransfer />} />
              <Route path="staff/resign" element={<StaffResignation />} />
              <Route path="department" element={<DepartmentManagement />} />
              <Route path="rank" element={<RankManagement />} />
              <Route
                path="attendance/record"
                element={<AttendanceManagement />}
              />
              <Route
                path="attendance/history"
                element={<AttendanceHistory />}
              />
              <Route
                path="attendance/approve"
                element={<AttendanceApproval />}
              />
              <Route path="attendance/add" element={<AttendanceForm />} />
              <Route path="attendance/edit" element={<AttendanceForm />} />
               <Route path="salary/giving" element={<SalaryGiving />} />
               <Route path="salary/giving/detail" element={<SalaryGivingDetail />} />
               <Route path="salary/detail" element={<SalaryDetail />} />
               <Route path="salary/detail/add" element={<SalaryDetailForm />} />
               <Route path="salary/detail/edit" element={<SalaryDetailForm />} />
               <Route path="salary/history" element={<SalaryHistory />} />
              <Route path="exam/manage" element={<ExamInfo />} />
              <Route path="exam/history" element={<ExamHistory />} />
              <Route path="notification" element={<NotificationManagement />} />
              <Route path="recruitment/manage" element={<RecruitmentInfo />} />
              <Route path="recruitment/add" element={<RecruitmentForm />} />
              <Route path="recruitment/edit" element={<RecruitmentForm />} />
              <Route
                path="recruitment/detail"
                element={<RecruitmentDetail />}
              />
              <Route
                path="candidate/manage"
                element={<CandidateManagement />}
              />
              <Route path="candidate/add" element={<CandidateForm />} />
              <Route path="candidate/edit" element={<CandidateForm />} />
              <Route path="candidate/detail" element={<CandidateDetail />} />
              <Route
                path="candidate/interview"
                element={<CandidateInterview />}
              />
              <Route path="authority/admin" element={<AuthorityManagement />} />
              <Route
                path="authority/role"
                element={<RolePermissionManagement />}
              />
              <Route
                path="operation-log"
                element={<OperationLogManagement />}
              />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
