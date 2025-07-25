import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import API from '../../api.jsx';
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx';
import ResultForm from '../../components/Form/ResultForm.jsx';

function QLKetQua() {
  // Constants
  const routeAddress = 'result';
  const pageContent = 'kết quả';
  const funcAdd = 'them-ket-qua';
  const funcFindAll = 'tat-ca-ket-qua';
  const funcUpdate = 'cap-nhat-ket-qua';
  const funcDelete = 'xoa-ket-qua';

  // State
  const [editingResult, setEditingResult] = useState(null);
  const [results, setResults] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [exams, setExams] = useState([]);

  const [IDNguoiDung, SetIDNguoiDung] = useState('');
  const [IDKyThi, SetIDKyThi] = useState('');
  const [Diem1, SetDiem1] = useState('');
  const [Diem2, SetDiem2] = useState('');
  const [Diem3, SetDiem3] = useState('');
  const [Diem4, SetDiem4] = useState('');
  const [NgayCap, SetNgayCap] = useState('');
  const [TrangThai, SetTrangThai] = useState('');

  const formStates = {
    IDNguoiDung, SetIDNguoiDung,
    IDKyThi, SetIDKyThi,
    Diem1, SetDiem1,
    Diem2, SetDiem2,
    Diem3, SetDiem3,
    Diem4, SetDiem4,
    NgayCap, SetNgayCap,
    TrangThai, SetTrangThai
  };

  // Utility functions
  const showAlert = (title) => {
    Swal.fire({
      icon: 'warning',
      title,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    });
  };

  const createResultData = () => ({
    IDNguoiDung,
    IDKyThi,
    Diem1: Number(Diem1),
    Diem2: Number(Diem2),
    Diem3: Diem3 ? Number(Diem3) : undefined,
    Diem4: Diem4 ? Number(Diem4) : undefined,
    NgayCap: new Date(NgayCap),
    TrangThai: TrangThai || 'Chưa lấy'
  });

  const resetForm = () => {
    SetIDNguoiDung('');
    SetIDKyThi('');
    SetDiem1('');
    SetDiem2('');
    SetDiem3('');
    SetDiem4('');
    SetNgayCap('');
    SetTrangThai('');
    setEditingResult(null);
  };

  // API functions
  const fetchData = async () => {
    try {
      const [accountsRes, certificatesRes, resultsRes, examsRes] = await Promise.all([
        API.get('/account/tat-ca-tai-khoan'),
        API.get('/certificate/tat-ca-chung-chi'),
        API.get(`/${routeAddress}/${funcFindAll}`),
        API.get('/exam/tat-ca-dot-thi')
      ]);

      setAccounts(accountsRes.data);
      setCertificates(certificatesRes.data);
      setResults(resultsRes.data);
      setExams(examsRes.data);
    } catch (error) {
      showAlert('Lỗi khi tải dữ liệu');
    }
  };

  const fetchResults = () => {
    API.get(`/${routeAddress}/${funcFindAll}`)
      .then(res => setResults(res.data))
      .catch(() => showAlert('Lỗi khi tải kết quả'));
  };

  // Event handlers
  const handleAdd = () => {
    const exam = exams.find(e => e._id === IDKyThi);
    if (!IDNguoiDung || !exam) {
      showAlert('Không tìm thấy người dùng hoặc kỳ thi');
      return;
    }

    API.post(`/${routeAddress}/${funcAdd}`, createResultData())
      .then(() => {
        fetchResults();
        resetForm();
      })
      .catch(() => showAlert('Lỗi khi thêm kết quả'));
  };

  const handleDelete = async (id) => {
    API.delete(`/${routeAddress}/${funcDelete}/${id}`)
      .then(() => fetchResults())
      .catch(() => showAlert('Lỗi khi xóa kết quả'));
  };

  const handleEdit = (row) => {
    setEditingResult(row._id);
    SetIDNguoiDung(row.IDNguoiDung?._id || '');
    SetIDKyThi(row.IDKyThi?._id || '');
    SetDiem1(row.Diem1?.toString() || '');
    SetDiem2(row.Diem2?.toString() || '');
    SetDiem3(row.Diem3?.toString() || '');
    SetDiem4(row.Diem4?.toString() || '');
    SetNgayCap(new Date(row.NgayCap).toISOString().slice(0, 10));
    SetTrangThai(row.TrangThai);
  };

  const handleUpdate = () => {
    const exam = exams.find(e => e._id === IDKyThi);
    if (!IDNguoiDung || !exam) {
      showAlert('Không tìm thấy tài khoản hoặc kỳ thi');
      return;
    }

    API.put(`/${routeAddress}/${funcUpdate}/${editingResult}`, createResultData())
      .then(() => {
        fetchResults();
        resetForm();
      })
      .catch(() => showAlert('Lỗi khi cập nhật kết quả'));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Table configuration
  const columns = [
    { label: 'Người dùng', key: 'IDNguoiDung', render: (_, row) => row.IDNguoiDung?.TenHienThi || '' },
    { label: 'Chứng chỉ', key: 'IDKyThi', render: (_, row) => row.IDKyThi?.IDChungChi?.TenChungChi || '' },
    { label: 'Kỳ thi', key: 'IDKyThi', render: (_, row) => row.IDKyThi?.TenKyThi || '' },
    { label: 'Điểm 1', key: 'Diem1' },
    { label: 'Điểm 2', key: 'Diem2' },
    { label: 'Điểm 3', key: 'Diem3' },
    { label: 'Điểm 4', key: 'Diem4' },
    { label: 'Điểm tổng kết', key: 'DiemTK' },
    { label: 'Kết quả', key: 'KQ' },
    { label: 'Ngày cấp', key: 'NgayCap', isDate: true },
    { label: 'Ngày hết hạn', key: 'NgayHetHan', isDate: true },
    { label: 'Trạng thái', key: 'TrangThai' },
    { label: 'Tạo lúc', key: 'createdAt', isDate: true },
    { label: 'Cập nhật lúc', key: 'updatedAt', isDate: true },
    { label: 'Sửa', key: 'editButton', isAction: 'edit' },
    { label: 'Xóa', key: 'deleteButton', isAction: 'delete' }
  ];

  const columnsCanEdit = [
    {
      label: 'Người dùng',
      key: 'IDNguoiDung',
      type: 'autocomplete',
      options: accounts.map(acc => ({ value: acc._id, label: acc.TenHienThi }))
    },
    {
      label: 'Kỳ thi',
      key: 'IDKyThi',
      type: 'autocomplete',
      options: exams.map(e => ({ value: e._id, label: e.TenKyThi }))
    },
    { label: 'Điểm 1', key: 'Diem1', type: 'number' },
    { label: 'Điểm 2', key: 'Diem2', type: 'number' },
    { label: 'Điểm 3', key: 'Diem3', type: 'number' },
    { label: 'Điểm 4', key: 'Diem4', type: 'number' },
    { label: 'Ngày cấp', key: 'NgayCap', type: 'date' },
    {
      label: 'Trạng thái',
      key: 'TrangThai',
      type: 'select',
      options: [
        { value: 'Chưa lấy', label: 'Chưa lấy' },
        { value: 'Đã lấy', label: 'Đã lấy' }
      ]
    }
  ];

  return (
    <PageComponent
      columns={columns}
      columnsCanEdit={columnsCanEdit}
      rows={results}
      formStates={formStates}
      pageContent={pageContent}
      handleAdd={handleAdd}
      handleEdit={handleEdit}
      isEditing={!!editingResult}
      handleUpdate={handleUpdate}
      handleDelete={handleDelete}
      resetForm={resetForm}
      FormName={ResultForm}
    />
  );
}

export default QLKetQua;
