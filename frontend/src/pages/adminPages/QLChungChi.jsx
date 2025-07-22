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

  const formStates = {
    TenChungChi, SetTenChungChi,
    Loai, SetLoai,
    LePhiThi, SetLePhiThi,
    HocPhi, SetHocPhi,
    ThoiHan, SetThoiHan,
    DiemToiThieu, SetDiemToiThieu
  };

  // Utility functions
  const showError = (title) => {
    Swal.fire({
      icon: 'warning',
      title,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    });
  };

  const createCertificateData = () => ({
    TenChungChi,
    Loai,
    LePhiThi: Number(LePhiThi),
    HocPhi: Number(HocPhi),
    ThoiHan: Number(ThoiHan),
    DiemToiThieu: Number(DiemToiThieu)
  });

  const resetForm = () => {
    SetTenChungChi('');
    SetLoai('');
    SetLePhiThi('');
    SetHocPhi('');
    SetThoiHan('');
    SetDiemToiThieu('');
    setEditingCertificate(null);
  };

  // API functions
  const fetchCertificates = () => {
    API.get(`/${routeAddress}/${funcFindAll}`)
      .then(res => setCertificates(res.data))
      .catch(() => showError('Không thể tải danh sách chứng chỉ'));
  };

  const handleAdd = async () => {
    API.post(`/${routeAddress}/${funcAdd}`, createCertificateData())
      .then(() => {
        fetchCertificates();
        resetForm();
      })
      .catch(() => showError('Lỗi khi thêm chứng chỉ'));
  };

  const handleDelete = async (id) => {
    API.delete(`/${routeAddress}/${funcDelete}/${id}`)
      .then(() => fetchCertificates())
      .catch(() => showError('Lỗi khi xóa chứng chỉ'));
  };

  const handleEdit = (row) => {
    setEditingCertificate(row._id);
    SetTenChungChi(row.TenChungChi);
    SetLoai(row.Loai);
    SetLePhiThi(row.LePhiThi);
    SetHocPhi(row.HocPhi);
    SetThoiHan(row.ThoiHan);
    SetDiemToiThieu(row.DiemToiThieu);
  };

  const handleUpdate = () => {
    API.put(`/${routeAddress}/${funcUpdate}/${editingCertificate}`, createCertificateData())
      .then(() => {
        fetchCertificates();
        resetForm();
      })
      .catch(() => showError('Lỗi khi cập nhật chứng chỉ'));
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Table configuration
  const columns = [
    { label: 'Tên chứng chỉ', key: 'TenChungChi' },
    { label: 'Điểm tối thiểu', key: 'DiemToiThieu' },
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
