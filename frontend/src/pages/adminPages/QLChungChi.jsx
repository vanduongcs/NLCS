import { useState, useEffect } from 'react';
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx';
import CertificateForm from '../../components/Form/CertificateForm.jsx';
import API from '../../api.jsx';
import Swal from 'sweetalert2';

function QLChungChi() {
  // Constants
  const routeAddress = 'certificate';
  const pageContent = 'chứng chỉ';
  const funcAdd = 'them-chung-chi';
  const funcFindAll = 'tat-ca-chung-chi';
  const funcUpdate = 'cap-nhat-chung-chi';
  const funcDelete = 'xoa-chung-chi';

  // State
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [TenChungChi, SetTenChungChi] = useState('');
  const [Loai, SetLoai] = useState('');
  const [LePhiThi, SetLePhiThi] = useState('');
  const [HocPhi, SetHocPhi] = useState('');
  const [ThoiHan, SetThoiHan] = useState('');
  const [DiemToiThieu, SetDiemToiThieu] = useState('');
  const [DiemToiDa, SetDiemToiDa] = useState('')

  const formStates = {
    TenChungChi, SetTenChungChi,
    Loai, SetLoai,
    LePhiThi, SetLePhiThi,
    HocPhi, SetHocPhi,
    ThoiHan, SetThoiHan,
    DiemToiThieu, SetDiemToiThieu,
    DiemToiDa, SetDiemToiDa
  };

  const createCertificateData = () => ({
    TenChungChi,
    Loai,
    LePhiThi: Number(LePhiThi),
    HocPhi: Number(HocPhi),
    ThoiHan: Number(ThoiHan),
    DiemToiThieu: Number(DiemToiThieu),
    DiemToiDa: Number(DiemToiDa)
  });

  const resetForm = () => {
    SetTenChungChi('');
    SetLoai('');
    SetLePhiThi('');
    SetHocPhi('');
    SetThoiHan('');
    SetDiemToiThieu('');
    SetDiemToiDa('')
    setEditingCertificate(null);
  };

  // API functions
  const fetchCertificates = () => {
    API.get(`/${routeAddress}/${funcFindAll}`)
      .then(res => setCertificates(res.data))
      .catch(() => showError('Không thể tải danh sách chứng chỉ'));
  };

  const handleAdd = async () => {
    try {
      await API.post(`/${routeAddress}/${funcAdd}`, createCertificateData());
      fetchCertificates();
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Thêm chứng chỉ thành công',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1976d2'
      });
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể thêm chứng chỉ');
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: 'Bạn có chắc muốn xóa chứng chỉ này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/${routeAddress}/${funcDelete}/${id}`);
          fetchCertificates();
          Swal.fire({
            icon: 'success',
            title: 'Đã xóa',
            text: 'Chứng chỉ đã được xóa thành công',
            confirmButtonText: 'Đóng',
            confirmButtonColor: '#1976d2'
          });
        } catch (error) {
          showError(error.response?.data?.message || 'Không thể xóa chứng chỉ');
        }
      }
    });
  };

  const handleEdit = (row) => {
    setEditingCertificate(row._id);
    SetTenChungChi(row.TenChungChi);
    SetLoai(row.Loai);
    SetLePhiThi(row.LePhiThi);
    SetHocPhi(row.HocPhi);
    SetThoiHan(row.ThoiHan);
    SetDiemToiThieu(row.DiemToiThieu);
    SetDiemToiDa(row.DiemToiDa)
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/${routeAddress}/${funcUpdate}/${editingCertificate}`, createCertificateData());
      fetchCertificates();
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Cập nhật chứng chỉ thành công',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1976d2'
      });
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể cập nhật chứng chỉ');
    }
  };

  // Hàm showError có thể được cập nhật để linh hoạt hơn
  const showError = (message) => {
    Swal.fire({
      icon: 'warning',
      title: 'Thông báo',
      text: message,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    });
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Table configuration
  const columns = [
    { label: 'Tên chứng chỉ', key: 'TenChungChi' },
    { label: 'Điểm tối thiểu', key: 'DiemToiThieu' },
    { label: 'Điểm tối đa', key: 'DiemToiDa' },
    { label: 'Loại', key: 'Loai' },
    { label: 'Lệ phí thi', key: 'LePhiThi' },
    { label: 'Học phí', key: 'HocPhi' },
    { label: 'Thời hạn', key: 'ThoiHan' },
    { label: 'Thời gian khởi tạo', key: 'createdAt', isDate: true },
    { label: 'Lần sửa cuối', key: 'updatedAt', isDate: true },
    { label: 'Sửa', isAction: 'edit' },
    { label: 'Xóa', isAction: 'delete' }
  ];

  const columnsCanEdit = [
    { label: 'Tên chứng chỉ', key: 'TenChungChi', type: 'text' },
    { label: 'Điểm tối thiểu', key: 'DiemToiThieu', type: 'number' },
    { label: 'Điểm tối đa', key: 'DiemToiDa', type: 'number' },
    {
      label: 'Loại', key: 'Loai', type: 'select',
      options: [
        { value: 'Ngoại ngữ', label: 'Ngoại ngữ' },
        { value: 'Tin học', label: 'Tin học' }
      ]
    },
    { label: 'Lệ phí thi', key: 'LePhiThi', type: 'number' },
    { label: 'Học phí', key: 'HocPhi', type: 'number' },
    { label: 'Thời hạn', key: 'ThoiHan', type: 'number' }
  ];

  return (
    <PageComponent
      columns={columns}
      columnsCanEdit={columnsCanEdit}
      rows={certificates}
      formStates={formStates}
      pageContent={pageContent}
      handleAdd={handleAdd}
      handleEdit={handleEdit}
      isEditing={!!editingCertificate}
      handleUpdate={handleUpdate}
      handleDelete={handleDelete}
      resetForm={resetForm}
      FormName={CertificateForm}
    />
  );
}

export default QLChungChi;
