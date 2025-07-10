import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

// Custome
import API from '../../api.jsx'
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import ExamForm from '../../components/Form/ExamForm.jsx'

function QLKyThi() {

  // Hằng lưu nội dung, đường dẫn hàm xử lý
  const routeAddress = 'exam'
  const pageContent = 'kỳ thi'
  const funcAdd = 'them-dot-thi'
  const funcFindAll = 'tat-ca-dot-thi'
  const funcUpdate = 'cap-nhat-dot-thi'
  const funcDelete = 'xoa-dot-thi'

  // Định nghĩa form truyền xuống pageComponent
  const FormName = ExamForm

  // Lưu trữ _id của bản ghi cần chỉnh sửa
  const [EditingExam, SetEditingExam] = useState(null)

  // Khai báo các biến lưu trữ giá tị của các model: cert, exam
  const [certificates, setCertificates] = useState([])
  const [Exams, SetExams] = useState([])

  // Các thuộc tính cho phép chỉnh sửa
  const [CertificateID, SetCertificateID] = useState('')
  const [NgayThi, SetNgayThi] = useState('')
  const [Buoi, SetBuoi] = useState('')
  const [SiSoToiDa, SetSiSoToiDa] = useState('')
  const [SiSoHienTai, SetSiSoHienTai] = useState('')

  const formStates = {
    CertificateID, SetCertificateID,
    NgayThi, SetNgayThi,
    Buoi, SetBuoi,
    SiSoToiDa, SetSiSoToiDa,
    SiSoHienTai
  }

  const fetchCertificates = async () => {
    await API.get('/certificate/tat-ca-chung-chi')
      .then(res => setCertificates(res.data))
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Không thể tải danh sách chứng chỉ',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const fetchExams = async () => {
    await API.get(`/${routeAddress}/${funcFindAll}`)
      .then(res => SetExams(res.data))
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: `Không thể tải danh sách ${ pageContent }`,
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  useEffect(() => {
    fetchExams()
    fetchCertificates()
  }, [])

  const handleDelete = async (id) => {
      await API.delete(`/${routeAddress}/${funcDelete}/${id}`)
      .then(res => {
        fetchExams()
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

  const handleEdit = (row) => {
    SetCertificateID(row.CertificateID?._id || '')
    SetNgayThi(row.NgayThi ? new Date(row.NgayThi).toISOString().slice(0, 10) : '')
    SetBuoi(row.Buoi)
    SetSiSoToiDa(row.SiSoToiDa?.toString() || '')
    SetEditingExam(row._id)
  }

  const handleAdd = () => {
    const newExam = {
      CertificateID,
      NgayThi: new Date(NgayThi),
      Buoi,
      SiSoToiDa: SiSoToiDa ? Number(SiSoToiDa) : undefined
    }

    API.post(`/${routeAddress}/${funcAdd}`, newExam)
      .then(() => {
        fetchExams()
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
      CertificateID,
      NgayThi: new Date(NgayThi),
      Buoi,
      SiSoToiDa: Number(SiSoToiDa) || undefined
    }

    API.put(`/${routeAddress}/${funcUpdate}/${EditingExam}`, updated)
      .then(() => {
        fetchExams()
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
    SetNgayThi('')
    SetBuoi('')
    SetSiSoToiDa('')
    SetEditingExam(null)
  }

  // Hàm tìm chứng chỉ dựa vào id
  const findCert = (CertIDFromExam) => {
    return certificates.find(cert => cert._id === CertIDFromExam._id)
  }

  // Trường dữ liệu hiển thị trên bảng
  const columns = [
    { label: 'Tên khóa thi', key: 'TenKhoaThi' },
    {
      label: 'Tên chứng chỉ',
      key: 'CertificateID',
      render: (value) => {
        const cert = findCert(value)
        return cert ? cert.TenChungChi : ''
      }
    },
    {
      label: 'Loại',
      key: 'CertificateID',
      render: (value) => {
        const cert = findCert(value)
        return cert ? cert.Loai : ''
      }
    },
    {
      label: 'Lệ phí thi',
      key: 'CertificateID',
      render: (value) => {
        const cert = findCert(value)
        return cert ? cert.LePhiThi : ''
      }
    },
    { label: 'Ngày thi', key: 'NgayThi', isDate: true },
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
      label: 'Chọn chứng chỉ', key: 'CertificateID', type: 'select',
      options: certificates.map(cert => ({
        label: cert.TenChungChi,
        value: cert._id
      }))
    },
    { label: 'Ngày thi', key: 'NgayThi', type: 'date' },
    {
      label: 'Buổi', key: 'Buoi', type: 'select',
      options: [
        { value: 'Sáng', label: 'Sáng' },
        { value: 'Chiều', label: 'Chiều' }
      ]
    },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa', type: 'number' }
  ]

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
      FormName={FormName}
    />
  )
}

export default QLKyThi
