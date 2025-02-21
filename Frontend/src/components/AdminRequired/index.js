import React from 'react';
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminRequired = ({ user, requiredRole, children }) => {
    if (!user) {
        // 로그인이 되어 있지 않으면 로그인 페이지로 리디렉션
        return <Navigate to="/login" replace />;
    }

    if (user.user_type !== requiredRole) {
        // 사용자 유형이 요구 조건과 맞지 않으면 접근 금지 페이지로 리디렉션
        // alert('권한이 없습니다. 메인 페이지로 이동합니다')
        Swal.fire({
            icon: "error",
            title: "오류 발생!",
            text: "권한이 없습니다. 메인 페이지로 이동합니다",
        });
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRequired;