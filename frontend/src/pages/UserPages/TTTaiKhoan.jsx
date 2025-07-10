// // src/pages/ThongTinTaiKhoan.jsx
// import { useEffect, useState } from 'react';
// import { getThongTin } from '../api/AuthAPI.jsx';

// export default function TTTaiKhoan() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         const res = await getThongTin();
//         setUser(res.data);
//       } catch (err) {
//         alert('Bạn cần đăng nhập!');
//       }
//     };
//     fetch();
//   }, []);

//   if (!user) return <p>Đang tải thông tin...</p>;

//   return (
//     <div>
//       <h2>Thông tin tài khoản</h2>
//       <p><strong>Tên tài khoản:</strong> {user.TenTK}</p>
//       <p><strong>Loại:</strong> {user.Loai}</p>
//     </div>
//   );
// }
