import { useEffect } from 'react';
import Box from '@mui/material/Box';
import { Typography, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LanguageIcon from '@mui/icons-material/Language';
import PeopleIcon from '@mui/icons-material/People';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SettingsIcon from '@mui/icons-material/Settings';
import ComputerIcon from '@mui/icons-material/Computer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EventIcon from '@mui/icons-material/Event'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip'

function TrangChu() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        p: 2,
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          width: '100%',
          maxWidth: '1500px',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          p: 3,
        }}
      >
        <Box sx={{ width: '50%' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#003366' }}>
            Trung tâm ngoại ngữ - tin học
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Tổ chức ôn luyện bài bản, sát với nội dung thi thực tế.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Hỗ trợ đăng ký, xác minh chứng chỉ nhanh chóng, tiện lợi.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Nền tảng trực tuyến, tài liệu bổ sung, giảng viên chuyên nghiệp hỗ trợ học viên 24/7.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              m: 3,
              padding: '10px 20px',
              fontWeight: 'bold',
              borderRadius: '5px',
            }}
            onClick={() => navigate('/lich-thi')}
          >
            Xem lịch thi
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              m: 3,
              padding: '10px 20px',
              fontWeight: 'bold',
              borderRadius: '5px',
            }}
            onClick={() => navigate('/lich-khai-giang')}
          >
            Xem lịch khai giảng
          </Button>
        </Box>

        <Box sx={{ width: '40%' }}>
          <img
            src="/public/HomePageBanner.png"
            alt="Banner"
            style={{
              height: '350px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        </Box>
      </Box>

      {/* Menu 6 cụm ButtonIcon */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column', // Các hàng ButtonIcon theo cột
          width: '100%',
          maxWidth: '1500px',
          m: 8,
        }}
      >
        {/* Hàng trên 3 cụm ButtonIcon */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row', // Các cụm ButtonIcon nằm ngang
            justifyContent: 'space-around',
            width: '100%',
            mb: 4, // Khoảng cách giữa các hàng
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/chung-chi-ngoai-ngu')}
              sx={{
                display: 'block',
                textAlign: 'center',
                cursor: 'pointer', // Chỉ giữ lại hiệu ứng con trỏ
              }}
            >
              <LanguageIcon sx={{ fontSize: 128, color: (theme) => theme.palette.info.main }} />
            </IconButton>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>Chứng chỉ ngoại ngữ</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/lich-khai-giang')}
              sx={{
                display: 'block',
                textAlign: 'center',
                cursor: 'pointer', // Chỉ giữ lại hiệu ứng con trỏ
              }}
            >
              <CalendarMonthIcon sx={{ fontSize: 128, color: (theme) => theme.palette.info.main }} />
            </IconButton>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>Lịch khai giảng</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/ket-qua')}
              sx={{
                display: 'block',
                textAlign: 'center',
                cursor: 'pointer', // Chỉ giữ lại hiệu ứng con trỏ
              }}
            >
              <MyLocationIcon sx={{ fontSize: 128, color: (theme) => theme.palette.info.main }} />
            </IconButton>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>Kết quả</Typography>
          </Box>
        </Box>

        {/* Hàng dưới 3 cụm ButtonIcon */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row', // Các cụm ButtonIcon nằm ngang
            justifyContent: 'space-around',
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
            onClick={() => navigate('/chung-chi-tin-hoc')}
              sx={{
                display: 'block',
                textAlign: 'center',
                cursor: 'pointer', // Chỉ giữ lại hiệu ứng con trỏ
              }}
            >
              <ComputerIcon sx={{ fontSize: 128, color: (theme) => theme.palette.info.main }} />
            </IconButton>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>Chứng chỉ tin học</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/lich-thi')}
              sx={{
                display: 'block',
                textAlign: 'center',
                cursor: 'pointer', // Chỉ giữ lại hiệu ứng con trỏ
              }}
            >
              <EventIcon sx={{ fontSize: 128, color: (theme) => theme.palette.info.main }} />
            </IconButton>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>Lịch thi</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/xac-thuc-chung-chi')}
              sx={{
                display: 'block',
                textAlign: 'center',
                cursor: 'pointer', // Chỉ giữ lại hiệu ứng con trỏ
              }}
            >
              <PrivacyTipIcon sx={{ fontSize: 128, color: (theme) => theme.palette.info.main }} />
            </IconButton>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>Xác thực</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default TrangChu;
