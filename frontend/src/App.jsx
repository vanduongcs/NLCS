import { useEffect, useState } from 'react'
import './App.css'
import Box from '@mui/material/Box'

import MUITable from '../data/Cert/MUITable.jsx'

function App() {
  const [certificates, setCertificates] = useState([])

  const fetchItems = () => {
    fetch('http://localhost:2025/api/certificates')
      .then(res => res.json())
      .then(data => setCertificates(data))
      .catch(err => console.error('Lỗi khi fetch:', err));
  }

  useEffect(() => {
    fetchItems();
  }, [])

  return (
    <Box>
      <MUITable certificates = { certificates }/>
    </ Box>
  )
}

export default App
