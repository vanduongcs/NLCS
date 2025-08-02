import React from 'react'
import API from '../../api.jsx'

// Hàm tổng quát fetch lịch sử thay đổi cho bất kỳ collection nào
export async function fetchCollectionHistory({
  apiPath,
  id,
  getFieldDisplayName,
  formatHistoryValue,
  setModalData
}) {
  try {
    const response = await API.get(`${apiPath}/${id}`)
    const historyData = response.data
    const formattedHistory = []

    if (historyData?.DSTruongDLThayDoi) {
      historyData.DSTruongDLThayDoi.forEach(change => {
        if (change.ChiTietThayDoi && change.ChiTietThayDoi.length > 0) {
          change.ChiTietThayDoi.forEach(detail => {
            formattedHistory.push({
              _id: `${change._id || Math.random()}_${detail._id || Math.random()}`,
              KieuThayDoi: change.KieuThayDoi,
              ThoiGian: change.ThoiGian,
              TruongDLThayDoi: getFieldDisplayName(detail.TruongDLThayDoi) || 'Tạo mới',
              DLTruoc: formatHistoryValue(detail.DLTruoc, detail.TruongDLThayDoi),
              DLSau: formatHistoryValue(detail.DLSau, detail.TruongDLThayDoi)
            })
          })
        }
      })
    }

    setModalData(formattedHistory)
  } catch (error) {
    console.error('Lỗi khi tải lịch sử:', error)
    setModalData([])
  }
}

export default fetchCollectionHistory
