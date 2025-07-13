import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

// Custom
import API from '../../api.jsx'
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import AccountForm from '../../components/Form/AccountForm.jsx'

function QLNguoiDung() {
  const routeAddress = 'account'
  const pageContent = 'tài khoản'
  const funcAdd = 'dang-ky'
  const funcFindAll = 'tat-ca-tai-khoan'
  const funcUpdate = 'cap-nhat-tai-khoan'
  const funcDelete = 'xoa-tai-khoan'

  const FormName = AccountForm

  const [editingAccount, setEditingAccount] = useState(null)

  const [courses, setCourses] = useState([])
  const [exams, setExams] = useState([])
  const [certificates, setCertificates] = useState([])
  const [Accounts, SetAccounts] = useState([])

  const [TenHienThi, SetTenHienThi] = useState('')
  const [TenTaiKhoan, SetTenTaiKhoan] = useState('')
  const [Loai, SetLoai] = useState('')
  const [MatKhau, SetMatKhau] = useState('')
  const [KhoaHocDaThamGia, SetKhoaHocDaThamGia] = useState([])
  const [KhoaThiThamGia, SetKhoaThiThamGia] = useState([])

  const [oldGetExams, setOldGetExams] = useState([])
  const [oldGetCourses, setOldGetCourses] = useState([])

  const formStates = {
    TenHienThi, SetTenHienThi,
    TenTaiKhoan, SetTenTaiKhoan,
    Loai, SetLoai,
    MatKhau, SetMatKhau,
    KhoaHocDaThamGia, SetKhoaHocDaThamGia,
    KhoaThiThamGia, SetKhoaThiThamGia
  }

  const fetchAccounts = () => {
    API.get(`/${routeAddress}/${funcFindAll}`)
      .then(res => SetAccounts(res.data))
  }

  const fetchCourses = () => {
    API.get(`/course/tat-ca-khoa-on`).then(res => setCourses(res.data))
  }

  const fetchExams = () => {
    API.get(`/exam/tat-ca-dot-thi`).then(res => setExams(res.data))
  }

  const fetchCertificates = () => {
    API.get(`/certificate/tat-ca-chung-chi`).then(res => setCertificates(res.data))
  }

  useEffect(() => {
    fetchAccounts()
    fetchCourses()
    fetchExams()
    fetchCertificates()
  }, [])

  const handleEdit = (row) => {
    SetTenHienThi(row.TenHienThi)
    SetTenTaiKhoan(row.TenTaiKhoan)
    SetMatKhau(row.MatKhau)
    SetLoai(row.Loai)
    SetKhoaHocDaThamGia(row.KhoaHocDaThamGia || [])
    SetKhoaThiThamGia(row.KhoaThiThamGia || [])
    setOldGetExams(row.KhoaThiThamGia || [])
    setOldGetCourses(row.KhoaHocDaThamGia || [])
    setEditingAccount({ _id: row._id, TenTaiKhoan: row.TenTaiKhoan })
  }

  const columns = [
    { label: 'Tên', key: 'TenHienThi' },
    { label: 'Tài khoản', key: 'TenTaiKhoan' },
    { label: 'Vai trò', key: 'Loai' },
    { label: 'Mật khẩu', key: 'MatKhau' },
    {
      label: 'Khóa học đã tham gia', key: 'KhoaHocDaThamGia',
      render: (value, row) => {
        const names = row.KhoaHocDaThamGia?.map(id => {
          const course = courses.find(c => String(c._id) === String(id))
          return course?.TenKhoaHoc
        }) || []
        return names.filter(Boolean).join(', ')
      }
    },
    {
      label: 'Kỳ thi đã tham gia', key: 'KhoaThiThamGia',
      render: (value, row) => {
        const names = row.KhoaThiThamGia?.map(id => {
          const exam = exams.find(e => String(e._id) === String(id))
          return exam?.TenKyThi
        }) || []
        return names.filter(Boolean).join(', ')
      }
    },
    {
      label: 'Chứng chỉ đã nhận', key: 'ChungChiDaNhan',
      render: (value, row) => {
        const names = row.ChungChiDaNhan?.map(id => {
          const cert = certificates.find(c => String(c._id) === String(id))
          return cert?.TenChungChi
        }) || []
        return names.filter(Boolean).join(', ')
      }
    },
    { label: 'Ngày tạo', key: 'createdAt', isDate: true },
    { label: 'Cập nhật', key: 'updatedAt', isDate: true },
    { label: 'Sửa', key: 'editButton', isAction: 'edit' },
    { label: 'Xóa', key: 'deleteButton', isAction: 'delete' }
  ]

  const columnsCanEdit = [
    { key: 'TenHienThi', label: 'Tên người dùng', type: 'text' },
    { key: 'TenTaiKhoan', label: 'Tên tài khoản', type: 'text' },
    { key: 'Loai', label: 'Vai trò', type: 'select', options: [ { value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' } ] },
    { key: 'MatKhau', label: 'Mật khẩu', type: 'text' },
    {
      label: 'Khóa học đã tham gia', key: 'KhoaHocDaThamGia', type: 'select', multiple: true,
      options: courses.map(c => ({ value: c._id, label: c.TenKhoaHoc }))
    },
    {
      label: 'Kỳ thi đã tham gia', key: 'KhoaThiThamGia', type: 'select', multiple: true,
      options: exams.map(e => ({ value: e._id, label: e.TenKyThi }))
    }
  ]

  const handleUpdate = async () => {
    const updatedAccount = {
      TenHienThi, TenTaiKhoan, MatKhau, Loai,
      KhoaHocDaThamGia, KhoaThiThamGia,
      DSKhoaHocDaThamGia: oldGetCourses,
      DSKhoaThiThamGia: oldGetExams
    }

    await API.put(`/${routeAddress}/${funcUpdate}/${editingAccount.TenTaiKhoan}`, updatedAccount)
      .then(() => {
        fetchAccounts()
        resetForm()
      })
  }

  const resetForm = () => {
    SetTenHienThi('')
    SetTenTaiKhoan('')
    SetLoai('')
    SetMatKhau('')
    SetKhoaHocDaThamGia([])
    SetKhoaThiThamGia([])
    setEditingAccount(null)
    setOldGetCourses([])
    setOldGetExams([])
  }

  return (
    <PageComponent
      columns={columns}
      columnsCanEdit={columnsCanEdit}
      rows={Accounts}
      formStates={formStates}
      pageContent={pageContent}
      handleAdd={() => {}}
      handleEdit={handleEdit}
      isEditing={!!editingAccount}
      handleUpdate={handleUpdate}
      handleDelete={() => {}}
      resetForm={resetForm}
      FormName={FormName}
    />
  )
}

export default QLNguoiDung