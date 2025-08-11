import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import API from '../../api.jsx'
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import CourseForm from '../../components/Form/CourseForm.jsx'
import ImportExcel from '../../components/ImportExcel/ImportExcel.jsx'

import HistoryIcon from '@mui/icons-material/History'
import IconButton from '@mui/material/IconButton'

import fetchCollectionHistory from '../../components/fetchCollectionHistory/fetchCollectionHistory.js'
import RelatedDataModal from '../../components/Modal/RelatedDataModal.jsx'

import ListAltIcon from '@mui/icons-material/ListAlt'

function QLKhoaOn() {
  const routeAddress = 'course'
  const pageContent = 'khóa học'
  const funcAdd = 'them-khoa-on'
  const funcFind = 'tim-khoa-on'
  const funcFindAll = 'tat-ca-khoa-on'
  const funcUpdate = 'cap-nhat-khoa-on'
  const funcDelete = 'xoa-khoa-on'
  const historyAddress = 'courseHistory'

  const [EditingCourse, SetEditingCourse] = useState(null)
  const [Courses, SetCourses] = useState([])
  const [Certificates, SetCertificates] = useState([])
  const [currentCourseId, setCurrentCourseId] = useState(null)

  const [CertificateID, SetCertificateID] = useState('')
  const [LichHoc, SetLichHoc] = useState('')
  const [NgayKhaiGiang, SetNgayKhaiGiang] = useState('')
  const [NgayKetThuc, SetNgayKetThuc] = useState('')
  const [Buoi, SetBuoi] = useState('')
  const [SiSoToiDa, SetSiSoToiDa] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalData, setModalData] = useState([])
  const [modalColumns, setModalColumns] = useState([])
  const [modalType, setModalType] = useState('LichSu')
  const [modalOptions, setModalOptions] = useState([])
  const [accounts, setAccounts] = useState([])

  const [importExcelOpen, setImportExcelOpen] = useState(false)

  // --- helpers ngày ---
  const ddmmyyyyToISO = (str) => {
    const s = String(str ?? '').trim()
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (!m) return null
    const [ , dd, mm, yyyy ] = m
    return `${yyyy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`
  }
  const toISOForMongo = (v) => {
    if (!v) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
    const iso = ddmmyyyyToISO(v)
    return iso || v
  }
  const toDDMMYYYY = (v) => {
    if (!v) return '___'
    const d = new Date(v)
    if (isNaN(d)) return v
    return d.toLocaleDateString('vi-VN')
  }

  const formStates = {
    CertificateID, SetCertificateID,
    LichHoc, SetLichHoc,
    NgayKhaiGiang, SetNgayKhaiGiang,
    NgayKetThuc, SetNgayKetThuc,
    Buoi, SetBuoi,
    SiSoToiDa, SetSiSoToiDa
  }

  const showError = (message) => {
    Swal.fire({
      icon: 'warning',
      title: 'Thông báo',
      text: message,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    })
  }

  const createCourseData = () => ({
    IDChungChi: CertificateID,
    LichHoc,
    NgayKhaiGiang: new Date(NgayKhaiGiang),
    NgayKetThuc: new Date(NgayKetThuc),
    Buoi,
    SiSoToiDa: Number(SiSoToiDa) || 0
  })

  const resetForm = () => {
    SetLichHoc('')
    SetNgayKhaiGiang('')
    SetNgayKetThuc('')
    SetBuoi('')
    SetSiSoToiDa('')
    SetEditingCourse(null)
  }

  const fetchCourses = async () => {
    try {
      const res = await API.get(`/${routeAddress}/${funcFindAll}`)
      const coursesWForeignData = res.data.map((course) => {
        const id = course.IDChungChi?._id
        const cert = Certificates.find(c => c._id === id)
        return {
          ...course,
          TenChungChi: cert?.TenChungChi || ''
        }
      })
      SetCourses(coursesWForeignData)
    } catch (error) {
      showError(error.response?.data?.message || 'Vui lòng thử lại sau.')
    }
  }

  const fetchData = async () => {
    try {
      const [certificatesRes, coursesRes, accountsRes] = await Promise.all([
        API.get('/certificate/tat-ca-chung-chi'),
        API.get(`/${routeAddress}/${funcFindAll}`),
        API.get('/account/tat-ca-tai-khoan')
      ])

      SetCertificates(certificatesRes.data)
      setAccounts(accountsRes.data)

      const coursesWForeignData = coursesRes.data.map((course) => {
        const id = course.IDChungChi?._id
        const cert = certificatesRes.data.find(c => c._id === id)
        return {
          ...course,
          TenChungChi: cert?.TenChungChi || ''
        }
      })
      SetCourses(coursesWForeignData)
    } catch (error) {
      showError(error.response?.data?.message || 'Vui lòng thử lại sau.')
    }
  }

  const getDisplayNameById = (id, type) => {
    if (!id) return '___'
    switch (type) {
      case 'IDChungChi':
        const certificate = Certificates.find(c => c._id === id)
        return certificate ? certificate.TenChungChi : id
      case 'IDTaiKhoan':
        const account = accounts.find(a => a._id === id)
        return account ? account.TenHienThi : id
      default:
        return id
    }
  }

  const getFieldDisplayName = (fieldName) => {
    const fieldMapping = {
      'IDChungChi': 'Chứng chỉ',
      'LichHoc': 'Lịch học',
      'NgayKhaiGiang': 'Ngày khai giảng',
      'NgayKetThuc': 'Ngày kết thúc',
      'Buoi': 'Buổi',
      'SiSoToiDa': 'Sĩ số tối đa',
      'IDTaiKhoan': 'Danh sách học viên',
      'TenKhoaHoc': 'Tên khóa học'
    }
    return fieldMapping[fieldName] || fieldName
  }

  const formatHistoryValue = (value, fieldName) => {
    if (value === null || value === undefined) return '___'
    if (fieldName === 'NgayKhaiGiang' || fieldName === 'NgayKetThuc') {
      return toDDMMYYYY(value)
    }
    if (Array.isArray(value)) {
      return value.map(id => getDisplayNameById(id, fieldName)).join(', ')
    }
    if (typeof value === 'string' &&
      (fieldName === 'IDChungChi' || fieldName === 'IDTaiKhoan')) {
      return getDisplayNameById(value, fieldName)
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  }

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
        apiPath: '/courseHistory/tim-lich-su-khoa-hoc',
        id: row._id,
        getFieldDisplayName,
        formatHistoryValue,
        setModalData
      })
      setModalOptions([])
    } else if (type === 'IDTaiKhoan') {
      setCurrentCourseId(row._id)
      fetchRelatedData(row._id, row, type)
    }
    setModalOpen(true)
  }

  const fetchRelatedData = async (courseId, row, type) => {
    if (type === 'IDTaiKhoan') {
      const course = Courses.find(c => c._id === courseId)
      if (!course) {
        setModalData([])
        setModalColumns([])
        setModalOptions([])
        setModalTitle('Danh sách học viên')
        return
      }
      const dsHocVien = (course.IDTaiKhoan || []).map(accId => {
        const acc = accounts.find(a => a._id === accId)
        return {
          _id: acc?._id || accId,
          TenHienThi: acc?.TenHienThi || accId,
          TenTaiKhoan: acc?.TenTaiKhoan || '',
          SDT: acc?.SDT || '',
          CCCD: acc?.CCCD || ''
        }
      })
      setModalData(dsHocVien)
      setModalColumns([
        { key: 'TenHienThi', label: 'Tên học viên' },
        { key: 'TenTaiKhoan', label: 'Tài khoản' },
        { key: 'SDT', label: 'Số điện thoại' },
        { key: 'CCCD', label: 'CCCD' }
      ])
      const accountsListRes = await API.get('/account/tat-ca-tai-khoan')
      const accountsList = accountsListRes.data
      const accountNotInCourse = accountsList.filter(acc =>
        !(course.IDTaiKhoan || []).map(id => String(id)).includes(String(acc._id))
      )
      setModalOptions(accountNotInCourse.map(a => ({
        value: a._id,
        label: a.TenHienThi + (a.TenTaiKhoan ? ` (${a.TenTaiKhoan})` : '')
      })))
      setModalTitle('Danh sách học viên')
    }
  }

  const handleAdd = async () => {
    try {
      await API.post(`/${routeAddress}/${funcAdd}`, createCourseData())
      await fetchCourses()
      resetForm()
    } catch (error) {
      showError(error.response?.data?.message || 'Vui lòng thử lại sau.')
    }
  }

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: 'Bạn có chắc muốn xóa khóa học này?',
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
          await fetchCourses()
        } catch (error) {
          showError(error.response?.data?.message || 'Vui lòng thử lại sau.')
        }
      }
    })
  }

  const handleEdit = (row) => {
    SetCertificateID(row.IDChungChi?._id || row.IDChungChi)
    SetLichHoc(row.LichHoc)
    SetNgayKhaiGiang(new Date(row.NgayKhaiGiang).toISOString().slice(0, 10))
    SetNgayKetThuc(new Date(row.NgayKetThuc).toISOString().slice(0, 10))
    SetBuoi(row.Buoi)
    SetSiSoToiDa(row.SiSoToiDa?.toString())
    SetEditingCourse(row._id)
  }

  const handleUpdate = async () => {
    try {
      await API.put(`/${routeAddress}/${funcUpdate}/${EditingCourse}`, createCourseData())
      await fetchCourses()
      resetForm()
    } catch (error) {
      showError(error.response?.data?.message || 'Vui lòng thử lại sau.')
    }
  }

  // ✅ Import: mapping đúng field & chuẩn hóa ngày (DD/MM/YYYY -> ISO)
  const handleImportExcel = async (data) => {
    try {
      const importPromises = data.map(async (row) => {
        const certificate = Certificates.find(cert => cert.TenChungChi === row.CertificateID)
        if (!certificate) {
          throw new Error(`Không tìm thấy chứng chỉ: ${row.CertificateID}`)
        }
        const courseData = {
          IDChungChi: certificate._id,
          LichHoc: row.LichHoc || '',
          NgayKhaiGiang: toISOForMongo(row.NgayKhaiGiang || ''),
          NgayKetThuc: toISOForMongo(row.NgayKetThuc || ''),
          Buoi: row.Buoi || '',
          SiSoToiDa: row.SiSoToiDa ? Number(row.SiSoToiDa) : 0
        }
        return API.post(`/${routeAddress}/${funcAdd}`, courseData)
      })

      await Promise.all(importPromises)
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: `Đã nhập thành công ${data.length} khóa học`,
        confirmButtonColor: '#1976d2'
      })
      fetchCourses()
    } catch (error) {
      console.error('Lỗi nhập dữ liệu:', error)
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.message || 'Có lỗi xảy ra khi nhập dữ liệu',
        confirmButtonColor: '#1976d2'
      })
    }
  }

  const handleOpenImportExcel = () => {
    setImportExcelOpen(true)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns = [
    { label: 'Tên khóa học', key: 'TenKhoaHoc' },
    { label: 'Tên chứng chỉ', key: 'TenChungChi' },
    { label: 'Lịch học', key: 'LichHoc' },
    { label: 'Ngày khai giảng', key: 'NgayKhaiGiang', isDate: true },
    { label: 'Ngày kết thúc', key: 'NgayKetThuc', isDate: true },
    { label: 'Buổi', key: 'Buoi' },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa' },
    { label: 'Sĩ số hiện tại', key: 'SiSoHienTai' },
    {
      label: 'DS học viên',
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
      label: 'Tên chứng chỉ',
      key: 'CertificateID',
      type: 'autocomplete',
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
  ]

  const columnsForImport = [
    { label: 'Tên chứng chỉ', key: 'CertificateID', type: 'text' },
    { label: 'Lịch học', key: 'LichHoc', type: 'text', placeholder: 'T2 - T4 - T6 hoặc T3 - T5 - T7' },
    { label: 'Ngày khai giảng', key: 'NgayKhaiGiang', type: 'date' },
    { label: 'Ngày kết thúc', key: 'NgayKetThuc', type: 'date' },
    { label: 'Buổi', key: 'Buoi', type: 'text', placeholder: 'Chiều hoặc Tối' },
    { label: 'Sĩ số tối đa', key: 'SiSoToiDa', type: 'number' }
  ]

  return (
    <>
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
        onImportExcel={handleOpenImportExcel}
      />
      <RelatedDataModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        dataNeeded={currentCourseId}
        modalOptions={modalOptions}
        type={modalType}
        title={modalTitle}
        data={modalData}
        columns={modalColumns}
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

export default QLKhoaOn
