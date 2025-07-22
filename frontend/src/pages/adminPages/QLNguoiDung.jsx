import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import API from '../../api.jsx';
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx';
import AccountForm from '../../components/Form/AccountForm.jsx';

function QLNguoiDung() {
  // Constants
  const routeAddress = 'account';
  const pageContent = 'tài khoản';
  const funcAdd = 'dang-ky';
  const funcFindAll = 'tat-ca-tai-khoan';
  const funcUpdate = 'cap-nhat-tai-khoan';
  const funcDelete = 'xoa-tai-khoan';

  // State
  const [editingAccount, setEditingAccount] = useState(null);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [Accounts, SetAccounts] = useState([]);

  const [TenHienThi, SetTenHienThi] = useState('');
  const [TenTaiKhoan, SetTenTaiKhoan] = useState('');
  const [Loai, SetLoai] = useState('');
  const [CCCD, SetCCCD] = useState('');
  const [SDT, SetSDT] = useState('');
  const [MatKhau, SetMatKhau] = useState('');
  const [KhoaHocDaThamGia, SetKhoaHocDaThamGia] = useState([]);
  const [KyThiDaThamGia, SetKyThiDaThamGia] = useState([]);

  const [oldGetExams, setOldGetExams] = useState([]);
  const [oldGetCourses, setOldGetCourses] = useState([]);

  const formStates = {
    TenHienThi, SetTenHienThi,
    TenTaiKhoan, SetTenTaiKhoan,
    Loai, SetLoai,
    MatKhau, SetMatKhau,
    KhoaHocDaThamGia, SetKhoaHocDaThamGia,
    KyThiDaThamGia, SetKyThiDaThamGia,
    CCCD, SetCCCD,
    SDT, SetSDT
  };

  // Utility functions
  const showError = (title, message = 'Vui lòng thử lại sau.') => {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    });
  };

  const showSuccess = (title) => {
    Swal.fire({
      icon: 'success',
      title,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    });
  };

  const createAccountData = () => ({
    TenHienThi,
    TenTaiKhoan,
    MatKhau,
    Loai,
    KhoaHocDaThamGia,
    KyThiDaThamGia,
    CCCD,
    SDT
  });

  const resetForm = () => {
    SetTenHienThi('');
    SetTenTaiKhoan('');
    SetCCCD('');
    SetSDT('');
    SetLoai('');
    SetMatKhau('');
    SetKhoaHocDaThamGia([]);
    SetKyThiDaThamGia([]);
    setEditingAccount(null);
    setOldGetCourses([]);
    setOldGetExams([]);
  };

  const getRelatedNames = (ids, dataArray, nameField) => {
    if (!ids || !Array.isArray(ids)) return '';
    
    const names = ids.map(id => {
      const item = dataArray.find(item => String(item._id) === String(id));
      return item?.[nameField];
    }).filter(Boolean);
    
    return names.join(', ');
  };

  // API functions
  const fetchData = async () => {
    try {
      const [accountsRes, coursesRes, examsRes, certificatesRes] = await Promise.all([
        API.get(`/${routeAddress}/${funcFindAll}`),
        API.get('/course/tat-ca-khoa-on'),
        API.get('/exam/tat-ca-dot-thi'),
        API.get('/certificate/tat-ca-chung-chi')
      ]);

      SetAccounts(accountsRes.data);
      setCourses(coursesRes.data);
      setExams(examsRes.data);
      setCertificates(certificatesRes.data);
    } catch (error) {
      showError('Lỗi khi tải dữ liệu');
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await API.get(`/${routeAddress}/${funcFindAll}`);
      SetAccounts(res.data);
    } catch (error) {
      showError('Không thể tải danh sách tài khoản');
    }
  };

  // Event handlers
  const handleAdd = async () => {
    try {
      await API.post(`/${routeAddress}/${funcAdd}`, createAccountData());
      showSuccess('Thêm tài khoản thành công!');
      await fetchAccounts();
      resetForm();
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.';
      showError('Lỗi khi thêm tài khoản', message);
    }
  };

  const handleUpdate = async () => {
    try {
      const updatedAccount = {
        ...createAccountData(),
        DSKhoaHocDaThamGia: oldGetCourses,
        DSKyThiDaThamGia: oldGetExams
      };

      await API.put(`/${routeAddress}/${funcUpdate}/${editingAccount.TenTaiKhoan}`, updatedAccount);
      showSuccess('Cập nhật tài khoản thành công!');
      await fetchAccounts();
      resetForm();
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.';
      showError('Lỗi khi cập nhật tài khoản', message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận xóa?',
        text: 'Hành động này sẽ xóa tài khoản khỏi hệ thống.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      });

      if (result.isConfirmed) {
        await API.delete(`/${routeAddress}/${funcDelete}/${id}`);
        showSuccess('Đã xóa tài khoản thành công!');
        await fetchAccounts();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.';
      showError('Lỗi khi xóa tài khoản', message);
    }
  };

  const handleEdit = (row) => {
    SetTenHienThi(row.TenHienThi);
    SetTenTaiKhoan(row.TenTaiKhoan);
    SetCCCD(row.CCCD || '');
    SetSDT(row.SDT || '');
    SetMatKhau(row.MatKhau);
    SetLoai(row.Loai);
    SetKhoaHocDaThamGia(row.KhoaHocDaThamGia || []);
    SetKyThiDaThamGia(row.KyThiDaThamGia || []);
    setOldGetExams(row.KyThiDaThamGia || []);
    setOldGetCourses(row.KhoaHocDaThamGia || []);
    setEditingAccount({ _id: row._id, TenTaiKhoan: row.TenTaiKhoan });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Table configuration
  const columns = [
    { label: 'Tên', key: 'TenHienThi' },
    { label: 'Căn cước', key: 'CCCD' },
    { label: 'Số điện thoại', key: 'SDT' },
    { label: 'Tài khoản', key: 'TenTaiKhoan' },
    { label: 'Vai trò', key: 'Loai' },
    { label: 'Mật khẩu', key: 'MatKhau' },
    {
      label: 'Khóa học đã tham gia',
      key: 'KhoaHocDaThamGia',
      render: (value, row) => getRelatedNames(row.KhoaHocDaThamGia, courses, 'TenKhoaHoc')
    },
    {
      label: 'Kỳ thi đã tham gia',
      key: 'KyThiDaThamGia',
      render: (value, row) => getRelatedNames(row.KyThiDaThamGia, exams, 'TenKyThi')
    },
    {
      label: 'Chứng chỉ đã nhận',
      key: 'ChungChiDaNhan',
      render: (value, row) => getRelatedNames(row.ChungChiDaNhan, certificates, 'TenChungChi')
    },
    { label: 'Ngày tạo', key: 'createdAt', isDate: true },
    { label: 'Cập nhật', key: 'updatedAt', isDate: true },
    { label: 'Sửa', key: 'editButton', isAction: 'edit' },
    { label: 'Xóa', key: 'deleteButton', isAction: 'delete' }
  ];

  const columnsCanEdit = [
    {
      key: 'TenHienThi',
      label: 'Tên người dùng',
      type: 'autocomplete',
      options: Accounts.map(acc => ({ value: acc.TenHienThi, label: acc.TenHienThi }))
    },
    { key: 'TenTaiKhoan', label: 'Tên tài khoản', type: 'text' },
    {
      key: 'Loai',
      label: 'Vai trò',
      type: 'select',
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
      ]
    },
    { key: 'CCCD', label: 'CCCD', type: 'text' },
    { key: 'SDT', label: 'Số điện thoại', type: 'text' },
    { key: 'MatKhau', label: 'Mật khẩu', type: 'text' },
    {
      label: 'Khóa học đã tham gia',
      key: 'KhoaHocDaThamGia',
      type: 'select',
      multiple: true,
      options: courses.map(c => ({ value: c._id, label: c.TenKhoaHoc }))
    },
    {
      label: 'Kỳ thi đã tham gia',
      key: 'KyThiDaThamGia',
      type: 'select',
      multiple: true,
      options: exams.map(e => ({ value: e._id, label: e.TenKyThi }))
    }
  ];

  return (
    <PageComponent
      columns={columns}
      columnsCanEdit={columnsCanEdit}
      rows={Accounts}
      formStates={formStates}
      pageContent={pageContent}
      handleAdd={handleAdd}
      handleEdit={handleEdit}
      isEditing={!!editingAccount}
      handleUpdate={handleUpdate}
      handleDelete={handleDelete}
      resetForm={resetForm}
      FormName={AccountForm}
    />
  );
}

export default QLNguoiDung;
