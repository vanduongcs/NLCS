import { useState, useEffect } from 'react'

// Custom
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import CertificateForm from '../../components/Form/CertificateForm.jsx'
import API from '../../api.jsx'

// Extend
import Swal from 'sweetalert2'

function QLChungChi() {

  // Hằng lưu nội dung, đường dẫn hàm xử lý
  const routeAddress = 'certificate'
  const pageContent = 'chứng chỉ'
  const funcAdd = 'them-chung-chi'
  const funcFindAll = 'tat-ca-chung-chi'
  const funcUpdate = 'cap-nhat-chung-chi'
  const funcDelete = 'xoa-chung-chi'
  
  // Định nghĩa form truyền xuống pageComponent
  const FormName = CertificateForm

  // Lưu trữ _id của bản ghi cần chỉnh sửa
  const [editingCertificate, setEditingCertificate] = useState(null)

  // Lưu dữ liệu model lấy được từ backend
  const [certificates, setCertificates] = useState([])

  // Các thuộc tính cho phép chỉnh sửa
  const [TenChungChi, SetTenChungChi] = useState('')
  const [Loai, SetLoai] = useState('')
  const [LePhiThi, SetLePhiThi] = useState('')
  const [HocPhi, SetHocPhi] = useState('')     
  const [ThoiHan, SetThoiHan] = useState('')

  const formStates = {
    TenChungChi, SetTenChungChi,
    Loai, SetLoai,
    LePhiThi, SetLePhiThi,
    HocPhi, SetHocPhi,         
    ThoiHan, SetThoiHan
  }

  const fetchCertificates = () => {
    API.get(`/${routeAddress}/${funcFindAll}`)
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

  useEffect(() => {
    fetchCertificates()
  }, [])

  const handleAdd = async () => {
    const newCertificate = { TenChungChi, Loai, LePhiThi, HocPhi, ThoiHan }

    API.post(`/${routeAddress}/${funcAdd}`, newCertificate)
      .then(() => {
        fetchCertificates()
        resetForm()
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Lỗi khi thêm chứng chỉ',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const handleDelete = async (id) => {
    await API.delete(`/${routeAddress}/${funcDelete}/${id}`)
      .then(() => {
        fetchCertificates()
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Lỗi khi xóa chứng chỉ',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })          
      })
  }

  // Lưu trữ dữ liệu cần chỉnh sửa
  const handleEdit = (row) => {
    setEditingCertificate(row._id) // Lưu _id dòng edit
    SetTenChungChi(row.TenChungChi)
    SetLoai(row.Loai)
    SetLePhiThi(row.LePhiThi)
    SetHocPhi(row.HocPhi)             
    SetThoiHan(row.ThoiHan)
  }

  const handleUpdate = () => {
    const updatedCertificate = { TenChungChi, Loai, LePhiThi,
      HocPhi: Number(HocPhi),            
      ThoiHan: Number(ThoiHan)
    }

    API.put(`/${routeAddress}/${funcUpdate}/${editingCertificate}`, updatedCertificate)
      .then(() => {
        fetchCertificates()
        resetForm()
      })
      .catch(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Lỗi khi cập nhật chứng chỉ',
          confirmButtonText: 'Đóng',
          confirmButtonColor: '#1976d2'
        })
      })
  }

  const resetForm = () => {
    SetTenChungChi('')
    SetLoai('')
    SetLePhiThi('')
    SetHocPhi('')                          
    SetThoiHan('')
    setEditingCertificate(null)
  }

  // Trường dữ liệu hiển thị trên bảng
  const columns = [
    { label: 'Tên chứng chỉ', key: 'TenChungChi' },
    { label: 'Loại', key: 'Loai' },
    { label: 'Lệ phí thi', key: 'LePhiThi' },
    { label: 'Học phí', key: 'HocPhi' },         
    { label: 'Thời hạn', key: 'ThoiHan' },
    { label: 'Thời gian khởi tạo', key: 'createdAt', isDate: true },
    { label: 'Lần sửa cuối', key: 'updatedAt', isDate: true },
    { label: 'Sửa', isAction: 'edit' },
    { label: 'Xóa', isAction: 'delete' }
  ]

  // Trường dữ liệu cho phép chỉnh sửa
  const columnsCanEdit = [
    { label: 'Tên chứng chỉ', key: 'TenChungChi', type: 'text' },
    {
      label: 'Loại', key: 'Loai', type: 'select',
      options: [
        { value: 'Ngoại ngữ', label: 'Ngoại ngữ' },
        { value: 'Tin học', label: 'Tin học' }
      ]
    },
    { label: 'Lệ phí thi', key: 'LePhiThi', type: 'number' },
    { label: 'Học phí', key: 'HocPhi', type: 'number' },    
    { label: 'Thời hạn', key: 'ThoiHan', type: 'number' }
  ]

  return (
    <PageComponent
      columns={ columns }
      columnsCanEdit={ columnsCanEdit }
      rows={ certificates }
      formStates={ formStates }
      pageContent={ pageContent }
      handleAdd={ handleAdd }
      handleEdit={ handleEdit }
      isEditing={ !!editingCertificate }
      handleUpdate={ handleUpdate }
      handleDelete={ handleDelete }
      resetForm={ resetForm }
      FormName={ FormName }
    />
  )
}

export default QLChungChi
