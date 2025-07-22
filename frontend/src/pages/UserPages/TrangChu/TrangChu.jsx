// MUI
import Box from '@mui/material/Box'

// MUI Icon
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EventIcon from '@mui/icons-material/Event'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip'

// Custome
import TCBanner from './TCBanner'
import MenuItem from './MenuItem'

function TrangChu() {

  const PageStyle = {
    width: '100%',
    bgcolor: (theme) => theme.palette.background.default,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    p: 2,
  }

  const MenuStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1500px',
    m: 8
  }

  const MenuRowStyle = {
    display: 'flex',
    flexDirection: 'row', 
    justifyContent: 'space-around',
    width: '100%',
    mb: 4
  }

  return (
    <Box sx={ PageStyle }>
      <TCBanner />

      {/* Menu */}
      <Box sx={ MenuStyle }>
        {/* Hàng trên */}
        <Box sx={ MenuRowStyle }>

          <MenuItem 
            IconComponent = { CalendarMonthIcon } 
            Content = 'Lịch khai giảng' 
            Route = '/lich-khai-giang'
          />

          <MenuItem 
            IconComponent = { MyLocationIcon } 
            Content = 'Kết quả' 
            Route = '/ket-qua' 
          />

        </Box>

        {/* Hàng dưới*/}
        <Box sx={ MenuRowStyle }>

          <MenuItem 
            IconComponent = { EventIcon } 
            Content = 'Lịch thi' 
            Route = '/lich-thi'
          />
          
          <MenuItem 
            IconComponent = { PrivacyTipIcon } 
            Content = 'Xác thực' 
            Route = '/xac-thuc-chung-chi'
          />

        </Box>
      </Box>
    </Box>
  )
}

export default TrangChu
