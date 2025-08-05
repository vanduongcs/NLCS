import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import API from '../../api.jsx';
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx';
import ResultForm from '../../components/Form/ResultForm.jsx';

// Thêm import cho History Icon và Modal
import HistoryIcon from '@mui/icons-material/History'
import IconButton from '@mui/material/IconButton'
import fetchCollectionHistory from '../../components/fetchCollectionHistory/fetchCollectionHistory.js'
import RelatedDataModal from '../../components/Modal/RelatedDataModal.jsx'

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

  // Thêm state cho modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalData, setModalData] = useState([])
  const [modalColumns, setModalColumns] = useState([])
  const [modalType, setModalType] = useState('LichSu');

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

  // Thêm các hàm utility cho lịch sử
  const getFieldDisplayName = (field) => {
    const fieldNames = {
      'IDNguoiDung': 'Người dùng',
      'IDKyThi': 'Kỳ thi',
      'Diem1': 'Điểm 1',
      'Diem2': 'Điểm 2',
      'Diem3': 'Điểm 3',
      'Diem4': 'Điểm 4',
      'DiemTK': 'Điểm tổng kết',
      'KQ': 'Kết quả',
      'NgayCap': 'Ngày cấp',
      'NgayHetHan': 'Ngày hết hạn'
    }
    return fieldNames[field] || field
  }

  const formatHistoryValue = (value, fieldName) => {
    if (value === null || value === undefined) return '___'
    if (fieldName === 'NgayCap' || fieldName === 'NgayHetHan') {
      return new Date(value).toLocaleDateString('vi-VN')
    }
    if (fieldName === 'IDKyThi') {
      const valueDisplay = exams.find(e => e._id === value)
      return valueDisplay.TenKyThi
    }
    return String(value)
  }

  // Hàm mở modal lịch sử
  const handleOpenModal = (type, row) => {
    setModalType(type);
    if (type === 'LichSu') {
      setModalTitle('Lịch sử thay đổi kết quả');
      setModalColumns([
        { key: 'KieuThayDoi', label: 'Loại thay đổi' },
        { key: 'ThoiGian', label: 'Thời gian', render: (value) => new Date(value).toLocaleString('vi-VN') },
        { key: 'TruongDLThayDoi', label: 'Trường dữ liệu', render: (value) => getFieldDisplayName(value) },
        { key: 'DLTruoc', label: 'Giá trị trước', render: (value, row) => formatHistoryValue(value, row.TruongDLThayDoi) },
        { key: 'DLSau', label: 'Giá trị sau', render: (value, row) => formatHistoryValue(value, row.TruongDLThayDoi) }
      ]);
      fetchCollectionHistory({
        apiPath: '/resultHistory/tim-lich-su-ket-qua',
        id: row._id,
        getFieldDisplayName,
        formatHistoryValue,
        setModalData
      });
    }
    setModalOpen(true);
  }

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
    {
      label: 'Lịch sử',
      key: 'LichSu',
      align: 'center',
      render: (value, row) => (
        <IconButton onClick={() => handleOpenModal('LichSu', row)}>
          <HistoryIcon color="secondary" />
        </IconButton>
      )
    },
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
    <>
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
      <RelatedDataModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        dataNeeded={null}
        modalOptions={[]}
        type={modalType}
        title={modalTitle}
        data={modalData}
        columns={modalColumns}
        onAdd={null}
        onDelete={null}
        onUpdateOptions={null}
      />
    </>
  );
}

export default QLKetQua;
