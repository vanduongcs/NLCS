import Course from '../models/Course.js';
import Certificate from '../models/Certificate.js';
import Account from '../models/Account.js';
import CourseHistory from '../models/CourseHistory.js';

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

    const history = new CourseHistory({
      IDKhoaOn: newCourse._id,
      DSTruongDLThayDoi: [{
        KieuThayDoi: 'Thêm',
        ThoiGian: new Date(),
        ChiTietThayDoi: [{
          TruongDLThayDoi: null,
          DLTruoc: null,
          DLSau: null
        }]
      }]
    });

    await history.save();
    res.status(201).json({ message: 'Thêm khóa ôn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const getCourse = async (req, res) => {
  try {
    const { id } = req.params
    const course = await Course.findById(id).populate('IDChungChi');
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học', error: 'KHONG_TIM_THAY' });

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}

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
    const { IDChungChi, NgayKhaiGiang, IDTaiKhoan, NgayKetThuc, Buoi, SiSoToiDa, LichHoc } = req.body;

    const allowedFields = ['IDChungChi', 'NgayKhaiGiang', 'IDTaiKhoan', 'NgayKetThuc', 'Buoi', 'SiSoToiDa', 'LichHoc']

    // Lấy thông tin course hiện tại
    const oldCourse = await Course.findById(id);
    if (!oldCourse) return res.status(404).json({ message: 'Không tìm thấy khóa học để cập nhật', error: 'KHONG_TIM_THAY' });

    // Tạo object update chỉ với những field được gửi
    const updateData = {}

    if (IDChungChi !== undefined) {
      const cert = await Certificate.findById(IDChungChi);
      if (!cert) return res.status(404).json({ message: 'Không tìm thấy chứng chỉ', error: 'KHONG_TIM_THAY' });
      updateData.IDChungChi = IDChungChi
    }

    if (IDTaiKhoan !== undefined) {
      // Kiểm tra danh sách tài khoản có tài khoản nào không hợp lệ không
      if (IDTaiKhoan.length > 0) {
        const validAccounts = await Account.find({ _id: { $in: IDTaiKhoan } })
        if (validAccounts.length !== IDTaiKhoan.length) {
          return res.status(400).json({
            message: 'Danh sách tài khoản không hợp lệ',
            error: 'DANH_SACH_TAI_KHOAN_KHONG_HOP_LE'
          })
        }
      }
      updateData.IDTaiKhoan = IDTaiKhoan
      updateData.SiSoHienTai = IDTaiKhoan.length
    }

    if (NgayKhaiGiang !== undefined) {
      updateData.NgayKhaiGiang = NgayKhaiGiang
    }

    if (NgayKetThuc !== undefined) {
      updateData.NgayKetThuc = NgayKetThuc
    }

    if (Buoi !== undefined) {
      updateData.Buoi = Buoi
    }

    if (SiSoToiDa !== undefined) {
      updateData.SiSoToiDa = SiSoToiDa
    }

    if (LichHoc !== undefined) {
      updateData.LichHoc = LichHoc
    }

    // Kiểm tra ngày khai giảng và kết thúc
    const finalNgayKhaiGiang = NgayKhaiGiang || oldCourse.NgayKhaiGiang
    const finalNgayKetThuc = NgayKetThuc || oldCourse.NgayKetThuc

    if (finalNgayKhaiGiang > finalNgayKetThuc) {
      return res.status(400).json({ message: 'Ngày khai giảng phải nhỏ hơn ngày kết thúc', error: 'SAI_MIEN_GIA_TRI' })
    }

    // Kiểm tra sĩ số tối đa so với sĩ số hiện tại
    const finalIDTaiKhoan = IDTaiKhoan !== undefined ? IDTaiKhoan : oldCourse.IDTaiKhoan
    const finalSiSoToiDa = SiSoToiDa !== undefined ? SiSoToiDa : oldCourse.SiSoToiDa

    if (finalSiSoToiDa < finalIDTaiKhoan.length) {
      return res.status(400).json({
        message: 'Sĩ số tối đa không thể nhỏ hơn sĩ số hiện tại',
        error: 'SI_SO_TOI_DA_KHONG_HOP_LE'
      });
    }

    // Tạo tên khóa học mới nếu có thay đổi về chứng chỉ, ngày khai giảng hoặc buổi
    if (NgayKhaiGiang !== undefined || Buoi !== undefined || IDChungChi !== undefined) {
      const finalIDChungChi = IDChungChi || oldCourse.IDChungChi
      const finalBuoi = Buoi || oldCourse.Buoi

      const certificate = await Certificate.findById(finalIDChungChi);

      // Đếm số lượng khóa học trùng điều kiện
      const existingCoursesCount = await Course.countDocuments({
        IDChungChi: finalIDChungChi,
        Buoi: finalBuoi,
        NgayKhaiGiang: {
          $gte: new Date(finalNgayKhaiGiang).setHours(0, 0, 0, 0),
          $lt: new Date(finalNgayKhaiGiang).setHours(23, 59, 59, 999)
        },
        _id: { $ne: id } // Loại trừ khóa học hiện tại
      });

      updateData.TenKhoaHoc = `${certificate.TenChungChi}-${formatDate(finalNgayKhaiGiang)}-${finalBuoi.charAt(0).toUpperCase()}${existingCoursesCount + 1}`;
    }

    // Cập nhật khóa học
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    const oldAccount = await Account.findById(updatedCourse.IDTaiKhoan)
    if (!oldAccount) return res.status(404).json({ message: 'Không tìm thấy tài khoản liên kết', error: 'KHONG_TIM_THAY' });

    // Cập nhật tài khoản liên kết
    if (IDTaiKhoan !== undefined) {
      const addedCourses = finalIDTaiKhoan.filter(id => !oldAccount.KhoaHocDaThamGia.includes(id));
      const removedCourses = oldAccount.KhoaHocDaThamGia.filter(id => !finalIDTaiKhoan.includes(id));
      if (addedCourses.length > 0) {
        await Account.updateMany(
          { _id: { $in: addedCourses } },
          { $addToSet: { KhoaHocDaThamGia: updatedCourse._id } }
        );
      }
      if (removedCourses.length > 0) {
        await Account.updateMany(
          { _id: { $in: removedCourses } },
          { $pull: { KhoaHocDaThamGia: updatedCourse._id } }
        );
      }
    }

    // Cập nhật lịch sử thay đổi
    const history = await CourseHistory.findOne({ IDKhoaOn: id });
    if (history) {
      const chiTietThayDoi = [];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined && oldCourse[field]?.toString() !== updatedCourse[field]?.toString()) {
          chiTietThayDoi.push({
            TruongDLThayDoi: field,
            DLTruoc: oldCourse[field],
            DLSau: updatedCourse[field]
          });
        }
      });

      if (chiTietThayDoi.length > 0) {
        await history.updateOne({
          $push: {
            DSTruongDLThayDoi: {
              KieuThayDoi: 'Sửa',
              ThoiGian: new Date(),
              ChiTietThayDoi: chiTietThayDoi
            }
          }
        });
      }
    }

    res.status(200).json({ message: 'Cập nhật khóa ôn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa khóa học
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params
    const course = await Course.findById(id)
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học để xóa', error: 'KHONG_TIM_THAY' });

    const hasData = course.IDTaiKhoan.length > 0
    if (hasData) {
      return res.status(400).json({ message: 'Không thể xóa khóa học còn liên kết dữ liệu', error: 'KHONG_THE_XOA' })
    }

    const history = await CourseHistory.findOne({ IDKhoaOn: id });
    if (history) {
      await history.deleteOne();
    }
    await Course.findByIdAndDelete(id)

    res.status(200).json({ message: 'Xóa khóa ôn thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export default {
  addCourse,
  getCourse,
  getCourses,
  updateCourse,
  deleteCourse
};
