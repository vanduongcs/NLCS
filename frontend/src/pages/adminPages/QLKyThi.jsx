import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import API from '../../api.jsx'
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import ExamForm from '../../components/Form/ExamForm.jsx'

import HistoryIcon from '@mui/icons-material/History'
import IconButton from '@mui/material/IconButton'

import fetchCollectionHistory from '../../components/fetchCollectionHistory/fetchCollectionHistory.js'
import RelatedDataModal from '../../components/Modal/RelatedDataModal.jsx'

import ListAltIcon from '@mui/icons-material/ListAlt'


function QLKyThi() {
  // Constants
  const routeAddress = 'exam'
  const pageContent = 'kỳ thi'
  const funcAdd = 'them-ky-thi'
  const funcFind = 'tim-ky-thi'
  const funcFindAll = 'tat-ca-ky-thi'
  const funcUpdate = 'cap-nhat-ky-thi'
  const funcDelete = 'xoa-ky-thi'
  const historyAddress = 'examHistory'

  // State
  const [EditingExam, SetEditingExam] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [Exams, SetExams] = useState([])
  const [currentExamId, setCurrentExamId] = useState(null)

  const [IDChungChi, SetIDChungChi] = useState('')
  const [NgayThi, SetNgayThi] = useState('')
  const [Buoi, SetBuoi] = useState('')
  const [SiSoToiDa, SetSiSoToiDa] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalData, setModalData] = useState([])
  const [modalColumns, setModalColumns] = useState([])
  const [modalType, setModalType] = useState('LichSu')
  const [modalOptions, setModalOptions] = useState([])
  const [accounts, setAccounts] = useState([]) // Thêm state này để lưu danh sách tài khoản

  const formStates = {
    IDChungChi, SetIDChungChi,
    NgayThi, SetNgayThi,
    Buoi, SetBuoi,
    SiSoToiDa, SetSiSoToiDa
  }

  // Utility functions
  const showError = (message) => {
    Swal.fire({
      icon: 'warning',
      title: 'Thông báo',
      text: message,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    })
  }

  const createExamData = () => ({
    IDChungChi,
    NgayThi: new Date(NgayThi),
    Buoi,
    SiSoToiDa: SiSoToiDa ? Number(SiSoToiDa) : undefined
  })

  const resetForm = () => {
    SetNgayThi('')
    SetBuoi('')
    SetSiSoToiDa('')
    SetEditingExam(null)
  }

  const getCertificateInfo = (row, field) => {
    const certId = typeof row.IDChungChi === 'object' ? row.IDChungChi._id : row.IDChungChi
    const cert = certificates.find(c => String(c._id) === String(certId))
    return cert ? cert[field] : ''
  }

  // API functions
  const fetchData = async () => {
    try {
      const [certificatesRes, examsRes, accountsRes] = await Promise.all([
        API.get('/certificate/tat-ca-chung-chi'),
        API.get(`/${routeAddress}/${funcFindAll}`),
        API.get('/account/tat-ca-tai-khoan')
      ])
      setCertificates(certificatesRes.data)
      SetExams(examsRes.data)
      setAccounts(accountsRes.data) // Lưu danh sách tài khoản
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi khi tải dữ liệu', message)
    }
  }

  const fetchExams = async () => {
    try {
      const res = await API.get(`/${routeAddress}/${funcFindAll}`)
      SetExams(res.data)
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError(`Không thể tải danh sách ${pageContent}`, message)
    }
  }

  // Hàm chuyển tên trường dữ liệu sang tiếng Việt
  const getFieldDisplayName = (field) => {
    const fieldNames = {
      'IDChungChi': 'Chứng chỉ',
      'NgayThi': 'Ngày thi',
      'Buoi': 'Buổi',
      'SiSoToiDa': 'Sĩ số tối đa',
      'SiSoHienTai': 'Sĩ số hiện tại',
      'TenKyThi': 'Tên kỳ thi'
    }
    return fieldNames[field] || field
  }

  // Hàm format giá trị lịch sử
  const formatHistoryValue = (value, fieldName) => {
    if (value === null || value === undefined) return '___'
    if (fieldName === 'NgayThi') return new Date(value).toLocaleDateString('vi-VN')
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  // Hàm mở modal lịch sử
  const handleOpenModal = (type, row) => {
    setModalType(type)
    if (type === 'LichSu') {
      setModalTitle('Lịch sử thay đổi')
      setModalColumns([
        { key: 'KieuThayDoi', label: 'Loại thay đổi' },
        { key: 'ThoiGian', label: 'Thời gian', render: (value) => new Date(value).toLocaleString('vi-VN') },
        { key: 'TruongDLThayDoi', label: 'Trường dữ liệu', render: (value) => getFieldDisplayName(value) },
        { key: 'DLTruoc', label: 'Giá trị trước', render: (value, row) => formatHistoryValue(value, row.TruongDLThayDoi) },
        { key: 'DLSau', label: 'Giá trị sau', render: (value, row) => formatHistoryValue(value, row.TruongDLThayDoi) }
      ])
      fetchCollectionHistory({
        apiPath: '/examHistory/tim-lich-su-ky-thi',
        id: row._id,
        getFieldDisplayName,
        formatHistoryValue,
        setModalData
      })
      setModalOptions([])
    } else if (type === 'IDTaiKhoan') {
      setCurrentExamId(row._id)
      fetchRelatedData(row._id, row, type)
    }
    setModalOpen(true)
  }

  const getDisplayNameById = (id, type) => {
    if (!id) return ''

    if (type === 'IDTaiKhoan') {
      const DSAccount = API.get('/account/tat-ca-tai-khoan')
      const acc = DSAccount.find(acc => acc._id === id)
      return acc ? acc.Ten : id
    }
  }

  const fetchRelatedData = async (examId, row, type) => {
    if (type === 'IDTaiKhoan') {
      // Lấy danh sách tài khoản của kỳ thi này
      const exam = Exams.find(e => e._id === examId)
      if (!exam) {
        setModalData([])
        setModalColumns([])
        setModalOptions([])
        setModalTitle('Danh sách thí sinh')
        return
      }
      // Lấy thông tin tài khoản từ accounts
      const dsThiSinh = (exam.IDTaiKhoan || []).map(accId => {
        const acc = accounts.find(a => a._id === accId)
        return {
          _id: acc?._id || accId,
          TenHienThi: acc?.TenHienThi || accId,
          TenTaiKhoan: acc?.TenTaiKhoan || '',
          SDT: acc?.SDT || '',
          CCCD: acc?.CCCD || ''
        }
      })
      setModalData(dsThiSinh)
      setModalColumns([
        { key: 'TenHienThi', label: 'Tên thí sinh' },
        { key: 'TenTaiKhoan', label: 'Tài khoản' },
        { key: 'SDT', label: 'Số điện thoại' },
        { key: 'CCCD', label: 'CCCD' }
      ])
      // Tìm các tài khoản chưa có trong kỳ thi này để làm options thêm
      const accountsListRes = await API.get('/account/tat-ca-tai-khoan')
      const accountsList = accountsListRes.data
      const accountNotInExam = accountsList.filter(acc =>
        !(exam.IDTaiKhoan || []).map(id => String(id)).includes(String(acc._id))
      )
      setModalOptions(accountNotInExam.map(a => ({
        value: a._id,
        label: a.TenHienThi + (a.TenTaiKhoan ? ` (${a.TenTaiKhoan})` : '')
      })))
      setModalTitle('Danh sách thí sinh')
    }
  }

  // Event handlers
  const handleAdd = async () => {
    try {
      await API.post(`/${routeAddress}/${funcAdd}`, createExamData())
      await fetchExams()
      resetForm()
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError(`Lỗi khi thêm ${pageContent}`, message)
    }
  }

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc chắn muốn xóa ${pageContent} này không?`,
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
          await fetchExams()
          Swal.fire({
            title: 'Đã xóa!',
            text: `${pageContent} đã được xóa thành công.`,
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Đóng'
          })
        } catch (error) {
          const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
          showError(`Lỗi khi xóa ${pageContent}`, message)
        }
      }
    })
  }

  const handleEdit = (row) => {
    SetIDChungChi(row.IDChungChi?._id || '')
    SetNgayThi(row.NgayThi ? new Date(row.NgayThi).toISOString().slice(0, 10) : '')
    SetBuoi(row.Buoi)
    SetSiSoToiDa(row.SiSoToiDa?.toString() || '')
    SetEditingExam(row._id)
  }

  const handleUpdate = async () => {
    try {
      await API.put(`/${routeAddress}/${funcUpdate}/${EditingExam}`, createExamData())
      await fetchExams()
      resetForm()
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError(`Lỗi khi chỉnh sửa ${pageContent}`, message)
    }
  }

  const handleAddRelated = async (examId, type, accountId) => {
    if (type !== 'IDTaiKhoan') return

    try {
      // Lấy thông tin exam hiện tại
      const examRes = await API.get(`/exam/${funcFind}/${examId}`)
      const examData = examRes.data

      // Lấy danh sách IDTaiKhoan hiện tại, đảm bảo không null/undefined
      const currentAccountIds = examData.IDTaiKhoan || []

      // Kiểm tra xem tài khoản đã có trong danh sách chưa
      if (currentAccountIds.includes(accountId)) {
        const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
        showError('Thí sinh đã có trong kỳ thi này!', message)
        return
      }

      // Thêm accountId vào danh sách
      const updatedAccountIds = [...currentAccountIds, accountId]

      // Cập nhật exam với danh sách IDTaiKhoan mới
      await API.put(`/${routeAddress}/${funcUpdate}/${examId}`, {
        IDChungChi: examData.IDChungChi?._id || examData.IDChungChi,
        IDTaiKhoan: updatedAccountIds,
        NgayThi: examData.NgayThi,
        Buoi: examData.Buoi,
        SiSoToiDa: examData.SiSoToiDa
      })

      // Refresh dữ liệu exams trong state
      await fetchExams()

      // Fetch lại dữ liệu accounts để đảm bảo có dữ liệu mới nhất
      const accountsRes = await API.get('/account/tat-ca-tai-khoan')
      const updatedAccounts = accountsRes.data
      setAccounts(updatedAccounts) // Cập nhật state accounts

      // Cập nhật modal ngay lập tức với dữ liệu mới
      const dsThiSinh = updatedAccountIds.map(accId => {
        const acc = updatedAccounts.find(a => a._id === accId)
        return {
          _id: acc?._id || accId,
          TenHienThi: acc?.TenHienThi || accId,
          TenTaiKhoan: acc?.TenTaiKhoan || '',
          SDT: acc?.SDT || '',
          CCCD: acc?.CCCD || ''
        }
      })

      setModalData(dsThiSinh)

      // Cập nhật options (loại bỏ account vừa thêm)
      const accountNotInExam = updatedAccounts.filter(acc =>
        !updatedAccountIds.includes(acc._id)
      )
      setModalOptions(accountNotInExam.map(a => ({
        value: a._id,
        label: a.TenHienThi + (a.TenTaiKhoan ? ` (${a.TenTaiKhoan})` : '')
      })))

    } catch (error) {
      const message = error.response?.data?.message || 'Lỗi khi thêm thí sinh vào kỳ thi.'
      showError(message)

    }
  }

  const handleDeleteRelated = async (row, examId, type) => {
    if (type !== 'IDTaiKhoan') return
    try {
      const exam = Exams.find(e => e._id === examId)
      if (!exam) return

      const newList = (exam.IDTaiKhoan || []).filter(id => id !== row._id)

      await API.put(`/exam/${funcUpdate}/${examId}`, {
        ...exam,
        IDTaiKhoan: newList,
        IDChungChi: exam.IDChungChi?._id || exam.IDChungChi,
        NgayThi: exam.NgayThi,
        Buoi: exam.Buoi,
        SiSoToiDa: exam.SiSoToiDa
      })

      await fetchExams()

      // Cập nhật modal ngay lập tức
      const dsThiSinh = newList.map(accId => {
        const acc = accounts.find(a => a._id === accId)
        return {
          _id: acc?._id || accId,
          TenHienThi: acc?.TenHienThi || accId,
          TenTaiKhoan: acc?.TenTaiKhoan || '',
          SDT: acc?.SDT || '',
          CCCD: acc?.CCCD || ''
        }
      })

      setModalData(dsThiSinh)

      // Cập nhật options (thêm lại account vừa xóa)
      const accountNotInExam = accounts.filter(acc =>
        !newList.includes(acc._id)
      )
      setModalOptions(accountNotInExam.map(a => ({
        value: a._id,
        label: a.TenHienThi + (a.TenTaiKhoan ? ` (${a.TenTaiKhoan})` : '')
      })))

    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi khi xóa thí sinh', message)
    }
  }

  // Thêm hàm handleUpdateModalOptions
  const handleUpdateModalOptions = (type, addedId) => {
    if (type === 'IDTaiKhoan') {
      setModalOptions(prev => prev.filter(option => option.value !== addedId))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Table configuration
  const columns = [
    { label: 'Tên kỳ thi', key: 'TenKyThi' },
    {
      label: 'Chứng chỉ',
      key: 'IDChungChi',
      render: (value, row) => getCertificateInfo(row, 'TenChungChi')
    },
    {
      label: 'Loại',
      key: 'IDChungChi',
      render: (value, row) => getCertificateInfo(row, 'Loai')
    },
    {
      label: 'Lệ phí thi',
      key: 'IDChungChi',
      render: (value, row) => getCertificateInfo(row, 'LePhiThi')
    },
    { label: 'Ngày thi', key: 'NgayThi', isDate: true },
    { label: 'Buổi', key: 'Buoi' },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa', type: 'number' },
    { label: 'Sĩ số hiện tại', key: 'SiSoHienTai', type: 'number' },
    {
      label: 'DS thí sinh',
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
  ]

  const columnsCanEdit = [
    {
      label: 'Chọn chứng chỉ',
      key: 'IDChungChi',
      type: 'autocomplete',
      options: certificates.map(cert => ({
        label: cert.TenChungChi,
        value: cert._id
      }))
    },
    { label: 'Ngày thi', key: 'NgayThi', type: 'date' },
    {
      label: 'Buổi',
      key: 'Buoi',
      type: 'select',
      options: [
        { value: 'Sáng', label: 'Sáng' },
        { value: 'Chiều', label: 'Chiều' }
      ]
    },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa', type: 'number' }
  ]

  return (
    <>
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
        FormName={ExamForm}
      />
      <RelatedDataModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        dataNeeded={currentExamId}
        modalOptions={modalOptions}
        type={modalType}
        title={modalTitle}
        data={modalData}
        columns={modalColumns}
        onAdd={handleAddRelated}
        onDelete={handleDeleteRelated}
        onUpdateOptions={handleUpdateModalOptions} // <-- Sửa từ null thành handleUpdateModalOptions
      />
    </>
  )
}

export default QLKyThi
