const mongoose = require('mongoose');

const STATUSES = ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng'];

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: [true, 'deviceId là bắt buộc'], unique: true, trim: true },
    name: { type: String, required: [true, 'name là bắt buộc'], trim: true },
    deviceType: { type: String, required: [true, 'deviceType là bắt buộc'], trim: true },
    room: { type: String, required: [true, 'room là bắt buộc'], trim: true },
    brand: { type: String, trim: true, default: '' },
    model: { type: String, trim: true, default: '' },
    quantity: { type: Number, required: [true, 'quantity là bắt buộc'], min: [0, 'quantity phải >= 0'], default: 1 },
    status: { type: String, enum: { values: STATUSES, message: 'status không hợp lệ' }, default: 'Đang sử dụng' },
    purchaseDate: { type: Date },
    description: { type: String, default: '' },
  },
  { timestamps: true, collection: 'devices' }
);

module.exports = mongoose.model('Device', deviceSchema);
module.exports.STATUSES = STATUSES;
