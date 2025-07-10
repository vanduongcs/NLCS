import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

// Custome
import API from '../../api.jsx'
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import ResultForm from '../../components/Form/ResultForm.jsx'

function QLKetQua() {

  // Hằng lưu nội dung, đường dẫn hàm xử lý
  const routeAddress = 'result'
  const pageContent = 'kết quả'
  const funcAdd = 'them-ket-qua'
  const funcFindAll = 'tat-ca-ket-qua'
  const funcUpdate = 'cap-nhat-ket-qua'
  const funcDelete = 'xoa-ket-qua'

  // Định nghĩa form truyền xuống pageComponent
  const FormName = ResultForm

  // Lưu trữ _id của bản ghi cần chỉnh sửa
  const [editingResult, setEditingResult] = useState(null)

  // Khai báo các biến lưu trữ giá trị của các model: result, account, cert
  const [results, setResults] = useState([])
  const [accounts, setAccounts] = useState([])
  const [certificates, setCertificates] = useState([])

  // Các thuộc tính cho phép chỉnh sửa
  const [TenHienThi, SetTenHienThi] = useState('')
  const [IDChungChi, SetIDChungChi] = useState('')
  const [Diem1, SetDiem1] = useState('')
  const [Diem2, SetDiem2] = useState('')
  const [Diem3, SetDiem3] = useState('')
  const [Diem4, SetDiem4] = useState('')
  const [NgayCap, SetNgayCap] = useState('')
  const [TrangThai, SetTrangThai] = useState('')

  const formStates = {
    TenHienThi, SetTenHienThi,
    IDChungChi, SetIDChungChi,
    Diem1, SetDiem1,
    Diem2, SetDiem2,
    Diem3, SetDiem3,
    Diem4, SetDiem4,
    NgayCap, SetNgayCap,
    TrangThai, SetTrangThai
  }

  const fetchAccounts = () => {
    API.get('/account/tat-ca-tai-khoan')
      .then(res => {
        setAccounts(res.data)
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Không thể tải danh sách tài khoản',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const fetchCertificates = () => {
    API.get('/certificate/tat-ca-chung-chi')
      .then(res => {
        setCertificates(res.data)
      })
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
    API.get(`/${routeAddress}/${funcFindAll}`)
      .then(res => {
        setResults(res.data)
      })
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
    fetchCertificates()
    fetchResults()
  }, [])

  const handleAdd = () => {
    const account = accounts.find(acc => acc.TenHienThi === TenHienThi.trim())
    if (!account) {
      Swal.fire('Lỗi', 'Không tìm thấy người dùng với tên hiển thị này', 'error')
      return
    }

    const ngayHetHanComputed = computeNgayHetHan(IDChungChi, NgayCap)

    const newResult = {
      IDNguoiDung: account._id,
      IDChungChi,
      Diem1: Number(Diem1),
      Diem2: Number(Diem2),
      Diem3: Diem3 ? Number(Diem3) : undefined,
      Diem4: Diem4 ? Number(Diem4) : undefined,
      NgayCap: new Date(NgayCap),
      NgayHetHan: ngayHetHanComputed,
      TrangThai: TrangThai || 'Chưa lấy'
    }
    API.post(`/${routeAddress}/${funcAdd}`, newResult)
      .then(() => {
        fetchResults()
        resetForm()
      })
      .catch(err => console.error('Lỗi thêm kết quả:', err.response?.data || err.message))
  }

  const handleDelete = async (id) => {
      await API.delete(`/${routeAddress}/${funcDelete}/${id}`)
      .then(res => {
        fetchResults()
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Không thể tải danh sách kết quả',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const computeNgayHetHan = (certificateId, ngayCapStr) => {
    // Lấy dữ liệu chứng chỉ
    const cert = certificates.find(c => c._id === certificateId)
    if (!cert) return undefined

    const thoiHan = cert.ThoiHan
    if (thoiHan === '' || thoiHan === undefined || thoiHan === null || thoiHan === 0) return undefined

    // Chuyển kiểu dữ liệu từ string sang Date
    const ngayCap = new Date(ngayCapStr)

    // Thử ép kiểu thoiHan và tính dựa trên ngayCap và ThoiHan
    const parsed = parseInt(thoiHan)
    if (!isNaN(parsed)) {
      const ngayHetHan = new Date(ngayCap)
      ngayHetHan.setFullYear(ngayCap.getFullYear() + parsed)
      return ngayHetHan
    } else {
      // Nếu không ép kiểu được thì return thoiHan
      return undefined
    }
  }

  // Lưu trữ dữ liệu cần chỉnh sửa
  const handleEdit = (row) => {
    setEditingResult(row._id) // lưu _id dòng edit
    const account = accounts.find(acc => String(acc._id) === String(row.IDNguoiDung))
    SetTenHienThi(account.TenHienThi)
    SetIDChungChi(row.IDChungChi)
    SetDiem1(row.Diem1.toString())
    SetDiem2(row.Diem2.toString())
    SetDiem3(row.Diem3.toString())
    SetDiem4(row.Diem4.toString())
    SetNgayCap(new Date(row.NgayCap).toISOString().slice(0, 10))
    SetTrangThai(row.TrangThai)
  }

  const handleUpdate = () => {
    const account = accounts.find(acc => acc.TenHienThi.toLowerCase() === TenHienThi.trim().toLowerCase())
    if (!account) {
      Swal.fire({
          icon: 'warning',
          title: 'Không tìm thấy tài khoản',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      return
    }

    const ngayHetHanComputed = computeNgayHetHan(IDChungChi, NgayCap)

    const updatedResult = {
      IDNguoiDung: account._id,
      IDChungChi,
      Diem1: Number(Diem1),
      Diem2: Number(Diem2),
      Diem3: Diem3 ? Number(Diem3) : undefined,
      Diem4: Diem4 ? Number(Diem4) : undefined,
      NgayCap: new Date(NgayCap),
      NgayHetHan: ngayHetHanComputed,
      TrangThai: TrangThai || 'Chưa lấy'
    }
    API.put(`/${routeAddress}/${funcUpdate}/${editingResult}`, updatedResult)
      .then(() => {
        fetchResults()
        resetForm()
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Lỗi khi chỉnh sửa kết quả',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const resetForm = () => {
    SetTenHienThi('')
    SetIDChungChi('')
    SetDiem1('')
    SetDiem2('')
    SetDiem3('')
    SetDiem4('')
    SetNgayCap('')
    SetTrangThai('')
    setEditingResult(null)
  }

  // Trường dữ liệu hiển thị trên bảng
  const columns = [
    {
      label: 'Người dùng',
      key: 'IDNguoiDung',
      render: (value, row) => {
        const account = accounts.find(acc => String(acc._id) === String(row.IDNguoiDung))
        return account ? account.TenHienThi : ''
      }
    },
    {
      label: 'Chứng chỉ',
      key: 'IDChungChi',
      render: (value, row) => {
        const cert = certificates.find(cert => String(cert._id) === String(row.IDChungChi))
        return cert ? cert.TenChungChi : ''
      }
    },
    { label: 'Điểm 1', key: 'Diem1' },
    { label: 'Điểm 2', key: 'Diem2' },
    { label: 'Điểm 3', key: 'Diem3' },
    { label: 'Điểm 4', key: 'Diem4' },
    { label: 'Điểm tổng kết', key: 'DiemTK' },
    { label: 'Ngày cấp', key: 'NgayCap', isDate: true },
    { label: 'Ngày hết hạn', key: 'NgayHetHan', isDate: true },
    { label: 'Trạng thái', key: 'TrangThai' },
    { label: 'Thời gian khởi tạo', key: 'createdAt', isDate: true },
    { label: 'Lần sửa cuối', key: 'updatedAt', isDate: true },
    { label: 'Sửa', key: 'editButton', isAction: 'edit' },
    { label: 'Xóa', key: 'deleteButton', isAction: 'delete' }
  ]

  // Trường dữ liệu cho phép chỉnh sửa
  const columnsCanEdit = [
    { label: 'Người dùng', key: 'TenHienThi', type: 'text' },
    { label: 'Chứng chỉ', key: 'IDChungChi', type: 'select',
      options: certificates.map(cert => ({
        value: cert._id,
        label: cert.TenChungChi
      }))
    },
    { label: 'Điểm 1', key: 'Diem1', type: 'number' },
    { label: 'Điểm 2', key: 'Diem2', type: 'number' },
    { label: 'Điểm 3', key: 'Diem3', type: 'number' },
    { label: 'Điểm 4', key: 'Diem4', type: 'number' },
    { label: 'Ngày cấp', key: 'NgayCap', type: 'date' },
    { label: 'Trạng thái', key: 'TrangThai', type: 'select',
      options: [
        { value: 'Chưa lấy', label: 'Chưa lấy' },
        { value: 'Đã lấy', label: 'Đã lấy' }
      ]
    }
  ]

  return (
    <PageComponent
      columns={ columns }
      columnsCanEdit={ columnsCanEdit }
      rows={ results }
      formStates={ formStates }
      pageContent={ pageContent }
      handleAdd={ handleAdd }
      handleEdit={ handleEdit }
      isEditing={ !!editingResult }
      handleUpdate={ handleUpdate }
      handleDelete={ handleDelete }
      resetForm={ resetForm }
      FormName={ FormName }
    />
  )
}

export default QLKetQua