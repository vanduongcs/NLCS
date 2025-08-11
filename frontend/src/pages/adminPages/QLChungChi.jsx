import { useState, useEffect } from 'react'
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import CertificateForm from '../../components/Form/CertificateForm.jsx'
import ImportExcel from '../../components/ImportExcel/ImportExcel.jsx'
import HistoryIcon from '@mui/icons-material/History'
import IconButton from '@mui/material/IconButton'
import API from '../../api.jsx'
import Swal from 'sweetalert2'

import fetchCollectionHistory from '../../components/fetchCollectionHistory/fetchCollectionHistory.js'
import RelatedDataModal from '../../components/Modal/RelatedDataModal.jsx'

function QLChungChi() {
  // Constants
  const routeAddress = 'certificate'
  const pageContent = 'chứng chỉ'
  const funcAdd = 'them-chung-chi'
  const funcFindAll = 'tat-ca-chung-chi'
  const funcUpdate = 'cap-nhat-chung-chi'
  const funcDelete = 'xoa-chung-chi'
  const historyAddress = 'certificateHistory'

  // State
  const [editingCertificate, setEditingCertificate] = useState(null)

  const [certificates, setCertificates] = useState([])

  const [TenChungChi, SetTenChungChi] = useState('')
  const [Loai, SetLoai] = useState('')
  const [LePhiThi, SetLePhiThi] = useState('')
  const [HocPhi, SetHocPhi] = useState('')
  const [ThoiHan, SetThoiHan] = useState('')
  const [DiemToiThieu, SetDiemToiThieu] = useState('')
  const [DiemToiDa, SetDiemToiDa] = useState('')
  const [CachTinhDiem, SetCachTinhDiem] = useState('Trung bình')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalData, setModalData] = useState([])
  const [modalColumns, setModalColumns] = useState([])

  // State cho ImportExcel
  const [importExcelOpen, setImportExcelOpen] = useState(false)

  const formStates = {
    Loai, SetLoai,
    TenChungChi, SetTenChungChi,
    LePhiThi, SetLePhiThi,
    HocPhi, SetHocPhi,
    ThoiHan, SetThoiHan,
    DiemToiThieu, SetDiemToiThieu,
    DiemToiDa, SetDiemToiDa,
    CachTinhDiem, SetCachTinhDiem
  }

  const createCertificateData = () => ({
    TenChungChi,
    Loai,
    LePhiThi: Number(LePhiThi),
    HocPhi: Number(HocPhi),
    ThoiHan: Number(ThoiHan),
    DiemToiThieu: Number(DiemToiThieu),
    DiemToiDa: Number(DiemToiDa),
    CachTinhDiem
  })

  const resetForm = () => {
    SetTenChungChi('')
    SetDiemToiThieu('')
    SetDiemToiDa('')
    SetCachTinhDiem('Trung bình')
    setEditingCertificate(null)
  }

  // API functions
  const fetchCertificates = () => {
    API.get(`/${routeAddress}/${funcFindAll}`)
      .then(res => setCertificates(res.data))
      .catch(() => showError('Không thể tải danh sách chứng chỉ'))
  }

  const handleOpenModal = (type, row) => {
    if (type === 'LichSu') {
      setModalTitle('Lịch sử thay đổi')
      setModalColumns([
        { key: 'KieuThayDoi', label: 'Loại thay đổi' },
        { key: 'ThoiGian', label: 'Thời gian', render: (value) => new Date(value).toLocaleString('vi-VN') },
        { key: 'TruongDLThayDoi', label: 'Trường dữ liệu' },
        { key: 'DLTruoc', label: 'Giá trị trước' },
        { key: 'DLSau', label: 'Giá trị sau' }
      ])
      fetchCollectionHistory({
        apiPath: '/certificateHistory/tim-lich-su-chung-chi',
        id: row._id,
        getFieldDisplayName,
        formatHistoryValue,
        setModalData
      })
      setModalOpen(true)
    }
  }

  const handleAdd = async () => {
    try {
      await API.post(`/${routeAddress}/${funcAdd}`, createCertificateData())
      fetchCertificates()
      resetForm()
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể thêm chứng chỉ')
    }
  }

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: 'Bạn có chắc muốn xóa chứng chỉ này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/${routeAddress}/${funcDelete}/${id}`)
          fetchCertificates()
        } catch (error) {
          showError(error.response?.data?.message || 'Không thể xóa chứng chỉ')
        }
      }
    })
  }

  const handleEdit = (row) => {
    setEditingCertificate(row._id)
    SetTenChungChi(row.TenChungChi)
    SetLoai(row.Loai)
    SetLePhiThi(row.LePhiThi)
    SetHocPhi(row.HocPhi)
    SetThoiHan(row.ThoiHan)
    SetDiemToiThieu(row.DiemToiThieu)
    SetDiemToiDa(row.DiemToiDa)
    SetCachTinhDiem(row.CachTinhDiem || 'Trung bình')
  }

  const handleUpdate = async () => {
    try {
      await API.put(`/${routeAddress}/${funcUpdate}/${editingCertificate}`, createCertificateData())
      fetchCertificates()
      resetForm()
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể cập nhật chứng chỉ')
    }
  }

  // Hàm xử lý Import Excel
  const handleImportExcel = async (data) => {
    try {
      const importPromises = data.map(async (row) => {
        const certificateData = {
          Loai: row.Loai || 'Ngoại ngữ',
          TenChungChi: row.TenChungChi || '',
          LePhiThi: row.LePhiThi ? Number(row.LePhiThi) : 0,
          HocPhi: row.HocPhi ? Number(row.HocPhi) : 0,
          ThoiHan: row.ThoiHan ? Number(row.ThoiHan) : 0,
          DiemToiThieu: row.DiemToiThieu ? Number(row.DiemToiThieu) : 0,
          DiemToiDa: row.DiemToiDa ? Number(row.DiemToiDa) : 10,
          CachTinhDiem: row.CachTinhDiem || 'Trung bình'
        }

        return API.post(`/${routeAddress}/${funcAdd}`, certificateData)
      })

      await Promise.all(importPromises)
      
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: `Đã nhập thành công ${data.length} chứng chỉ`,
        confirmButtonColor: '#1976d2'
      })
      
      fetchCertificates()
    } catch (error) {
      console.error('Lỗi nhập dữ liệu:', error)
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.response?.data?.message || 'Có lỗi xảy ra khi nhập dữ liệu',
        confirmButtonColor: '#1976d2'
      })
    }
  }

  const handleOpenImportExcel = () => {
    setImportExcelOpen(true)
  }

  // Hàm showError có thể được cập nhật để linh hoạt hơn
  const showError = (message) => {
    Swal.fire({
      icon: 'warning',
      title: 'Thông báo',
      text: message,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    })
  }

  // Hàm chuyển tên trường dữ liệu sang tiếng Việt
  const getFieldDisplayName = (field) => {
    const fieldNames = {
      'TenChungChi': 'Tên chứng chỉ',
      'Loai': 'Loại',
      'LePhiThi': 'Lệ phí thi',
      'HocPhi': 'Học phí',
      'ThoiHan': 'Thời hạn',
      'DiemToiThieu': 'Điểm tối thiểu',
      'DiemToiDa': 'Điểm tối đa',
      'CachTinhDiem': 'Cách tính điểm'
    }
    return fieldNames[field] || field
  }

  // Hàm format giá trị lịch sử
  const formatHistoryValue = (value, fieldName) => {
    if (value === null || value === undefined) return '___'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  // Table configuration
  const columns = [
    { label: 'Loại', key: 'Loai' },
    { label: 'Tên chứng chỉ', key: 'TenChungChi' },
    { label: 'Lệ phí thi', align: 'center', key: 'LePhiThi' },
    { label: 'Học phí', align: 'center', key: 'HocPhi' },
    { label: 'Thời hạn', align: 'center', key: 'ThoiHan' },
    { label: 'Điểm tối thiểu', align: 'center', key: 'DiemToiThieu' },
    { label: 'Điểm tối đa', align: 'center', key: 'DiemToiDa' },
    { label: 'Cách tính điểm', align: 'center', key: 'CachTinhDiem' },
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
    { label: 'Sửa', align: 'center', isAction: 'edit' },
    { label: 'Xóa', align: 'center', isAction: 'delete' }
  ]

  const columnsCanEdit = [
    {
      label: 'Loại', key: 'Loai', type: 'select',
      options: [
        { value: 'Ngoại ngữ', label: 'Ngoại ngữ' },
        { value: 'Tin học', label: 'Tin học' }
      ]
    },
    { label: 'Tên chứng chỉ', key: 'TenChungChi', type: 'text' },
    { label: 'Lệ phí thi', key: 'LePhiThi', type: 'number' },
    { label: 'Học phí', key: 'HocPhi', type: 'number' },
    { label: 'Thời hạn', key: 'ThoiHan', type: 'number' },
    { label: 'Điểm tối thiểu', key: 'DiemToiThieu', type: 'number' },
    { label: 'Điểm tối đa', key: 'DiemToiDa', type: 'number' },
    { 
      label: 'Cách tính điểm', 
      key: 'CachTinhDiem', 
      type: 'select',
      options: [
        { value: 'Trung bình', label: 'Trung bình' },
        { value: 'Tổng', label: 'Tổng' }
      ]
    }
  ]

  return (
    <>
      <PageComponent
        columns={columns}
        columnsCanEdit={columnsCanEdit}
        rows={certificates}
        formStates={formStates}
        pageContent={pageContent}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        isEditing={!!editingCertificate}
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        resetForm={resetForm}
        FormName={CertificateForm}
        onImportExcel={handleOpenImportExcel}
      />
      <RelatedDataModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        accountName={null} // Không cần cho chứng chỉ, hoặc truyền row nếu muốn
        modalOptions={[]} // Không cần cho lịch sử
        type="LichSu"
        title={modalTitle}
        data={modalData}
        columns={modalColumns}
        onAdd={null} // Không cần cho lịch sử
        onDelete={null} // Không cần cho lịch sử
        onUpdateOptions={null}
      />
      <ImportExcel
        open={importExcelOpen}
        onClose={() => setImportExcelOpen(false)}
        onImport={handleImportExcel}
        columnsCanEdit={columnsCanEdit}
        pageContent={pageContent}
      />
    </>
  )
}

export default QLChungChi
