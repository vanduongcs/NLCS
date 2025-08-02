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

  const formStates = {
    IDNguoiDung, SetIDNguoiDung,
    IDKyThi, SetIDKyThi,
    Diem1, SetDiem1,
    Diem2, SetDiem2,
    Diem3, SetDiem3,
    Diem4, SetDiem4
  };

  // Utility functions
  const showError = (title, message = 'Vui lòng thử lại sau.') => {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    })
  }

  const createResultData = () => ({
    IDNguoiDung,
    IDKyThi,
    Diem1: Diem1 ? Number(Diem1) : undefined,
    Diem2: Diem2 ? Number(Diem2) : undefined,
    Diem3: Diem3 ? Number(Diem3) : undefined,
    Diem4: Diem4 ? Number(Diem4) : undefined
  });

  const resetForm = () => {
    SetDiem1('');
    SetDiem2('');
    SetDiem3('');
    SetDiem4('');
    setEditingResult(null);
  };

  // API functions
  const fetchData = async () => {
    try {
      const [accountsRes, certificatesRes, resultsRes, examsRes] = await Promise.all([
        API.get('/account/tat-ca-tai-khoan'),
        API.get('/certificate/tat-ca-chung-chi'),
        API.get(`/${routeAddress}/${funcFindAll}`),
        API.get('/exam/tat-ca-ky-thi')
      ]);

      setAccounts(accountsRes.data);
      setCertificates(certificatesRes.data);
      setResults(resultsRes.data);
      setExams(examsRes.data);
    } catch (error) {
      showError('Lỗi khi tải dữ liệu');
    }
  };

  const fetchResults = () => {
    API.get(`/${routeAddress}/${funcFindAll}`)
      .then(res => setResults(res.data))
      .catch(() => showError('Lỗi khi tải kết quả'));
  };

  // Event handlers
  const handleAdd = () => {
    const exam = exams.find(e => e._id === IDKyThi);

    API.post(`/${routeAddress}/${funcAdd}`, createResultData())
      .then(() => {
        fetchResults();
        resetForm();
      })
      .catch((error) => {
        const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
        showError('Lỗi khi thêm kết quả', message)
      });
  };

  const handleDelete = async (id) => {
    API.delete(`/${routeAddress}/${funcDelete}/${id}`)
      .then(() => fetchResults())
      .catch((error) => {
        const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
        showError('Lỗi khi xóa kết quả', message)
      });
  };

  const handleEdit = (row) => {
    setEditingResult(row._id);
    SetIDNguoiDung(row.IDNguoiDung?._id || '');
    SetIDKyThi(row.IDKyThi?._id || '');
    SetDiem1(row.Diem1?.toString() || '');
    SetDiem2(row.Diem2?.toString() || '');
    SetDiem3(row.Diem3?.toString() || '');
    SetDiem4(row.Diem4?.toString() || '')
  };

  const handleUpdate = () => {
    const exam = exams.find(e => e._id === IDKyThi);
    if (!IDNguoiDung || !exam) {
      showError('Không tìm thấy tài khoản hoặc kỳ thi');
      return;
    }

    API.put(`/${routeAddress}/${funcUpdate}/${editingResult}`, createResultData())
      .then(() => {
        fetchResults();
        resetForm();
      })
      .catch((error) => {
        const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
        showError('Lỗi khi cập nhật kết quả', message)
      });
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
    { label: 'Sửa', key: 'editButton', align: 'center', isAction: 'edit' },
    { label: 'Xóa', key: 'deleteButton', align: 'center', isAction: 'delete' }
  ];

  // hàm getOptionsWithAccount tìm các exam có _id trùng với KyThiDaThamGia trong account tương ứng với giá trị của IDNguoiDung
  const getOptionsWithAccount = (IDNguoiDung) => {
    const account = accounts.find(acc => acc._id === IDNguoiDung);
    if (!account || !account.KyThiDaThamGia) return [];
    return exams.filter(exam => account.KyThiDaThamGia.includes(exam._id))
      .map(exam => ({ value: exam._id, label: exam.TenKyThi }));
  }

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
      options: getOptionsWithAccount(IDNguoiDung)
    },
    { label: 'Điểm 1', key: 'Diem1', type: 'number' },
    { label: 'Điểm 2', key: 'Diem2', type: 'number' },
    { label: 'Điểm 3', key: 'Diem3', type: 'number' },
    { label: 'Điểm 4', key: 'Diem4', type: 'number' }
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
