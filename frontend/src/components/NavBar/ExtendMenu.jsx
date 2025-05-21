import React from 'react'
import Box from '@mui/material/Box'
import DehazeIcon from '@mui/icons-material/Dehaze'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Drawer from '@mui/material/Drawer'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import { useNavigate } from 'react-router-dom'

const menuItems = [
  {text: 'Trang chủ', path: '/'},
  {text: 'Đợt thi', path: 'dot-thi'},
  {text: 'Lịch khai giảng', path: 'lich-khai-giang'},
  {text: 'Đăng ký khóa ôn', path: 'dang-ky-khoa-on'},
  {text: 'Đăng ký thi', path: 'dang-ky-thi'},
  {text: 'Kết quả', path: 'ket-qua'},
  {text: 'Xác thực chứng chỉ', path: 'xac-thuc-chung-chi'},
  {text: 'Thông tin chung', path: 'thong-tin-chung'}
]

function ExtendMenu() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const navList = (
    <Box sx={{ width: 250, position: 'relative' }} role="presentation" onClick={toggleDrawer(false)}>
      <IconButton
        onClick={toggleDrawer(false)}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
        aria-label="close drawer"
      >
        <CloseIcon />
      </IconButton>
      <List
        sx={{ mt: 6 }}  
      >
        {menuItems.map(({ text, path }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(path)
                setOpen(false)
              }}
            >
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box>
      <Button
        onClick={toggleDrawer(true)}
        sx={{
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'transparent',
          },
          '&:active': {
            backgroundColor: 'transparent',
          }
        }}
      >
        <DehazeIcon sx={{color: '#f5f6fa'}}/>
      </Button>
      <Drawer
        open={open} 
        onClose={toggleDrawer(false)}
        sx={{
          opacity: 0.95
        }}
      >
        {navList}
      </Drawer>
    </Box>
  )
}

export default ExtendMenu
