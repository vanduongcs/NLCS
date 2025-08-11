import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import API from '../../api.jsx'
import PageComponent from '../../components/Admin/pageComponent/PageComponent.jsx'
import AccountForm from '../../components/Form/AccountForm.jsx'
import ImportExcel from '../../components/ImportExcel/ImportExcel.jsx'
import IconButton from '@mui/material/IconButton'
import VisibilityIcon from '@mui/icons-material/Visibility'
import HistoryIcon from '@mui/icons-material/History'
import RelatedDataModal from '../../components/Modal/RelatedDataModal.jsx'
import fetchCollectionHistory from '../../components/fetchCollectionHistory/fetchCollectionHistory.js'

import ListAltIcon from '@mui/icons-material/ListAlt'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import Box from '@mui/material/Box'

function QLNguoiDung() {
  // Hằng lưu trữ địa chỉ API và các chức năng
  const routeAddress = 'account'
  const pageContent = 'tài khoản'
  const funcGet = 'tim-tai-khoan'
  const funcAdd = 'dang-ky'
  const funcFindAll = 'tat-ca-tai-khoan'
  const funcUpdate = 'cap-nhat-tai-khoan'
  const funcDelete = 'xoa-tai-khoan'
  const historyAddress = 'accountHistory'

  // Biến xác định có đang chỉnh sửa hay không
  const [editingAccount, setEditingAccount] = useState(null)

  // Lưu dữ liệu các collection
  const [courses, setCourses] = useState([])
  const [exams, setExams] = useState([])
  const [certificates, setCertificates] = useState([])
  const [Accounts, SetAccounts] = useState([])

  // Cache tên chứng chỉ đã nhận theo userId để hiển thị trực tiếp
  // { [userId]: { daNhan: string[], chuaNhan: {value,label}[] } }
  const [certNamesByUser, setCertNamesByUser] = useState({})

  // Lưu trữ dữ liệu chỉnh sửa account
  const [TenHienThi, SetTenHienThi] = useState('')
  const [TenTaiKhoan, SetTenTaiKhoan] = useState('')
  const [Loai, SetLoai] = useState('')
  const [CCCD, SetCCCD] = useState('')
  const [SDT, SetSDT] = useState('')
  const [MatKhau, SetMatKhau] = useState('')

  // Lưu dữ liệu liên quan đến modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalData, setModalData] = useState([])
  const [modalColumns, setModalColumns] = useState([])
  const [modalAccountName, setModalAccountName] = useState(null)
  const [modalType, setModalType] = useState('')

  // State cho ImportExcel
  const [importExcelOpen, setImportExcelOpen] = useState(false)
  const [modalOptions, setModalOptions] = useState([])

  const formStates = {
    Loai, SetLoai,
    TenHienThi, SetTenHienThi,
    TenTaiKhoan, SetTenTaiKhoan,
    MatKhau, SetMatKhau,
    CCCD, SetCCCD,
    SDT, SetSDT
  }

  // ===== Helpers hiển thị tên + nút modal trong cùng một ô =====
  const toCourseNames = (ids) =>
    (ids || []).map(id => (courses.find(c => c._id === id)?.TenKhoaHoc || id))

  const toExamNames = (ids) =>
    (ids || []).map(id => (exams.find(e => e._id === id)?.TenKyThi || id))

  // MỚI: mỗi tên xuống dòng, bọc bởi [ và ]
  const renderListWithButton = (names, onClick) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        alignItems: 'center', // căn giữa ngang cả tên và nút
        textAlign: 'center'   // căn giữa text tên
      }}
    >
      <Box sx={{ flex: 1 }}>
        {names && names.length ? (
          names.map((n, idx) => (
            <Box key={idx} component="div" sx={{ whiteSpace: 'pre-wrap' }}>
              [{n}]
            </Box>
          ))
        ) : (
          '___'
        )}
      </Box>
      <Box sx={{ mt: 1 }}>
        <IconButton onClick={onClick} size="small">
          <ListAltIcon color="primary" />
        </IconButton>
      </Box>
    </Box>
  )


  // ===== Mở modal chi tiết =====
  const handleOpenModal = (type, row) => {
    setModalType(type)
    setModalAccountName(row.TenTaiKhoan)

    if (type === 'LichSu') {
      setModalTitle('Lịch sử thay đổi')
      fetchCollectionHistory({
        apiPath: `/${historyAddress}/tim-lich-su-tai-khoan`,
        id: row._id,
        getFieldDisplayName,
        formatHistoryValue,
        setModalData
      })
      setModalColumns([
        { key: 'KieuThayDoi', label: 'Loại thay đổi' },
        { key: 'ThoiGian', label: 'Thời gian', render: (value) => new Date(value).toLocaleString('vi-VN') },
        { key: 'TruongDLThayDoi', label: 'Trường dữ liệu' },
        { key: 'DLTruoc', label: 'Giá trị trước' },
        { key: 'DLSau', label: 'Giá trị sau' }
      ])
      setModalOptions([])
    } else if (
      type === 'KhoaHocDaThamGia' ||
      type === 'KyThiDaThamGia' ||
      type === 'ChungChiDaNhan'
    ) {
      fetchRelatedDataAndSetModal(row._id, row, type)
      if (type === 'KhoaHocDaThamGia') setModalTitle('Khóa học đã tham gia')
      if (type === 'KyThiDaThamGia') setModalTitle('Kỳ thi đã tham gia')
      if (type === 'ChungChiDaNhan') setModalTitle('Chứng chỉ đã nhận')
    }
    setModalOpen(true)
  }

  // Convert từ id sang tên hiển thị
  const getDisplayNameById = (id, type) => {
    if (!id) return '___'
    switch (type) {
      case 'KhoaHocDaThamGia': {
        const course = courses.find(c => c._id === id)
        return course ? course.TenKhoaHoc : id
      }
      case 'KyThiDaThamGia': {
        const exam = exams.find(e => e._id === id)
        return exam ? exam.TenKyThi : id
      }
      case 'ChungChiDaNhan': {
        const certificate = certificates.find(c => c._id === id)
        return certificate ? certificate.TenChungChi : id
      }
      default:
        return id
    }
  }

  // Định dạng giá trị lịch sử
  const formatHistoryValue = (value, fieldName) => {
    if (!value) return '___'

    if (Array.isArray(value)) {
      return value.map(id => getDisplayNameById(id, fieldName)).join(', ')
    }

    if (typeof value === 'string' &&
      (fieldName === 'KhoaHocDaThamGia' ||
        fieldName === 'KyThiDaThamGia' ||
        fieldName === 'ChungChiDaNhan')) {
      return getDisplayNameById(value, fieldName)
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  // Từ các trường dữ liệu trong Account, lấy tên hiển thị tương ứng
  const getFieldDisplayName = (field) => {
    const fieldNames = {
      'TenHienThi': 'Tên hiển thị',
      'TenTaiKhoan': 'Tên tài khoản',
      'MatKhau': 'Mật khẩu',
      'Loai': 'Vai trò',
      'CCCD': 'Căn cước công dân',
      'SDT': 'Số điện thoại',
      'KhoaHocDaThamGia': 'Khóa học đã tham gia',
      'KyThiDaThamGia': 'Kỳ thi đã tham gia',
      'ChungChiDaNhan': 'Chứng chỉ đã nhận'
    }
    return fieldNames[field] || field
  }

  const handleAddRelated = async (dataNeeded, type, selectedId) => {
    try {
      const accountHandle = await API.get(`/${routeAddress}/${funcGet}/${dataNeeded}`)
      const accountDataBeforeAdd = accountHandle.data[type] || []

      const updatedData = [...accountDataBeforeAdd, selectedId]

      await API.put(`/${routeAddress}/${funcUpdate}/${dataNeeded}`, {
        [type]: updatedData
      })

      const currentAccount = Accounts.find(acc => acc.TenTaiKhoan === dataNeeded)
      if (currentAccount) {
        await fetchRelatedDataAndSetModal(currentAccount._id, {
          ...currentAccount,
          [type]: updatedData
        }, type)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi thêm dữ liệu liên quan',
        text: message,
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1976d2'
      })
    }
  }

  const handleUpdateModalOptions = (type, addedId) => {
    if (type === 'KhoaHocDaThamGia' || type === 'KyThiDaThamGia' || type === 'ChungChiDaNhan') {
      setModalOptions(prev => prev.filter(option => option.value !== addedId))
    }
  }

  const handleDeleteRelated = async (row, accountName, type) => {
    try {
      const accountHandle = await API.get(`/${routeAddress}/${funcGet}/${accountName}`)
      const accountDataBeforeDelete = accountHandle.data[type] || []
      let updatedData = []

      let idToRemove = ''
      if (type === 'ChungChiDaNhan') {
        idToRemove = row.IDKetQua
      } else {
        idToRemove = row._id
      }
      updatedData = accountDataBeforeDelete.filter(item => item !== idToRemove)

      await API.put(`/${routeAddress}/${funcUpdate}/${accountName}`, {
        [type]: updatedData
      })

      const currentAccount = Accounts.find(acc => acc.TenTaiKhoan === accountName)
      if (currentAccount) {
        await fetchRelatedDataAndSetModal(currentAccount._id, {
          ...currentAccount,
          [type]: updatedData
        }, type)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi xóa dữ liệu liên quan',
        text: 'Vui lòng thử lại sau.',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#1976d2'
      })
    }
  }

  const fetchRelatedDataAndSetModal = async (userId, row, type) => {
    try {
      if (type === 'ChungChiDaNhan') {
        const res = await API.get(`/certReceived/tat-ca-chung-chi-da-nhan/${userId}`)
        const allCerts = res.data
        const daNhan = allCerts.filter(cert => cert.TrangThai === 'Đã lấy')
        const chuaNhan = allCerts.filter(cert => cert.TrangThai === 'Chưa lấy')

        setModalData(
          daNhan.map(cert => ({
            _id: cert._id,
            IDKetQua: cert.IDKetQua?._id || '___',
            TenChungChi: cert?.IDKetQua?.IDKyThi?.IDChungChi?.TenChungChi || '___',
            TenKyThi: cert.IDKetQua?.IDKyThi?.TenKyThi || '___',
            Diem1: cert.IDKetQua?.Diem1 || '___',
            Diem2: cert.IDKetQua?.Diem2 || '___',
            Diem3: cert.IDKetQua?.Diem3 || '___',
            Diem4: cert.IDKetQua?.Diem4 || '___',
            DiemTK: cert.IDKetQua?.DiemTK || '___',
            KQ: cert.IDKetQua?.KQ || '___',
            NgayCap: cert.IDKetQua?.NgayCap || '___',
            NgayHetHan: cert.IDKetQua?.NgayHetHan || '___'
          }))
        )
        setModalColumns([
          { key: 'TenChungChi', label: 'Tên chứng chỉ' },
          { key: 'TenKyThi', label: 'Tên kỳ thi' },
          { key: 'Diem1', label: 'Điểm 1' },
          { key: 'Diem2', label: 'Điểm 2' },
          { key: 'Diem3', label: 'Điểm 3' },
          { key: 'Diem4', label: 'Điểm 4' },
          { key: 'DiemTK', label: 'Điểm tổng kết' },
          { key: 'KQ', label: 'Kết quả' },
          { key: 'NgayCap', label: 'Ngày cấp', render: (value) => new Date(value).toLocaleDateString('vi-VN') },
          { key: 'NgayHetHan', label: 'Ngày hết hạn', render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'Không có' }
        ])
        setModalOptions(
          chuaNhan.map(cert => ({
            value: cert?.IDKetQua?._id || '___',
            label: cert?.IDKetQua?.IDKyThi?.TenKyThi || '___'
          }))
        )
      } else if (type === 'KhoaHocDaThamGia') {
        const newCourses = await API.get('/course/tat-ca-khoa-on')
        const coursesUse = newCourses.data
        const KhoaHocNDThamGia = coursesUse.filter(course => course.IDTaiKhoan?.includes(userId))
        if (!KhoaHocNDThamGia || KhoaHocNDThamGia.length === 0) {
          setModalData([])
        }
        const KhoaHocNDChuaThamGia = coursesUse.filter(course => !course.IDTaiKhoan?.includes(userId))

        setModalData(
          KhoaHocNDThamGia.map(course => ({
            _id: course._id,
            TenKhoaHoc: course.TenKhoaHoc || '___',
            SiSoHienTai: course.SiSoHienTai || '___',
            SiSoToiDa: course.SiSoToiDa || '___',
            NgayKhaiGiang: course.NgayKhaiGiang || '___',
            NgayKetThuc: course.NgayKetThuc || '___'
          }))
        )
        setModalColumns([
          { key: 'TenKhoaHoc', label: 'Tên khóa học' },
          { key: 'SiSoHienTai', label: 'Sĩ số hiện tại' },
          { key: 'SiSoToiDa', label: 'Sĩ số tối đa' },
          { key: 'NgayKhaiGiang', label: 'Ngày khai giảng', render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '' },
          { key: 'NgayKetThuc', label: 'Ngày kết thúc', render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '' }
        ])
        setModalOptions(
          KhoaHocNDChuaThamGia.map(course => ({
            value: course._id,
            label: course.TenKhoaHoc || '___'
          }))
        )
      } else if (type === 'KyThiDaThamGia') {
        const newExams = await API.get('/exam/tat-ca-ky-thi')
        const examsUse = newExams.data
        const KyThiNDThamGia = examsUse.filter(exam => exam.IDTaiKhoan?.includes(userId))
        if (!KyThiNDThamGia || KyThiNDThamGia.length === 0) {
          setModalData([])
        }
        const KyThiNDChuaThamGia = examsUse.filter(exam => !exam.IDTaiKhoan?.includes(userId))

        setModalData(
          KyThiNDThamGia.map(exam => ({
            _id: exam._id,
            TenKyThi: exam.TenKyThi || '___',
            SiSoHienTai: exam.SiSoHienTai || '___',
            SiSoToiDa: exam.SiSoToiDa || '___',
            NgayThi: exam.NgayThi || '___'
          }))
        )
        setModalColumns([
          { key: 'TenKyThi', label: 'Tên kỳ thi' },
          { key: 'SiSoHienTai', label: 'Sĩ số hiện tại' },
          { key: 'SiSoToiDa', label: 'Sĩ số tối đa' },
          { key: 'NgayThi', label: 'Ngày thi', render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '' }
        ])
        setModalOptions(
          KyThiNDChuaThamGia.map(exam => ({
            value: exam._id,
            label: exam.TenKyThi || '___'
          }))
        )
      }
    } catch (error) {
      setModalData([])
      setModalColumns([{ key: 'TenChungChi', label: 'Tên chứng chỉ' }])
      setModalOptions([])
    }
  }

  // Utility functions
  const showError = (title, message = 'Vui lòng thử lại sau.') => {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#1976d2'
    })
  }

  const createAccountData = () => ({
    Loai,
    TenHienThi,
    TenTaiKhoan,
    MatKhau,
    CCCD,
    SDT
  })

  const resetForm = () => {
    SetTenHienThi('')
    SetTenTaiKhoan('')
    SetCCCD('')
    SetSDT('')
    SetMatKhau('')
    setEditingAccount(null)
  }

  // ======= API functions =======
  const fetchData = async () => {
    try {
      const [accountsRes, coursesRes, examsRes, certificatesRes] = await Promise.all([
        API.get(`/${routeAddress}/${funcFindAll}`),
        API.get('/course/tat-ca-khoa-on'),
        API.get('/exam/tat-ca-ky-thi'),
        API.get('/certificate/tat-ca-chung-chi'),
      ])

      SetAccounts(accountsRes.data)
      setCourses(coursesRes.data)
      setExams(examsRes.data)
      setCertificates(certificatesRes.data)

      // Preload tên chứng chỉ đã nhận (Đã lấy) theo user
      await preloadCertNames(accountsRes.data)
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi khi tải dữ liệu', message)
    }
  }

  const preloadCertNames = async (accounts) => {
    try {
      const entries = await Promise.all(
        (accounts || []).map(async (acc) => {
          try {
            const res = await API.get(`/certReceived/tat-ca-chung-chi-da-nhan/${acc._id}`)
            const all = res.data || []
            const daNhan = all
              .filter(x => x.TrangThai === 'Đã lấy')
              .map(x => x?.IDKetQua?.IDKyThi?.IDChungChi?.TenChungChi)
              .filter(Boolean)
            const chuaNhanOptions = all
              .filter(x => x.TrangThai === 'Chưa lấy')
              .map(x => ({
                value: x?.IDKetQua?._id,
                label: x?.IDKetQua?.IDKyThi?.TenKyThi || '___'
              }))
            return [acc._id, { daNhan, chuaNhan: chuaNhanOptions }]
          } catch {
            return [acc._id, { daNhan: [], chuaNhan: [] }]
          }
        })
      )
      setCertNamesByUser(Object.fromEntries(entries))
    } catch {
      setCertNamesByUser({})
    }
  }

  const fetchAccounts = async () => {
    try {
      const res = await API.get(`/${routeAddress}/${funcFindAll}`)
      SetAccounts(res.data)
      await preloadCertNames(res.data)
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Không thể tải danh sách tài khoản', message)
    }
  }

  // Event handlers
  const handleAdd = async () => {
    try {
      await API.post(`/${routeAddress}/${funcAdd}`, createAccountData())
      await fetchAccounts()
      resetForm()
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi khi thêm tài khoản', message)
    }
  }

  const handleUpdate = async () => {
    try {
      const updatedAccount = {
        ...createAccountData()
      }

      await API.put(`/${routeAddress}/${funcUpdate}/${editingAccount.TenTaiKhoan}`, updatedAccount)
      await fetchAccounts()
      resetForm()
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi khi cập nhật tài khoản', message)
    }
  }

  // Hàm xử lý Import Excel
  const handleImportExcel = async (data) => {
    try {
      // Validate dữ liệu trước khi gửi
      const validationErrors = []

      data.forEach((row, index) => {
        const rowNumber = index + 2 // +2 vì Excel bắt đầu từ 1 và có header

        if (!row.TenHienThi || row.TenHienThi.trim() === '') {
          validationErrors.push(`Hàng ${rowNumber}: Thiếu tên hiển thị`)
        }

        if (!row.TenTaiKhoan || row.TenTaiKhoan.trim() === '') {
          validationErrors.push(`Hàng ${rowNumber}: Thiếu tên tài khoản`)
        }

        if (!row.CCCD || row.CCCD.trim() === '') {
          validationErrors.push(`Hàng ${rowNumber}: Thiếu CCCD`)
        } else if (row.CCCD.toString().length !== 12) {
          validationErrors.push(`Hàng ${rowNumber}: CCCD phải có 12 chữ số`)
        }

        if (!row.SDT || row.SDT.trim() === '') {
          validationErrors.push(`Hàng ${rowNumber}: Thiếu số điện thoại`)
        } else if (row.SDT.toString().length !== 10) {
          validationErrors.push(`Hàng ${rowNumber}: Số điện thoại phải có 10 chữ số`)
        }

        if (!row.MatKhau || row.MatKhau.trim() === '') {
          validationErrors.push(`Hàng ${rowNumber}: Thiếu mật khẩu`)
        }
      })

      if (validationErrors.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Dữ liệu không hợp lệ',
          html: `<div style="text-align: left;">
            <strong>Các lỗi cần sửa:</strong><br>
            ${validationErrors.slice(0, 10).map(error => `• ${error}`).join('<br>')}
            ${validationErrors.length > 10 ? `<br><strong>... và ${validationErrors.length - 10} lỗi khác</strong>` : ''}
          </div>`,
          confirmButtonColor: '#1976d2',
          width: '600px'
        })
        return
      }

      const results = []
      const errors = []

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2

        try {
          const accountData = {
            TenHienThi: row.TenHienThi.trim(),
            TenTaiKhoan: row.TenTaiKhoan.trim(),
            Loai: row.Loai || 'user',
            CCCD: row.CCCD.toString().trim(),
            SDT: row.SDT.toString().trim(),
            MatKhau: row.MatKhau.trim()
          }

          await API.post(`/${routeAddress}/${funcAdd}`, accountData)
          results.push({ rowNumber, success: true })
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định'
          errors.push({ rowNumber, error: errorMessage })
        }
      }

      if (errors.length === 0) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: `Đã nhập thành công ${results.length} tài khoản`,
          confirmButtonColor: '#1976d2'
        })
      } else if (results.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Tất cả bản ghi đều lỗi',
          html: `<div style="text-align: left;">
            <strong>Các lỗi:</strong><br>
            ${errors.slice(0, 5).map(e => `• Hàng ${e.rowNumber}: ${e.error}`).join('<br>')}
            ${errors.length > 5 ? `<br><strong>... và ${errors.length - 5} lỗi khác</strong>` : ''}
          </div>`,
          confirmButtonColor: '#1976d2',
          width: '600px'
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Hoàn thành với một số lỗi',
          html: `<div style="text-align: left;">
            <strong>Thành công:</strong> ${results.length} bản ghi<br>
            <strong>Lỗi:</strong> ${errors.length} bản ghi<br><br>
            <strong>Các lỗi:</strong><br>
            ${errors.slice(0, 5).map(e => `• Hàng ${e.rowNumber}: ${e.error}`).join('<br>')}
            ${errors.length > 5 ? `<br><strong>... và ${errors.length - 5} lỗi khác</strong>` : ''}
          </div>`,
          confirmButtonColor: '#1976d2',
          width: '600px'
        })
      }

      fetchAccounts()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi nhập dữ liệu',
        text: 'Có lỗi hệ thống xảy ra',
        confirmButtonColor: '#1976d2'
      })
    }
  }

  const handleOpenImportExcel = () => {
    setImportExcelOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận xóa?',
        text: 'Hành động này sẽ xóa tài khoản khỏi hệ thống.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      })

      if (result.isConfirmed) {
        await API.delete(`/${routeAddress}/${funcDelete}/${id}`)
        await fetchAccounts()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Vui lòng thử lại sau.'
      showError('Lỗi khi xóa tài khoản', message)
    }
  }

  const handleEdit = (row) => {
    setEditingAccount(row)
    SetTenHienThi(row.TenHienThi)
    SetTenTaiKhoan(row.TenTaiKhoan)
    SetCCCD(row.CCCD || '')
    SetSDT(row.SDT || '')
    SetMatKhau(row.MatKhau)
    SetLoai(row.Loai)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ===== Cấu hình cột bảng =====
  const columns = [
    { label: 'Tên', key: 'TenHienThi' },
    { label: 'Căn cước', key: 'CCCD' },
    { label: 'Số điện thoại', key: 'SDT' },
    { label: 'Tài khoản', key: 'TenTaiKhoan' },
    { label: 'Vai trò', key: 'Loai' },
    { label: 'Mật khẩu', key: 'MatKhau' },

    // Hiển thị tên + nút ở cuối ô, mỗi tên xuống dòng và bọc [ ]
    {
      label: 'Khóa học đã tham gia',
      key: 'KhoaHocDaThamGia',
      align: 'left',
      render: (value, row) => {
        const names = toCourseNames(row.KhoaHocDaThamGia)
        return renderListWithButton(names, () => handleOpenModal('KhoaHocDaThamGia', row))
      }
    },
    {
      label: 'Kỳ thi đã tham gia',
      key: 'KyThiDaThamGia',
      align: 'left',
      render: (value, row) => {
        const names = toExamNames(row.KyThiDaThamGia)
        return renderListWithButton(names, () => handleOpenModal('KyThiDaThamGia', row))
      }
    },
    {
      label: 'Chứng chỉ đã nhận',
      key: 'ChungChiDaNhan',
      align: 'left',
      render: (value, row) => {
        const names = certNamesByUser[row._id]?.daNhan || []
        return renderListWithButton(names, () => handleOpenModal('ChungChiDaNhan', row))
      }
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
      key: 'TenHienThi',
      label: 'Tên người dùng',
      type: 'text'
    },
    {
      key: 'TenTaiKhoan',
      label: 'Tên tài khoản',
      type: 'text'
    },
    {
      key: 'Loai',
      label: 'Vai trò',
      type: 'select',
      options: [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
      ]
    },
    { key: 'CCCD', label: 'CCCD', type: 'text' },
    { key: 'SDT', label: 'Số điện thoại', type: 'text' },
    { key: 'MatKhau', label: 'Mật khẩu', type: 'text' }
  ]

  return (
    <>
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
        FormName={AccountForm}
        onImportExcel={handleOpenImportExcel}
      />
      <RelatedDataModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        dataNeeded={modalAccountName}
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
        columnsCanEdit={columnsCanEdit}
        pageContent={pageContent}
      />
    </>
  )
}

export default QLNguoiDung
