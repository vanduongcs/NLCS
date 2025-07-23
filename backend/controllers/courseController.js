import Course from '../models/Course.js';
import Certificate from '../models/Certificate.js';
import Account from '../models/Account.js';

// Hàm định dạng ngày
const formatDate = (date) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}${d.getFullYear()}`;
};

// Thêm khóa học
const addCourse = async (req, res) => {
  try {
    const { IDChungChi, NgayKhaiGiang, NgayKetThuc, Buoi, SiSoToiDa, LichHoc } = req.body;

    if (NgayKhaiGiang > NgayKetThuc) {
      return res.status(400).json({ message: 'Ngày khai giảng phải nhỏ hơn ngày kết thúc', error: 'SAI_MIEN_GIA_TRI' })
    }

    const certificate = await Certificate.findById(IDChungChi);

    if (!certificate) return res.status(404).json({ message: 'Không tìm thấy chứng chỉ', error: 'KHONG_TIM_THAY' });

    // Đếm số lượng khóa học trùng điều kiện
    const existingCoursesCount = await Course.countDocuments({
      IDChungChi: IDChungChi,
      Buoi: Buoi,
      NgayKhaiGiang: {
        $gte: new Date(NgayKhaiGiang).setHours(0, 0, 0, 0),
        $lt: new Date(NgayKhaiGiang).setHours(23, 59, 59, 999)
      }
    });

    const TenKhoaHoc = `${certificate.TenChungChi}-${formatDate(NgayKhaiGiang)}-${Buoi.charAt(0).toUpperCase()}${existingCoursesCount + 1}`;
    
    const newCourse = new Course({ 
      IDChungChi, 
      TenKhoaHoc, 
      NgayKhaiGiang, 
      NgayKetThuc, 
      Buoi, 
      SiSoToiDa, 
      LichHoc,
      SiSoHienTai: 0 
    });

    await newCourse.save();
    res.status(201).json({ message: 'Thêm khóa ôn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách khóa học
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('IDChungChi');
    res.status(200).json(courses);
  } catch (error) {
    console.error('Lỗi lấy khóa ôn:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật khóa học
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { IDChungChi, NgayKhaiGiang, NgayKetThuc, Buoi, SiSoToiDa, LichHoc } = req.body;

    if (NgayKhaiGiang > NgayKetThuc) {
      return res.status(400).json({ message: 'Ngày khai giảng phải nhỏ hơn ngày kết thúc', error: 'SAI_MIEN_GIA_TRI' })
    }

    // Đếm số lượng khóa học trùng điều kiện
    const existingCoursesCount = await Course.countDocuments({
      IDChungChi: IDChungChi,
      Buoi: Buoi,
      NgayKhaiGiang: {
        $gte: new Date(NgayKhaiGiang).setHours(0, 0, 0, 0),
        $lt: new Date(NgayKhaiGiang).setHours(23, 59, 59, 999)
      },
      _id: { $ne: id } // Loại trừ khóa học hiện tại
    });

    const certificate = await Certificate.findById(IDChungChi);
    const TenKhoaHoc = `${certificate.TenChungChi}-${formatDate(NgayKhaiGiang)}-${Buoi.charAt(0).toUpperCase()}${existingCoursesCount + 1}`;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { 
        IDChungChi, 
        TenKhoaHoc, 
        NgayKhaiGiang, 
        NgayKetThuc, 
        Buoi, 
        SiSoToiDa, 
        LichHoc 
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCourse);
  } catch (error) {
    // console.error('Lỗi cập nhật khóa ôn:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa khóa học
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem khóa học có trong KhoaHocDaThamGia không
    const accountWithCourse = await Account.findOne({ KhoaHocDaThamGia: id });
    
    if (accountWithCourse) {
      return res.status(400).json({ message: 'Không thể xóa. Khóa học đã được đăng ký bởi học viên.', error: 'CO_RANG_BUOC' });
    }

    // Tiến hành xóa
    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học để xóa', error: 'KHONG_TIM_THAY' })
    }

    res.status(200).json({ message: 'Xóa khóa ôn thành công' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export default {
  addCourse,
  getCourses,
  updateCourse,
  deleteCourse
};
