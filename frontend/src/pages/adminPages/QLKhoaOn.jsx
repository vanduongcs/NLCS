import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import API from '../../api.jsx';
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx';
import CourseForm from '../../components/Form/CourseForm.jsx';

function QLKhoaOn() {
  // Constants
  const routeAddress = 'course';
  const pageContent = 'khóa ôn';
  const funcAdd = 'them-khoa-on';
  const funcFindAll = 'tat-ca-khoa-on';
  const funcUpdate = 'cap-nhat-khoa-on';
  const funcDelete = 'xoa-khoa-on';

  // State
  const [EditingCourse, SetEditingCourse] = useState(null);
  const [Courses, SetCourses] = useState([]);
  const [Certificates, SetCertificates] = useState([]);

  const [CertificateID, SetCertificateID] = useState('');
  const [LichHoc, SetLichHoc] = useState('');
  const [NgayKhaiGiang, SetNgayKhaiGiang] = useState('');
  const [NgayKetThuc, SetNgayKetThuc] = useState('');
  const [Buoi, SetBuoi] = useState('');
  const [SiSoToiDa, SetSiSoToiDa] = useState('');
  const [SiSoHienTai, SetSiSoHienTai] = useState('');

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
  const showError = (title) => {
    Swal.fire({
      icon: 'warning',
      title,
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

  // API functions
  const fetchCertificates = async () => {
    try {
      const res = await API.get('/certificate/tat-ca-chung-chi');
      SetCertificates(res.data);
    } catch (error) {
      showError('Không thể tải danh sách chứng chỉ');
    }
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
      const [certificatesRes, coursesRes] = await Promise.all([
        API.get('/certificate/tat-ca-chung-chi'),
        API.get(`/${routeAddress}/${funcFindAll}`)
      ]);

      SetCertificates(certificatesRes.data);
      
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

  // Event handlers
  const handleAdd = async () => {
    try {
      await API.post(`/${routeAddress}/${funcAdd}`, createCourseData());
      await fetchCourses();
      resetForm();
    } catch (error) {
      showError(`Lỗi khi thêm ${pageContent}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/${routeAddress}/${funcDelete}/${id}`);
      await fetchCourses();
    } catch (error) {
      showError(`Lỗi khi xóa ${pageContent}`);
    }
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
    } catch (error) {
      showError(`Lỗi khi chỉnh sửa ${pageContent}`);
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
    { label: 'Thời gian khởi tạo', key: 'createdAt', isDate: true },
    { label: 'Lần sửa cuối', key: 'updatedAt', isDate: true },
    { label: 'Sửa', key: 'editButton', isAction: 'edit' },
    { label: 'Xóa', key: 'deleteButton', isAction: 'delete' }
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
  );
}

export default QLKhoaOn;
