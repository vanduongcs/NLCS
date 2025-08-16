import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import API from '../../api.jsx'
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import ExamForm from '../../components/Form/ExamForm.jsx'
import ImportExcel from '../../components/ImportExcel/ImportExcel.jsx'

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

  // Top-most SweetAlert helper
  const fireTopSwal = (opts) =>
    Swal.fire({
      ...opts,
      didOpen: (el) => {
        if (el?.parentElement) el.parentElement.style.zIndex = 20000
      }
    })

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
  const [accounts, setAccounts] = useState([])

  // ImportExcel state
  const [importExcelOpen, setImportExcelOpen] = useState(false)

  // date helpers
  const ddmmyyyyToISO = (str) => {
    const s = String(str ?? '').trim()
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (!m) return null
    const [, dd, mm, yyyy] = m
    return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
  }
  const toISOForMongo = (v) => {
    if (!v) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    const iso = ddmmyyyyToISO(v)
    return iso || v
  }
  const formatDateTimeCell = (v) => {
    if (!v) return '___'
    const d = new Date(v)
    return isNaN(d) ? '___' : d.toLocaleString('vi-VN')
  }

  const formStates = {
    IDChungChi, SetIDChungChi,
    NgayThi, SetNgayThi,
    Buoi, SetBuoi,
    SiSoToiDa, SetSiSoToiDa
  }

  const showError = (message) => {
    fireTopSwal({
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

  // API
  const fetchData = async () => {
    try {
      const [certificatesRes, examsRes, accountsRes] = await Promise.all([
        API.get('/certificate/tat-ca-chung-chi'),
        API.get(`/${routeAddress}/${funcFindAll}`),
        API.get('/account/tat-ca-tai-khoan')
      ])
      setCertificates(certificatesRes.data)
      SetExams(examsRes.data)
      setAccounts(accountsRes.data)
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError(message)
    }
  }

  const fetchExams = async () => {
    try {
      const res = await API.get(`/${routeAddress}/${funcFindAll}`)
      SetExams(res.data)
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError(message)
    }
  }

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

  const formatHistoryValue = (value, fieldName) => {
    if (value === null || value === undefined) return '___'
    if (fieldName === 'NgayThi') return formatDateTimeCell(value).split(' ')[0] // chỉ ngày
    if (fieldName === 'IDTaiKhoan') {
      // Nếu là mảng, trả về danh sách tên
      if (Array.isArray(value)) {
        return value
          .map(id => {
            const acc = accounts.find(a => String(a._id) === String(id))
            return acc ? acc.TenHienThi : id
          })
          .join(', ')
      } else {
        const acc = accounts.find(a => String(a._id) === String(value))
        return acc ? acc.TenHienThi : value
      }
    }
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  // Modal
  const handleOpenModal = (type, row) => {
    setModalType(type)
    if (type === 'LichSu') {
      setModalTitle('Lịch sử thay đổi')
      setModalColumns([
        { key: 'KieuThayDoi', label: 'Loại thay đổi' },
        { key: 'ThoiGian', label: 'Thời gian', render: formatDateTimeCell },
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

  const fetchRelatedData = async (examId, row, type) => {
    if (type === 'IDTaiKhoan') {
      try {
        const examRes = await API.get(`/exam/${funcFind}/${examId}`)
        const exam = examRes.data
        if (!exam) { setModalData([]); setModalColumns([]); setModalOptions([]); setModalTitle('Danh sách thí sinh'); return }
        const accountsRes = await API.get('/account/tat-ca-tai-khoan')
        setAccounts(accountsRes.data)
        const resultsRes = await API.get(`/result/tat-ca-ket-qua`)
        const allResults = resultsRes.data
        const examResults = allResults.filter(result => String(result.IDKyThi) === String(examId) || (result.IDKyThi && String(result.IDKyThi._id) === String(examId)))
        const certReceivedRes = await API.get('/certReceived/tat-ca-chung-chi-da-nhan')
        const allCertReceived = certReceivedRes.data
        const dsThiSinh = (exam.IDTaiKhoan || []).map(accId => {
          const acc = accountsRes.data.find(a => String(a._id) === String(accId))
          const result = examResults.find(r => String(r.IDNguoiDung) === String(accId) || (r.IDNguoiDung && String(r.IDNguoiDung._id) === String(accId)))
          let certStatus = '___'
          if (result) {
            const certReceived = allCertReceived.find(cr => String(cr.IDKetQua) === String(result._id) || (cr.IDKetQua && String(cr.IDKetQua._id) === String(result._id)))
            if (certReceived) certStatus = certReceived.TrangThai
          }
          return {
            _id: acc?._id || accId,
            TenHienThi: acc?.TenHienThi || accId,
            TenTaiKhoan: acc?.TenTaiKhoan || '',
            SDT: acc?.SDT || '',
            CCCD: acc?.CCCD || '',
            DiemTK: result ? (result.DiemTK !== undefined ? result.DiemTK : '___') : '___',
            KQ: result ? result.KQ : '___',
            TrangThai: certStatus
          }
        })
        setModalData(dsThiSinh)
        setModalColumns([
          { key: 'TenHienThi', label: 'Tên thí sinh' },
          { key: 'TenTaiKhoan', label: 'Tài khoản' },
          { key: 'DiemTK', label: 'Điểm tổng kết' },
          { key: 'KQ', label: 'Kết quả' },
          { key: 'TrangThai', label: 'Trạng thái chứng chỉ' },
          { key: 'SDT', label: 'Số điện thoại' },
          { key: 'CCCD', label: 'CCCD' }
        ])
        const accountNotInExam = accountsRes.data.filter(acc => !(exam.IDTaiKhoan || []).some(id => String(id) === String(acc._id)))
        setModalOptions(accountNotInExam.map(a => ({ value: a._id, label: a.TenHienThi + (a.TenTaiKhoan ? ` (${a.TenTaiKhoan})` : '') })))
        setModalTitle('Danh sách thí sinh')
      } catch (error) {
        console.error('Error fetching related data:', error)
        showError('Lỗi khi tải dữ liệu: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  // CRUD
  const handleAdd = async () => {
    try {
      await API.post(`/${routeAddress}/${funcAdd}`, createExamData())
      await fetchExams()
      resetForm()
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError(message)
    }
  }

  const handleDelete = async (id) => {
    fireTopSwal({
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
          fireTopSwal({ title: 'Đã xóa!', text: `${pageContent} đã được xóa thành công.`, icon: 'success', confirmButtonColor: '#3085d6', confirmButtonText: 'Đóng' })
        } catch (error) {
          const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
          showError(message)
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
      showError(message)
    }
  }

  // Import Excel
  const handleImportExcel = async (data) => {
    const results = []
    const errors = []

    try {
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2

        try {
          const certificate = certificates.find(cert => cert.TenChungChi === row.IDChungChi)
          if (!certificate) {
            throw new Error(`Không tìm thấy chứng chỉ: ${row.IDChungChi}`)
          }
          const buoiStr = String(row.Buoi || '').trim().toLowerCase()
          const finalBuoi = (buoiStr === 'sáng' || buoiStr === 'sang') ? 'Sáng' : (buoiStr === 'chiều' || buoiStr === 'chieu') ? 'Chiều' : row.Buoi
          const examData = {
            IDChungChi: certificate._id,
            NgayThi: toISOForMongo(row.NgayThi || ''),
            Buoi: finalBuoi || '',
            SiSoToiDa: row.SiSoToiDa ? Number(row.SiSoToiDa) : 0
          }
          await API.post(`/${routeAddress}/${funcAdd}`, examData)
          results.push({ rowNumber, success: true })
        } catch (error) {
          console.error(`Error at row ${rowNumber}:`, error)
          let errorMessage = 'Lỗi không xác định'

          if (error.response) {
            if (error.response.data) {
              if (typeof error.response.data === 'string') {
                errorMessage = error.response.data
              } else if (error.response.data.message) {
                errorMessage = error.response.data.message
              } else if (error.response.data.error) {
                errorMessage = error.response.data.error
              } else {
                errorMessage = JSON.stringify(error.response.data)
              }
            } else {
              errorMessage = `Lỗi HTTP ${error.response.status}: ${error.response.statusText}`
            }
          } else if (error.message) {
            errorMessage = error.message
          }

          errors.push({ rowNumber, error: errorMessage })
        }
      }

      if (errors.length === 0) {
        fireTopSwal({
          icon: 'success',
          title: 'Thành công',
          text: `Đã nhập thành công ${results.length} kỳ thi`,
          confirmButtonColor: '#1976d2'
        })
      } else if (results.length === 0) {
        fireTopSwal({
          icon: 'error',
          title: 'Tất cả bản ghi đều lỗi',
          html: `<div style="text-align: left; max-height: 300px; overflow-y: auto;">
            <strong>Chi tiết các lỗi:</strong><br>
            ${errors.slice(0, 10).map(e => `• Hàng ${e.rowNumber}: ${e.error}`).join('<br>')}
            ${errors.length > 10 ? `<br><strong>... và ${errors.length - 10} lỗi khác</strong>` : ''}
          </div>`,
          confirmButtonColor: '#1976d2',
          width: '700px'
        })
        throw new Error(`Tất cả ${data.length} bản ghi đều bị lỗi`)
      } else {
        fireTopSwal({
          icon: 'warning',
          title: 'Hoàn thành với một số lỗi',
          html: `<div style="text-align: left; max-height: 300px; overflow-y: auto;">
            <strong>Thành công:</strong> ${results.length} bản ghi<br>
            <strong>Lỗi:</strong> ${errors.length} bản ghi<br><br>
            <strong>Chi tiết các lỗi:</strong><br>
            ${errors.slice(0, 10).map(e => `• Hàng ${e.rowNumber}: ${e.error}`).join('<br>')}
            ${errors.length > 10 ? `<br><strong>... và ${errors.length - 10} lỗi khác</strong>` : ''}
          </div>`,
          confirmButtonColor: '#1976d2',
          width: '700px'
        })
      }

      fetchExams()
    } catch (error) {
      console.error('Import Excel system error:', error)
      if (error.message?.includes('bản ghi đều bị lỗi')) {
        throw error
      }

      let systemErrorMessage = 'Có lỗi hệ thống xảy ra khi nhập dữ liệu'
      if (error.response?.data?.message) {
        systemErrorMessage = error.response.data.message
      } else if (error.message) {
        systemErrorMessage = error.message
      }

      fireTopSwal({
        icon: 'error',
        title: 'Lỗi hệ thống',
        text: systemErrorMessage,
        confirmButtonColor: '#1976d2'
      })
      throw new Error(systemErrorMessage)
    }
  }

  const handleOpenImportExcel = () => setImportExcelOpen(true)

  const handleAddRelated = async (examId, type, accountId) => {
    if (type !== 'IDTaiKhoan') return
    try {
      const examRes = await API.get(`/exam/${funcFind}/${examId}`)
      const examData = examRes.data
      const currentAccountIds = examData.IDTaiKhoan || []
      if (currentAccountIds.includes(accountId)) { showError('Thí sinh đã có trong danh sách'); return }
      const updatedAccountIds = [...currentAccountIds, accountId]
      await API.put(`/${routeAddress}/${funcUpdate}/${examId}`, {
        IDChungChi: examData.IDChungChi?._id || examData.IDChungChi,
        IDTaiKhoan: updatedAccountIds,
        Buoi: examData.Buoi,
        SiSoToiDa: examData.SiSoToiDa
      })
      await fetchExams(); await fetchRelatedData(examId, null, type)
    } catch (error) {
      console.error('Error adding student:', error)
      const message = error.response?.data?.message || 'Lỗi khi thêm thí sinh vào kỳ thi.'
      showError(message)
    }
  }

  const handleDeleteRelated = async (row, examId, type) => {
    if (type !== 'IDTaiKhoan') return
    try {
      const resultsRes = await API.get(`/result/tat-ca-ket-qua`)
      const allResults = resultsRes.data
      const studentHasResult = allResults.some(result => {
        const resultStudentId = typeof result.IDNguoiDung === 'object' ? result.IDNguoiDung._id : result.IDNguoiDung
        const resultExamId = typeof result.IDKyThi === 'object' ? result.IDKyThi._id : result.IDKyThi
        return String(resultStudentId) === String(row._id) && String(resultExamId) === String(examId)
      })
      if (studentHasResult) { showError('Không thể xóa thí sinh này khỏi kỳ thi vì thí sinh đã có kết quả thi.'); return }
      const exam = Exams.find(e => e._id === examId)
      if (!exam) return
      const newList = (exam.IDTaiKhoan || []).filter(id => id !== row._id)
      await API.put(`/exam/${funcUpdate}/${examId}`, {
        IDChungChi: typeof exam.IDChungChi === 'object' ? exam.IDChungChi._id : exam.IDChungChi,
        IDTaiKhoan: newList,
        Buoi: exam.Buoi,
        SiSoToiDa: exam.SiSoToiDa
      })
      await fetchExams(); await fetchRelatedData(examId, null, type)
    } catch (error) {
      console.error('Error deleting student:', error)
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError(message)
    }
  }

  const handleUpdateModalOptions = (type, addedId) => {
    if (type === 'IDTaiKhoan') {
      setModalOptions(prev => prev.filter(option => option.value !== addedId))
    }
  }

  useEffect(() => { fetchData() }, [])

  const columns = [
    { label: 'Tên kỳ thi', key: 'TenKyThi' },
    { label: 'Chứng chỉ', key: 'IDChungChi', render: (value, row) => getCertificateInfo(row, 'TenChungChi') },
    { label: 'Loại', key: 'IDChungChi', render: (value, row) => getCertificateInfo(row, 'Loai') },
    { label: 'Lệ phí thi', key: 'IDChungChi', render: (value, row) => getCertificateInfo(row, 'LePhiThi') },
    { label: 'Ngày thi', key: 'NgayThi', isDate: true },
    { label: 'Buổi', key: 'Buoi' },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa', type: 'number' },
    { label: 'Sĩ số hiện tại', key: 'SiSoHienTai', type: 'number' },
    { label: 'DS thí sinh', key: 'IDTaiKhoan', render: (value, row) => (<IconButton onClick={() => handleOpenModal('IDTaiKhoan', row)}><ListAltIcon color="primary" /></IconButton>) },
    { label: 'Lịch sử', key: 'LichSu', align: 'center', render: (value, row) => (<IconButton onClick={() => handleOpenModal('LichSu', row)}><HistoryIcon color="secondary" /></IconButton>) },
    { label: 'Sửa', key: 'editButton', align: 'center', isAction: 'edit' },
    { label: 'Xóa', key: 'deleteButton', align: 'center', isAction: 'delete' }
  ]

  const columnsCanEdit = [
    { label: 'Chọn chứng chỉ', key: 'IDChungChi', type: 'autocomplete', options: certificates.map(cert => ({ label: cert.TenChungChi, value: cert._id })) },
    { label: 'Ngày thi', key: 'NgayThi', type: 'date' },
    { label: 'Buổi', key: 'Buoi', type: 'select', options: [{ value: 'Sáng', label: 'Sáng' }, { value: 'Chiều', label: 'Chiều' }] },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa', type: 'number' }
  ]

  const columnsForImport = [
    { label: 'Tên chứng chỉ', key: 'IDChungChi', type: 'text' },
    { label: 'Ngày thi', key: 'NgayThi', type: 'date' },
    { label: 'Buổi', key: 'Buoi', type: 'text', placeholder: 'Sáng hoặc Chiều' },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa', type: 'number' }
  ]

  return (
    <>
      <PageComponent
        columns={columns}
        columnsCanEdit={columnsCanEdit}
        rows={Exams}
        formStates={formStates}
        pageContent={'đợt thi'}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        isEditing={!!EditingExam}
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        resetForm={resetForm}
        FormName={ExamForm}
        onImportExcel={handleOpenImportExcel}
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
        onUpdateOptions={handleUpdateModalOptions}
      />
      <ImportExcel
        open={importExcelOpen}
        onClose={() => setImportExcelOpen(false)}
        onImport={handleImportExcel}
        columnsCanEdit={columnsForImport}
        pageContent={pageContent}
      />
    </>
  )
}

export default QLKyThi
