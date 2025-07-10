import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

// Custome
import API from '../../api.jsx'
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import CourseForm from '../../components/Form/CourseForm.jsx'

function QLKhoaOn() {

  const routeAddress = 'course'
  const pageContent = 'khóa ôn'
  const funcAdd = 'them-khoa-on'
  const funcFindAll = 'tat-ca-khoa-on'
  const funcUpdate = 'cap-nhat-khoa-on'
  const funcDelete = 'xoa-khoa-on'
  
  // Định nghĩa form truyền xuống pageComponent
  const FormName = CourseForm

  // Lưu trữ _id của bản ghi cần chỉnh sửa
  const [EditingCourse, SetEditingCourse] = useState(null)

  // Khai báo các biến lưu trữ giá trị của các model: course, cert
  const [Courses, SetCourses] = useState([])
  const [Certificates, SetCertificates] = useState([])

  // Các thuộc tính cho phép chỉnh sửa
  const [CertificateID, SetCertificateID] = useState('')
  const [LichHoc, SetLichHoc] = useState('')
  const [NgayKhaiGiang, SetNgayKhaiGiang] = useState('')
  const [NgayKetThuc, SetNgayKetThuc] = useState('')
  const [Buoi, SetBuoi] = useState('')
  const [SiSoToiDa, SetSiSoToiDa] = useState('')
  const [SiSoHienTai, SetSiSoHienTai] = useState('')

  const formStates = {
    CertificateID, SetCertificateID,
    LichHoc, SetLichHoc,
    NgayKhaiGiang, SetNgayKhaiGiang,
    NgayKetThuc, SetNgayKetThuc,
    Buoi, SetBuoi,
    SiSoToiDa, SetSiSoToiDa,
    SiSoHienTai
  }

  const fetchCertificates = () => {
    API.get('/certificate/tat-ca-chung-chi')
      .then(res => SetCertificates(res.data))
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Không thể tải danh sách chứng chỉ',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const fetchCourses = () => {
    API.get(`/${routeAddress}/${funcFindAll}`)
      .then(res => {
        const coursesWForeignData = res.data.map((course) => {
          const id = course.IDChungChi?._id
          const cert = Certificates.find(c => c._id === id)
          return {
            ...course,
            TenChungChi: cert?.TenChungChi || ''
          }
        })
        SetCourses(coursesWForeignData)
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Lỗi khi chỉnh sửa chứng chỉ',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  // Mỗi khi danh sách chứng chỉ thay đổi
  // Kiểm tra xem còn chứng chỉ nào không
  // Nếu còn thì lấy dữ liệu
  useEffect(() => {
    if (Certificates.length > 0) fetchCourses()
  }, [Certificates])

  const handleDelete = async (id) => {
      await API.delete(`/${routeAddress}/${funcDelete}/${id}`)
        .then(res => {
          fetchCourses()
        })
        .catch(() => {
          Swal.fire({
            icon: 'warning',
            title: `Lỗi khi xóa ${ pageContent }`,
            confirmButtonText: 'Đóng',
            confirmButtonColor: '#1976d2'
          })
        })
  }

  // Lưu trữ dữ liệu cần chỉnh sửa
  const handleEdit = (row) => {
    SetCertificateID(row.IDChungChi?._id)
    SetLichHoc(row.LichHoc)
    SetNgayKhaiGiang(new Date(row.NgayKhaiGiang).toISOString().slice(0, 10))
    SetNgayKetThuc(new Date(row.NgayKetThuc).toISOString().slice(0, 10))
    SetBuoi(row.Buoi)
    SetSiSoToiDa(row.SiSoToiDa?.toString())
    SetEditingCourse(row._id)
  }

  const handleAdd = () => {
    const newCourse = {
      IDChungChi: CertificateID,
      LichHoc,
      NgayKhaiGiang: new Date(NgayKhaiGiang),
      NgayKetThuc: new Date(NgayKetThuc),
      Buoi,
      SiSoToiDa: Number(SiSoToiDa) || undefined
    }

    API.post(`/${routeAddress}/${funcAdd}`, newCourse)
      .then(() => {
        fetchCourses()
        resetForm()
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: `Lỗi khi thêm ${ pageContent }`,
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const handleUpdate = () => {
    const updated = {
      IDChungChi: CertificateID,
      LichHoc,
      NgayKhaiGiang: new Date(NgayKhaiGiang),
      NgayKetThuc: new Date(NgayKetThuc),
      Buoi,
      SiSoToiDa: Number(SiSoToiDa) || undefined
    }

    API.put(`/${routeAddress}/${funcUpdate}/${EditingCourse}`, updated)
      .then(() => {
        fetchCourses()
        resetForm()
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: `Lỗi khi chỉnh sửa ${ pageContent }`,
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const resetForm = () => {
    SetCertificateID('')
    SetLichHoc('')
    SetNgayKhaiGiang('')
    SetNgayKetThuc('')
    SetBuoi('')
    SetSiSoToiDa('')
    SetEditingCourse(null)
  }

  // Trường dữ liệu hiển thị trên bảng
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
  ]

  // Trường dữ liệu cho phép chỉnh sửa
  const columnsCanEdit = [
    { 
      label: 'Tên chứng chỉ', key: 'CertificateID', type: 'select',
      options: Certificates.map(cert => ({ value: cert._id, label: cert.TenChungChi }))
    },
    {
      label: 'Lịch học', key: 'LichHoc', type: 'select',
      options: [
        { value: 'T2 - T4 - T6', label: 'T2 - T4 - T6' },
        { value: 'T3 - T5 - T7', label: 'T3 - T5 - T7' }
      ]
    },
    { label: 'Ngày khai giảng', key: 'NgayKhaiGiang', type: 'date' },
    { label: 'Ngày kết thúc', key: 'NgayKetThuc', type: 'date' },
    {
      label: 'Buổi', key: 'Buoi', type: 'select',
      options: [
        { value: 'Sáng', label: 'Sáng' },
        { value: 'Chiều', label: 'Chiều' },
        { value: 'Tối', label: 'Tối' }
      ]
    },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa', type: 'number' }
  ]

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
      FormName={FormName}
    />
  )
}

export default QLKhoaOn