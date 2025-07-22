import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import API from '../../api.jsx';
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx';
import ExamForm from '../../components/Form/ExamForm.jsx';

function QLKyThi() {
  // Constants
  const routeAddress = 'exam';
  const pageContent = 'kỳ thi';
  const funcAdd = 'them-dot-thi';
  const funcFindAll = 'tat-ca-dot-thi';
  const funcUpdate = 'cap-nhat-dot-thi';
  const funcDelete = 'xoa-dot-thi';

  // State
  const [EditingExam, SetEditingExam] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [Exams, SetExams] = useState([]);

  const [IDChungChi, SetIDChungChi] = useState('');
  const [NgayThi, SetNgayThi] = useState('');
  const [Buoi, SetBuoi] = useState('');
  const [SiSoToiDa, SetSiSoToiDa] = useState('');
  const [SiSoHienTai, SetSiSoHienTai] = useState('');

  const formStates = {
    IDChungChi, SetIDChungChi,
    NgayThi, SetNgayThi,
    Buoi, SetBuoi,
    SiSoToiDa, SetSiSoToiDa,
    SiSoHienTai
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

  const createExamData = () => ({
    IDChungChi,
    NgayThi: new Date(NgayThi),
    Buoi,
    SiSoToiDa: SiSoToiDa ? Number(SiSoToiDa) : undefined
  });

  const resetForm = () => {
    SetIDChungChi('');
    SetNgayThi('');
    SetBuoi('');
    SetSiSoToiDa('');
    SetEditingExam(null);
  };

  const getCertificateInfo = (row, field) => {
    const certId = typeof row.IDChungChi === 'object' ? row.IDChungChi._id : row.IDChungChi;
    const cert = certificates.find(c => String(c._id) === String(certId));
    return cert ? cert[field] : '';
  };

  // API functions
  const fetchData = async () => {
    try {
      const [certificatesRes, examsRes] = await Promise.all([
        API.get('/certificate/tat-ca-chung-chi'),
        API.get(`/${routeAddress}/${funcFindAll}`)
      ]);

      setCertificates(certificatesRes.data);
      SetExams(examsRes.data);
    } catch (error) {
      showError('Lỗi khi tải dữ liệu');
    }
  };

  const fetchExams = async () => {
    try {
      const res = await API.get(`/${routeAddress}/${funcFindAll}`);
      SetExams(res.data);
    } catch (error) {
      showError(`Không thể tải danh sách ${pageContent}`);
    }
  };

  // Event handlers
  const handleAdd = async () => {
    try {
      await API.post(`/${routeAddress}/${funcAdd}`, createExamData());
      await fetchExams();
      resetForm();
    } catch (error) {
      showError(`Lỗi khi thêm ${pageContent}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/${routeAddress}/${funcDelete}/${id}`);
      await fetchExams();
    } catch (error) {
      showError(`Lỗi khi xóa ${pageContent}`);
    }
  };

  const handleEdit = (row) => {
    SetIDChungChi(row.IDChungChi?._id || '');
    SetNgayThi(row.NgayThi ? new Date(row.NgayThi).toISOString().slice(0, 10) : '');
    SetBuoi(row.Buoi);
    SetSiSoToiDa(row.SiSoToiDa?.toString() || '');
    SetEditingExam(row._id);
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/${routeAddress}/${funcUpdate}/${EditingExam}`, createExamData());
      await fetchExams();
      resetForm();
    } catch (error) {
      showError(`Lỗi khi chỉnh sửa ${pageContent}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Table configuration
  const columns = [
    { label: 'Tên kỳ thi', key: 'TenKyThi' },
    {
      label: 'Chứng chỉ',
      key: 'IDChungChi',
      render: (value, row) => getCertificateInfo(row, 'TenChungChi')
    },
    {
      label: 'Loại',
      key: 'IDChungChi',
      render: (value, row) => getCertificateInfo(row, 'Loai')
    },
    {
      label: 'Lệ phí thi',
      key: 'IDChungChi',
      render: (value, row) => getCertificateInfo(row, 'LePhiThi')
    },
    { label: 'Ngày thi', key: 'NgayThi', isDate: true },
    { label: 'Buổi', key: 'Buoi' },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa' },
    { label: 'Sĩ số hiện tại', key: 'SiSoHienTai' },
    { label: 'Thời gian khởi tạo', key: 'createdAt', isDate: true },
    { label: 'Lần sửa cuối', key: 'updatedAt', isDate: true },
    { label: 'Sửa', key: 'editButton', isAction: 'edit' },
    { label: 'Xóa', key: 'deleteButton', isAction: 'delete' }
  ];

  const columnsCanEdit = [
    {
      label: 'Chọn chứng chỉ', 
      key: 'IDChungChi', 
      type: 'select',
      options: certificates.map(cert => ({
        label: cert.TenChungChi,
        value: cert._id
      }))
    },
    { label: 'Ngày thi', key: 'NgayThi', type: 'date' },
    {
      label: 'Buổi', 
      key: 'Buoi', 
      type: 'select',
      options: [
        { value: 'Sáng', label: 'Sáng' },
        { value: 'Chiều', label: 'Chiều' }
      ]
    },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa', type: 'number' }
  ];

  return (
    <PageComponent
      columns={columns}
      columnsCanEdit={columnsCanEdit}
      rows={Exams}
      formStates={formStates}
      pageContent="đợt thi"
      handleAdd={handleAdd}
      handleEdit={handleEdit}
      isEditing={!!EditingExam}
      handleUpdate={handleUpdate}
      handleDelete={handleDelete}
      resetForm={resetForm}
      FormName={ExamForm}
    />
  );
}

export default QLKyThi;
