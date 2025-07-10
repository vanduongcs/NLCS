import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

// Custom
import API from '../../api.jsx'
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import AccountForm from '../../components/Form/AccountForm.jsx'

function QLNguoiDung() {

  // Hằng lưu nội dung, đường dẫn hàm xử lý
  const routeAddress = 'account'
  const pageContent = 'tài khoản'
  const funcAdd = 'dang-ky'
  const funcFindAll = 'tat-ca-tai-khoan'
  const funcUpdate = 'cap-nhat-tai-khoan'
  const funcDelete = 'xoa-tai-khoan'
  
  // Định nghĩa form truyền xuống pageComponent
  const FormName = AccountForm

  // Lưu trữ _id, TenTaiKhoan (update) của bản ghi cần chỉnh sửa
  const [editingAccount, setEditingAccount] = useState(null)

  // Khai báo các biến lưu trữ giá trị của các model:
  const [courses, setCourses] = useState([])
  const [exams, setExams] = useState([])
  const [certificates, setCertificates] = useState([])
  const [results, setResults] = useState([])

  // Các thuộc tính cho phép chỉnh sửa
  const [TenHienThi, SetTenHienThi] = useState('')
  const [TenTaiKhoan, SetTenTaiKhoan] = useState('')
  const [Loai, SetLoai] = useState('')
  const [MatKhau, SetMatKhau] = useState('')
  const [KhoaHocDaThamGia, SetKhoaHocDaThamGia] = useState([])
  const [KhoaThiThamGia, SetKhoaThiThamGia] = useState([])
  const [ChungChiDaNhan, SetChungChiDaNhan] = useState([])

  // Dùng để truy xuất mảng dữ liệu đã lưu trước khi sửa đổi
  const [oldGetCerts, setOldGetCerts] = useState([])
  const [oldGetExams, setOldGetExams] = useState([])
  const [oldGetCourses, setOldGetCourses] = useState([])
  const [Accounts, SetAccounts] = useState([])

  const formStates = {
    TenHienThi, SetTenHienThi,
    TenTaiKhoan, SetTenTaiKhoan,
    Loai, SetLoai,
    MatKhau, SetMatKhau,
    KhoaHocDaThamGia, SetKhoaHocDaThamGia,
    KhoaThiThamGia, SetKhoaThiThamGia,
    ChungChiDaNhan, SetChungChiDaNhan
  }


  const fetchAccounts = () => {
    API.get(`/${routeAddress}/${funcFindAll}`)
      .then(res => SetAccounts(res.data))
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Không thể tải danh sách tài khoản',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const fetchCourses = () => {
    API.get(`/course/tat-ca-khoa-on`)
      .then(res => setCourses(res.data))
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Không thể tải danh sách khóa học',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const fetchExams = () => {
    API.get(`/exam/tat-ca-dot-thi`)
      .then(res => setExams(res.data))
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Không thể tải danh sách đợt thi',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const fetchCertificates = () => {
    API.get(`/certificate/tat-ca-chung-chi`)
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

  const fetchResults = () => {
    API.get('/result/tat-ca-ket-qua')
      .then(res => setResults(res.data))
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Không thể tải danh sách kết quả',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  useEffect(() => {
    fetchAccounts()
    fetchCourses()
    fetchExams()
    fetchResults()
    fetchCertificates()
  }, [])

  const handleAdd = async () => {
    const newAccount = { 
      TenHienThi, TenTaiKhoan, MatKhau,
      Loai,
      // KhoaHocDaThamGia, KhoaThiThamGia, ChungChiDaNhan
    }
    await API.post(`/${routeAddress}/${funcAdd}`, newAccount)
      .then(() => {
        fetchAccounts()
        resetForm()
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: `Lỗi khi đăng ký ${ pageContent }`,
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const handleDelete = async (id) => {
      await API.delete(`/${routeAddress}/${funcDelete}/${id}`)
      .then(() => {
        fetchAccounts()
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

  const handleEdit = (row) => {
    SetTenHienThi(row.TenHienThi)
    SetTenTaiKhoan(row.TenTaiKhoan)
    SetMatKhau(row.MatKhau)
    SetLoai(row.Loai)
    SetKhoaHocDaThamGia(row.KhoaHocDaThamGia || [])
    SetKhoaThiThamGia(row.KhoaThiThamGia || [])
    SetChungChiDaNhan(row.ChungChiDaNhan || [])
    setOldGetCerts(row.ChungChiDaNhan || [])
    setOldGetExams(row.KhoaThiThamGia || [])
    setOldGetCourses(row.KhoaHocDaThamGia || [])
    setEditingAccount({ _id: row._id, TenTaiKhoan: row.TenTaiKhoan })
  }

  const handleUpdate = async () => {
    const updatedAccount = {
      TenHienThi, TenTaiKhoan, MatKhau,
      Loai, 
      KhoaHocDaThamGia, KhoaThiThamGia, ChungChiDaNhan,
      DSChungChiDaNhan: oldGetCerts,
      DSKhoaHocDaThamGia: oldGetCourses,
      DSKhoaThiThamGia: oldGetExams
    }

    await API.put(`/${routeAddress}/${funcUpdate}/${editingAccount.TenTaiKhoan}`, updatedAccount)
      .then(() => {
        fetchAccounts()
        fetchResults()
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
    SetTenHienThi('')
    SetTenTaiKhoan('')
    SetLoai('')
    SetMatKhau('')
    SetKhoaHocDaThamGia([])
    SetKhoaThiThamGia([])
    SetChungChiDaNhan([])
    setEditingAccount(null)
    setOldGetCerts([])
    setOldGetCourses([])
    setOldGetExams([])
  }

  // Trường dữ liệu hiển thị trên bảng
  const columns = [
    { label: 'Tên', key: 'TenHienThi' },
    { label: 'Tài khoản', key: 'TenTaiKhoan' },
    { label: 'Vai trò', key: 'Loai' },
    { label: 'Mật khẩu', key: 'MatKhau' },
    {
      label: 'Khóa học đã từng tham gia', key: 'KhoaHocDaThamGia',
      render: (value, row) => {
        if (!Array.isArray(row.KhoaHocDaThamGia)) return ''
        // Duyệt qua từng phần tử (id) trong mảng khóa học đã tham gia
        // Tìm phần tử có _id = id
        // Nếu có -> return tên khóa học
        const names = row.KhoaHocDaThamGia.map(id => {
          const course = courses.find(c => String(c._id) === String(id))
          return course ? course.TenKhoaHoc : undefined
        })

        // Loại bỏ tất cả phần tử rỗng, nối nhau bằng dấu phẩy
        return names.filter(name => name).join(', ') || undefined
      }
    },
    {
      label: 'Khóa thi',
      key: 'KhoaThiThamGia',
      render: (value, row) => {
        if (!Array.isArray(row.KhoaThiThamGia)) return ''
        // Duyệt qua từng phần tử (id) trong mảng khóa thi
        // Tìm phần tử có _id = id
        // Nếu có -> return tên khóa thi
        const names = row.KhoaThiThamGia.map(id => {
          const exam = exams.find(e => String(e._id) === String(id))
          return exam ? exam.TenKhoaThi : ''
        })
        // Loại bỏ tất cả phần tử rỗng, nối nhau bằng dấu phẩy
        return names.filter(name => name).join(', ') || ''
      }
    },
    {
      label: 'Chứng chỉ',
      key: 'ChungChiDaNhan',
      render: (value, row) => {
        if (!Array.isArray(row.ChungChiDaNhan)) return ''
        // Duyệt qua từng phần tử (id) trong mảng chứng chỉ đã nhận
        // Tìm phần tử có _id = id
        // Nếu có -> return tên chứng chỉ
        const names = row.ChungChiDaNhan.map(id => {
          const certificate = certificates.find(c => String(c._id) === String(id))
          return certificate ? certificate.TenChungChi || '' : ''
        })
        // Loại bỏ tất cả phần tử rỗng, nối nhau bằng dấu phẩy
        return names.filter(name => name).join(', ') || ''
      }
    },
    { label: 'Ngày tạo', key: 'createdAt', isDate: true },
    { label: 'Cập nhật', key: 'updatedAt', isDate: true },
    { label: 'Sửa', key: 'editButton', isAction: 'edit' },
    { label: 'Xóa', key: 'deleteButton', isAction: 'delete' }
  ]

  // Trường dữ liệu cho phép chỉnh sửa
  const columnsCanEdit = [
    { key: 'TenHienThi', label: 'Tên người dùng', type: 'text' },
    { key: 'TenTaiKhoan', label: 'Tên tài khoản', type: 'text' },
    {
      key: 'Loai', label: 'Vai trò', type: 'select',
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
      ]
    },
    { key: 'MatKhau', label: 'Mật khẩu', type: 'text' },
    {
      label: 'Khóa học đã từng tham gia', key: 'KhoaHocDaThamGia', type: 'select', multiple: true,
      options: courses.map(course => ({
        value: course._id || '',
        label: course.TenKhoaHoc || ''
      }))
    },
    {
      label: 'Khóa thi tham gia', key: 'KhoaThiThamGia', type: 'select', multiple: true,
      options: exams.map(exam => ({
        value: exam._id,
        label: exam.TenKhoaThi || ''
      }))
    },
    {
      label: 'Chứng chỉ đã nhận', key: 'ChungChiDaNhan', type: 'select', multiple: true,
      options: results
        .filter(r => r.IDNguoiDung === editingAccount?._id && (r.TrangThai === 'Chưa lấy' || r.TrangThai === 'Đã lấy'))
        .map(r => {
          const cert = certificates.find(c => c._id === r.IDChungChi)
          return cert ? { value: cert._id, label: cert.TenChungChi } : null
        })
        .filter(Boolean)
    }
  ]

  return (
    <PageComponent
      columns={columns}
      columnsCanEdit={columnsCanEdit}
      rows={Accounts}
      formStates={formStates}
      pageContent={pageContent}
      handleAdd={handleAdd}
      handleEdit={handleEdit}
      isEditing={!!editingAccount}
      handleUpdate={handleUpdate}
      handleDelete={handleDelete}
      resetForm={resetForm}
      FormName={FormName}
    />
  )
}

export default QLNguoiDung