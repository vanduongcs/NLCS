import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import API from '../../api.jsx';
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx';
import CourseForm from '../../components/Form/CourseForm.jsx';

import HistoryIcon from '@mui/icons-material/History'
import IconButton from '@mui/material/IconButton'

import fetchCollectionHistory from '../../components/fetchCollectionHistory/fetchCollectionHistory.js'
import RelatedDataModal from '../../components/Modal/RelatedDataModal.jsx'

import ListAltIcon from '@mui/icons-material/ListAlt'

function QLKhoaOn() {
  // Constants
  const routeAddress = 'course';
  const pageContent = 'khóa ôn';
  const funcAdd = 'them-khoa-on';
  const funcFind = 'tim-khoa-on';
  const funcFindAll = 'tat-ca-khoa-on';
  const funcUpdate = 'cap-nhat-khoa-on';
  const funcDelete = 'xoa-khoa-on';
  const historyAddress = 'courseHistory'

  // State
  const [EditingCourse, SetEditingCourse] = useState(null);
  const [Courses, SetCourses] = useState([]);
  const [Certificates, SetCertificates] = useState([]);
  const [currentCourseId, setCurrentCourseId] = useState(null);

  const [CertificateID, SetCertificateID] = useState('');
  const [LichHoc, SetLichHoc] = useState('');
  const [NgayKhaiGiang, SetNgayKhaiGiang] = useState('');
  const [NgayKetThuc, SetNgayKetThuc] = useState('');
  const [Buoi, SetBuoi] = useState('');
  const [SiSoToiDa, SetSiSoToiDa] = useState('');
  const [SiSoHienTai, SetSiSoHienTai] = useState('');

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalData, setModalData] = useState([])
  const [modalColumns, setModalColumns] = useState([])
  const [modalType, setModalType] = useState('LichSu');
  const [modalOptions, setModalOptions] = useState([]);
  const [accounts, setAccounts] = useState([]); // Thêm state này để lưu danh sách tài khoản

  const formStates = {
    CertificateID, SetCertificateID,
    LichHoc, SetLichHoc,
    NgayKhaiGiang, SetNgayKhaiGiang,
    NgayKetThuc, SetNgayKetThuc,
    Buoi, SetBuoi,
    SiSoToiDa, SetSiSoToiDa,
    SiSoHienTai
  };

  // Utility functions
  const showError = (message) => {
    Swal.fire({
      icon: 'warning',
      title: 'Thông báo',
      text: message,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    });
  };

  const createCourseData = () => ({
    IDChungChi: CertificateID,
    LichHoc,
    NgayKhaiGiang: new Date(NgayKhaiGiang),
    NgayKetThuc: new Date(NgayKetThuc),
    Buoi,
    SiSoToiDa: Number(SiSoToiDa) || undefined
  });

  const resetForm = () => {
    SetCertificateID('');
    SetLichHoc('');
    SetNgayKhaiGiang('');
    SetNgayKetThuc('');
    SetBuoi('');
    SetSiSoToiDa('');
    SetEditingCourse(null);
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get(`/${routeAddress}/${funcFindAll}`);
      const coursesWForeignData = res.data.map((course) => {
        const id = course.IDChungChi?._id;
        const cert = Certificates.find(c => c._id === id);
        return {
          ...course,
          TenChungChi: cert?.TenChungChi || ''
        };
      });
      SetCourses(coursesWForeignData);
    } catch (error) {
      showError('Lỗi khi tải danh sách khóa ôn');
    }
  };

  const fetchData = async () => {
    try {
      const [certificatesRes, coursesRes, accountsRes] = await Promise.all([
        API.get('/certificate/tat-ca-chung-chi'),
        API.get(`/${routeAddress}/${funcFindAll}`),
        API.get('/account/tat-ca-tai-khoan')
      ]);

      SetCertificates(certificatesRes.data);
      setAccounts(accountsRes.data); // Lưu danh sách tài khoản

      const coursesWForeignData = coursesRes.data.map((course) => {
        const id = course.IDChungChi?._id;
        const cert = certificatesRes.data.find(c => c._id === id);
        return {
          ...course,
          TenChungChi: cert?.TenChungChi || ''
        };
      });
      SetCourses(coursesWForeignData);
    } catch (error) {
      showError('Lỗi khi tải dữ liệu');
    }
  };

  // Hàm chuyển tên trường dữ liệu sang tiếng Việt
  const getFieldDisplayName = (field) => {
    const fieldNames = {
      'IDChungChi': 'Chứng chỉ',
      'LichHoc': 'Lịch học',
      'NgayKhaiGiang': 'Ngày khai giảng',
      'NgayKetThuc': 'Ngày kết thúc',
      'Buoi': 'Buổi',
      'SiSoToiDa': 'Sĩ số tối đa',
      'SiSoHienTai': 'Sĩ số hiện tại',
      'TenKhoaHoc': 'Tên khóa học'
    }
    return fieldNames[field] || field
  }

  // Hàm format giá trị lịch sử
  const formatHistoryValue = (value, fieldName) => {
    if (value === null || value === undefined) return '___'
    if (fieldName === 'NgayKhaiGiang' || fieldName === 'NgayKetThuc') return new Date(value).toLocaleDateString('vi-VN')
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  // Hàm mở modal lịch sử
  const handleOpenModal = (type, row) => {
    setModalType(type);
    if (type === 'LichSu') {
      setModalTitle('Lịch sử thay đổi');
      setModalColumns([
        { key: 'KieuThayDoi', label: 'Loại thay đổi' },
        { key: 'ThoiGian', label: 'Thời gian', render: (value) => new Date(value).toLocaleString('vi-VN') },
        { key: 'TruongDLThayDoi', label: 'Trường dữ liệu', render: (value) => getFieldDisplayName(value) },
        { key: 'DLTruoc', label: 'Giá trị trước', render: (value, row) => formatHistoryValue(value, row.TruongDLThayDoi) },
        { key: 'DLSau', label: 'Giá trị sau', render: (value, row) => formatHistoryValue(value, row.TruongDLThayDoi) }
      ]);
      fetchCollectionHistory({
        apiPath: '/courseHistory/tim-lich-su-khoa-hoc',
        id: row._id,
        getFieldDisplayName,
        formatHistoryValue,
        setModalData
      });
      setModalOptions([]);
    } else if (type === 'IDTaiKhoan') {
      setCurrentCourseId(row._id);
      fetchRelatedData(row._id, row, type);
    }
    setModalOpen(true);
  }

  const fetchRelatedData = async (courseId, row, type) => {
    if (type === 'IDTaiKhoan') {
      // Lấy danh sách tài khoản của khóa học này
      const course = Courses.find(c => c._id === courseId);
      if (!course) {
        setModalData([]);
        setModalColumns([]);
        setModalOptions([]);
        setModalTitle('Danh sách học viên');
        return;
      }
      // Lấy thông tin tài khoản từ accounts
      const dsHocVien = (course.IDTaiKhoan || []).map(accId => {
        const acc = accounts.find(a => a._id === accId);
        return {
          _id: acc?._id || accId,
          TenHienThi: acc?.TenHienThi || accId,
          TenTaiKhoan: acc?.TenTaiKhoan || '',
          SDT: acc?.SDT || '',
          CCCD: acc?.CCCD || ''
        }
      });
      setModalData(dsHocVien);
      setModalColumns([
        { key: 'TenHienThi', label: 'Tên học viên' },
        { key: 'TenTaiKhoan', label: 'Tài khoản' },
        { key: 'SDT', label: 'Số điện thoại' },
        { key: 'CCCD', label: 'CCCD' }
      ]);
      // Tìm các tài khoản chưa có trong khóa học này để làm options thêm
      const accountsListRes = await API.get('/account/tat-ca-tai-khoan');
      const accountsList = accountsListRes.data;
      const accountNotInCourse = accountsList.filter(acc =>
        !(course.IDTaiKhoan || []).map(id => String(id)).includes(String(acc._id))
      );
      setModalOptions(accountNotInCourse.map(a => ({
        value: a._id,
        label: a.TenHienThi + (a.TenTaiKhoan ? ` (${a.TenTaiKhoan})` : '')
      })));
      setModalTitle('Danh sách học viên');
    }
  };

  // Event handlers
  const handleAdd = async () => {
    try {
      const response = await API.post(`/${routeAddress}/${funcAdd}`, createCourseData());
      await fetchCourses();
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: response.data.message || 'Thêm khóa ôn thành công',
        confirmButtonText: 'Đóng'
      });
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể thêm khóa ôn');
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: 'Bạn có chắc muốn xóa khóa ôn này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await API.delete(`/${routeAddress}/${funcDelete}/${id}`);
          await fetchCourses();
          Swal.fire({
            icon: 'success',
            title: 'Đã xóa',
            text: response.data.message || 'Xóa khóa ôn thành công',
            confirmButtonText: 'Đóng'
          });
        } catch (error) {
          showError(error.response?.data?.message || 'Không thể xóa khóa ôn');
        }
      }
    });
  };

  const handleEdit = (row) => {
    SetCertificateID(row.IDChungChi?._id);
    SetLichHoc(row.LichHoc);
    SetNgayKhaiGiang(new Date(row.NgayKhaiGiang).toISOString().slice(0, 10));
    SetNgayKetThuc(new Date(row.NgayKetThuc).toISOString().slice(0, 10));
    SetBuoi(row.Buoi);
    SetSiSoToiDa(row.SiSoToiDa?.toString());
    SetEditingCourse(row._id);
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/${routeAddress}/${funcUpdate}/${EditingCourse}`, createCourseData());
      await fetchCourses();
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Cập nhật khóa ôn thành công',
        confirmButtonText: 'Đóng'
      });
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể cập nhật khóa ôn');
    }
  };

  const handleAddRelated = async (courseId, type, accountId) => {
    if (type !== 'IDTaiKhoan') return;

    try {
      // Lấy thông tin course hiện tại
      const courseRes = await API.get(`/course/${funcFind}/${courseId}`);
      const courseData = courseRes.data;

      // Lấy danh sách IDTaiKhoan hiện tại, đảm bảo không null/undefined
      const currentAccountIds = courseData.IDTaiKhoan || [];

      // Kiểm tra xem tài khoản đã có trong danh sách chưa
      if (currentAccountIds.includes(accountId)) {
        showError('Học viên đã có trong khóa học này!');
        return;
      }

      // Thêm accountId vào danh sách
      const updatedAccountIds = [...currentAccountIds, accountId];

      // Cập nhật course với danh sách IDTaiKhoan mới
      await API.put(`/${routeAddress}/${funcUpdate}/${courseId}`, {
        IDChungChi: courseData.IDChungChi?._id || courseData.IDChungChi,
        IDTaiKhoan: updatedAccountIds,
        LichHoc: courseData.LichHoc,
        NgayKhaiGiang: courseData.NgayKhaiGiang,
        NgayKetThuc: courseData.NgayKetThuc,
        Buoi: courseData.Buoi,
        SiSoToiDa: courseData.SiSoToiDa
      });

      // Refresh dữ liệu courses trong state
      await fetchCourses();

      // Fetch lại dữ liệu accounts để đảm bảo có dữ liệu mới nhất
      const accountsRes = await API.get('/account/tat-ca-tai-khoan');
      const updatedAccounts = accountsRes.data;
      setAccounts(updatedAccounts); // Cập nhật state accounts

      // Cập nhật modal ngay lập tức với dữ liệu mới
      const dsHocVien = updatedAccountIds.map(accId => {
        const acc = updatedAccounts.find(a => a._id === accId);
        return {
          _id: acc?._id || accId,
          TenHienThi: acc?.TenHienThi || accId,
          TenTaiKhoan: acc?.TenTaiKhoan || '',
          SDT: acc?.SDT || '',
          CCCD: acc?.CCCD || ''
        }
      });

      setModalData(dsHocVien);

      // Cập nhật options (loại bỏ account vừa thêm)
      const accountNotInCourse = updatedAccounts.filter(acc =>
        !updatedAccountIds.includes(acc._id)
      );
      setModalOptions(accountNotInCourse.map(a => ({
        value: a._id,
        label: a.TenHienThi + (a.TenTaiKhoan ? ` (${a.TenTaiKhoan})` : '')
      })));

    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi thêm học viên vào khóa học.';
      showError(message);
    }
  };

  const handleDeleteRelated = async (row, courseId, type) => {
    if (type !== 'IDTaiKhoan') return;
    try {
      const course = Courses.find(c => c._id === courseId);
      if (!course) return;

      const newList = (course.IDTaiKhoan || []).filter(id => id !== row._id);

      await API.put(`/course/${funcUpdate}/${courseId}`, {
        ...course,
        IDTaiKhoan: newList,
        IDChungChi: course.IDChungChi?._id || course.IDChungChi,
        LichHoc: course.LichHoc,
        NgayKhaiGiang: course.NgayKhaiGiang,
        NgayKetThuc: course.NgayKetThuc,
        Buoi: course.Buoi,
        SiSoToiDa: course.SiSoToiDa
      });

      await fetchCourses();

      // Cập nhật modal ngay lập tức
      const dsHocVien = newList.map(accId => {
        const acc = accounts.find(a => a._id === accId);
        return {
          _id: acc?._id || accId,
          TenHienThi: acc?.TenHienThi || accId,
          TenTaiKhoan: acc?.TenTaiKhoan || '',
          SDT: acc?.SDT || '',
          CCCD: acc?.CCCD || ''
        }
      });

      setModalData(dsHocVien);

      // Cập nhật options (thêm lại account vừa xóa)
      const accountNotInCourse = accounts.filter(acc =>
        !newList.includes(acc._id)
      );
      setModalOptions(accountNotInCourse.map(a => ({
        value: a._id,
        label: a.TenHienThi + (a.TenTaiKhoan ? ` (${a.TenTaiKhoan})` : '')
      })));

    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi khi xóa học viên', message)
    }
  };

  // Thêm hàm handleUpdateModalOptions
  const handleUpdateModalOptions = (type, addedId) => {
    if (type === 'IDTaiKhoan') {
      setModalOptions(prev => prev.filter(option => option.value !== addedId));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Table configuration
  const columns = [
    { label: 'Tên khóa học', key: 'TenKhoaHoc' },
    { label: 'Tên chứng chỉ', key: 'TenChungChi' },
    { label: 'Lịch học', key: 'LichHoc' },
    { label: 'Ngày khai giảng', key: 'NgayKhaiGiang', isDate: true },
    { label: 'Ngày kết thúc', key: 'NgayKetThuc', isDate: true },
    { label: 'Buổi', key: 'Buoi' },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa' },
    { label: 'Sĩ số hiện tại', key: 'SiSoHienTai' },
    {
      label: 'DS học viên',
      key: 'IDTaiKhoan',
      render: (value, row) => (
        <IconButton onClick={() => handleOpenModal('IDTaiKhoan', row)}>
          <ListAltIcon color="primary" />
        </IconButton>
      )
    },
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

  const columnsCanEdit = [
    {
      label: 'Tên chứng chỉ',
      key: 'CertificateID',
      type: 'select',
      options: Certificates.map(cert => ({ value: cert._id, label: cert.TenChungChi }))
    },
    {
      label: 'Lịch học',
      key: 'LichHoc',
      type: 'select',
      options: [
        { value: 'T2 - T4 - T6', label: 'T2 - T4 - T6' },
        { value: 'T3 - T5 - T7', label: 'T3 - T5 - T7' }
      ]
    },
    { label: 'Ngày khai giảng', key: 'NgayKhaiGiang', type: 'date' },
    { label: 'Ngày kết thúc', key: 'NgayKetThuc', type: 'date' },
    {
      label: 'Buổi',
      key: 'Buoi',
      type: 'select',
      options: [
        { value: 'Chiều', label: 'Chiều' },
        { value: 'Tối', label: 'Tối' }
      ]
    },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa', type: 'number' }
  ];

  return (
    <>
      <PageComponent
        columns={columns}
        columnsCanEdit={columnsCanEdit}
        rows={Courses}
        formStates={formStates}
        pageContent={pageContent}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        isEditing={!!EditingCourse}
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        resetForm={resetForm}
        FormName={CourseForm}
      />
      <RelatedDataModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        dataNeeded={currentCourseId}
        modalOptions={modalOptions}
        type={modalType}
        title={modalTitle}
        data={modalData}
        columns={modalColumns}
        onAdd={handleAddRelated}
        onDelete={handleDeleteRelated}
        onUpdateOptions={handleUpdateModalOptions}
      />
    </>
  );
}

export default QLKhoaOn;
