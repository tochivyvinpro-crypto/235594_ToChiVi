require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('./src/models/Device');

const data = [
  { deviceId: 'TB001', name: 'Máy chiếu Epson EB-X06', deviceType: 'Máy chiếu', room: 'A101', brand: 'Epson', model: 'EB-X06', quantity: 1, status: 'Đang sử dụng', purchaseDate: '2023-08-15', description: 'Máy chiếu phòng học A101' },
  { deviceId: 'TB002', name: 'Máy tính Dell OptiPlex 3080', deviceType: 'Máy tính', room: 'B203', brand: 'Dell', model: 'OptiPlex 3080', quantity: 30, status: 'Đang sử dụng', purchaseDate: '2022-09-01', description: 'Máy tính phòng thực hành B203' },
  { deviceId: 'TB003', name: 'Loa kéo Bose S1 Pro', deviceType: 'Thiết bị âm thanh', room: 'A102', brand: 'Bose', model: 'S1 Pro', quantity: 2, status: 'Đang sửa chữa', purchaseDate: '2024-01-10', description: 'Loa bị rè, đang bảo hành' },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const d of data) await Device.updateOne({ deviceId: d.deviceId }, { $set: d }, { upsert: true });
  console.log('Đã thêm dữ liệu mẫu');
  await mongoose.disconnect();
})();
