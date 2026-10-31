
import { useEffect, useState } from "react";
import {
  Monitor, Plus, Pencil, Trash2, Search,
  RefreshCw, Package, CheckCircle, Wrench, X
} from "lucide-react";
import "./App.css";

const API = "/api/devices";

const initialForm = {
  deviceId: "",
  name: "",
  deviceType: "",
  brand: "",
  model: "",
  room: "",
  quantity: 1,
  status: "Đang sử dụng",
  description: "",
  purchaseDate: ""
};

export default function App() {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadDevices() {
    setLoading(true);
    try {
      const response = await fetch(API);
      if (!response.ok) {
        throw new Error(`Lỗi tải dữ liệu: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("API không trả về danh sách thiết bị");
      }
      setDevices(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function handleEdit(device) {
    setEditingId(device._id);
    setForm({
      deviceId: device.deviceId || "",
      name: device.name || "",
      deviceType: device.deviceType || "",
      brand: device.brand || "",
      model: device.model || "",
      room: device.room || "",
      quantity: device.quantity ?? 1,
      status: device.status || "Đang sử dụng",
      description: device.description || "",
      purchaseDate: device.purchaseDate
        ? String(device.purchaseDate).slice(0, 10)
        : ""
    });

    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity)
      };

      if (!payload.purchaseDate) {
        delete payload.purchaseDate;
      }

      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || data.message || "Không thể lưu thiết bị"
        );
      }

      setMessage(
        editingId
          ? "Cập nhật thiết bị thành công!"
          : "Thêm thiết bị thành công!"
      );

      resetForm();
      await loadDevices();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(device) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa thiết bị "${device.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${device._id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Không thể xóa thiết bị");
      }

      setMessage("Xóa thiết bị thành công!");
      await loadDevices();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredDevices = devices.filter(device => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch = [
      device.deviceId,
      device.name,
      device.deviceType,
      device.brand,
      device.model,
      device.room
    ].some(value =>
      String(value || "").toLowerCase().includes(keyword)
    );

    const matchesStatus =
      statusFilter === "Tất cả" ||
      device.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalQuantity = devices.reduce(
    (sum, device) => sum + Number(device.quantity || 0),
    0
  );

  const activeCount = devices.filter(
    device => device.status === "Đang sử dụng"
  ).length;

  const repairCount = devices.filter(
    device => device.status === "Đang sửa chữa"
  ).length;

  return (
    <div className="layout">
      <header>
        <div className="header-content">
          <div className="header-title">
            <Monitor size={34} />
            <div>
              <h1>QUẢN LÝ THIẾT BỊ PHÒNG HỌC</h1>
              <p>
                Hệ thống quản lý thiết bị trên nền tảng đám mây
              </p>
            </div>
          </div>

          <div className="student-info">
            <strong>Tô Chí Vĩ</strong>
            <span>MSSV: 235594</span>
          </div>
        </div>
      </header>

      <main>
        <div className="stats-grid">
          <div className="stat-card">
            <Package size={28} />
            <div>
              <span>Tổng loại thiết bị</span>
              <h2>{devices.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <Monitor size={28} />
            <div>
              <span>Tổng số lượng</span>
              <h2>{totalQuantity}</h2>
            </div>
          </div>

          <div className="stat-card">
            <CheckCircle size={28} />
            <div>
              <span>Đang sử dụng</span>
              <h2>{activeCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <Wrench size={28} />
            <div>
              <span>Đang sửa chữa</span>
              <h2>{repairCount}</h2>
            </div>
          </div>
        </div>

        {error && (
          <div className="error">
            <strong>Lỗi:</strong> {error}
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {message && (
          <div className="success">
            {message}
            <button onClick={() => setMessage("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <section className="card">
          <div className="section-head">
            <h2>
              {editingId
                ? "Chỉnh sửa thông tin thiết bị"
                : "Thêm thiết bị mới"}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Mã thiết bị *
                <input
                  name="deviceId"
                  value={form.deviceId}
                  onChange={handleChange}
                  placeholder="VD: TB004"
                  required
                />
              </label>

              <label>
                Tên thiết bị *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="VD: Máy chiếu Epson"
                  required
                />
              </label>

              <label>
                Loại thiết bị
                <input
                  name="deviceType"
                  value={form.deviceType}
                  onChange={handleChange}
                  placeholder="VD: Máy chiếu"
                />
              </label>

              <label>
                Thương hiệu
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="VD: Epson"
                />
              </label>

              <label>
                Model
                <input
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="VD: EB-X06"
                />
              </label>

              <label>
                Phòng học
                <input
                  name="room"
                  value={form.room}
                  onChange={handleChange}
                  placeholder="VD: A101"
                />
              </label>

              <label>
                Số lượng
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Tình trạng
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option>Đang sử dụng</option>
                  <option>Đang sửa chữa</option>
                  <option>Chưa sử dụng</option>
                  <option>Đã thanh lý</option>
                </select>
              </label>

              <label>
                Ngày mua
                <input
                  type="date"
                  name="purchaseDate"
                  value={form.purchaseDate}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label>
              Mô tả thiết bị
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Nhập thông tin mô tả..."
                rows="3"
              />
            </label>

            <div className="actions">
              <button type="submit" disabled={saving}>
                {editingId
                  ? <Pencil size={18} />
                  : <Plus size={18} />}
                {saving
                  ? "Đang lưu..."
                  : editingId
                    ? "Lưu thay đổi"
                    : "Thêm thiết bị"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary"
                  onClick={resetForm}
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="card">
          <div className="section-head">
            <h2>Danh sách thiết bị ({filteredDevices.length})</h2>

            <button
              type="button"
              className="secondary"
              onClick={loadDevices}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Làm mới
            </button>
          </div>

          <div className="toolbar">
            <div className="search">
              <Search size={18} />
              <input
                placeholder="Tìm mã, tên, phòng học..."
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={event =>
                setStatusFilter(event.target.value)
              }
            >
              <option>Tất cả</option>
              <option>Đang sử dụng</option>
              <option>Đang sửa chữa</option>
              <option>Chưa sử dụng</option>
              <option>Đã thanh lý</option>
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã thiết bị</th>
                  <th>Tên thiết bị</th>
                  <th>Loại</th>
                  <th>Thương hiệu</th>
                  <th>Phòng</th>
                  <th>Số lượng</th>
                  <th>Tình trạng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredDevices.map((device, index) => (
                  <tr key={device._id}>
                    <td>{index + 1}</td>
                    <td>{device.deviceId}</td>
                    <td>
                      <strong>{device.name}</strong>
                      {device.model && (
                        <div className="model">
                          {device.model}
                        </div>
                      )}
                    </td>
                    <td>{device.deviceType || "—"}</td>
                    <td>{device.brand || "—"}</td>
                    <td>{device.room || "—"}</td>
                    <td>{device.quantity}</td>
                    <td>
                      <span className="status">
                        {device.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="edit"
                          title="Chỉnh sửa"
                          onClick={() => handleEdit(device)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="delete"
                          title="Xóa thiết bị"
                          onClick={() => handleDelete(device)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <p className="empty">Đang tải dữ liệu...</p>
            )}

            {!loading && filteredDevices.length === 0 && (
              <p className="empty">
                Không tìm thấy thiết bị phù hợp.
              </p>
            )}
          </div>
        </section>

        <footer>
          Hệ thống quản lý thiết bị phòng học |
          Tô Chí Vĩ – 235594
        </footer>
      </main>
    </div>
  );
}
