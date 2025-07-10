import jwt from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
  const authHeader = req.header('authorization') || req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yêu cầu truy cập không hợp lệ' })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Yêu cầu truy cập không hợp lệ' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.account = decoded
    next()
  } catch (error) {
    return res.status(400).json({ message: 'Token không hợp lệ' })
  }
}

export default verifyToken