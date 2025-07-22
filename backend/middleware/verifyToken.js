import jwt from 'jsonwebtoken';
import Account from '../models/Account.js';

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Thiếu token hoặc sai định dạng' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Kiểm tra ID có tồn tại trong MongoDB
        const account = await Account.findById(decoded.id);
        if (!account) {
            return res.status(401).json({ message: 'Token hợp lệ nhưng tài khoản không tồn tại' });
        }

        req.account = account;
        next();
    } catch (error) {
        console.error('Token lỗi:', error.name, error.message);
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

export default verifyToken;
