import { useEffect, useState } from "react";

// กำหนดโครงสร้างข้อมูลมอเตอร์ไซค์
type Motorcycle = {
  id?: string;  // รหัสจาก Firebase (มีหรือไม่มีก็ได้)
  motorcycleName: string;  // ชื่อรุ่น
  motorcycleBrand: string;  // ยี่ห้อ
  motorcyclePrice: number;  // ราคา
  motorcycleAvailable: boolean;  // มีสินค้าหรือไม่
  motorcycleImage: string;  // URL รูปภาพ
};

export default function Home() {
  // สร้างตัวแปรเก็บข้อมูล
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);  // เก็บรายการมอเตอร์ไซค์ทั้งหมด
  const [form, setForm] = useState<Motorcycle>({  // เก็บข้อมูลในฟอร์ม
    motorcycleName: "",
    motorcycleBrand: "",
    motorcyclePrice: 0,
    motorcycleAvailable: true,
    motorcycleImage: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);  // เก็บ id ที่กำลังแก้ไข (null = กำลังเพิ่มใหม่)

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchMotorcycles = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/motorcycles");  // เรียก API GET
      const data = await res.json();  // แปลงเป็น JSON
      setMotorcycles(data);  // เก็บข้อมูลใน state
    } catch (err) {
      console.error("❌ ดึงข้อมูลไม่สำเร็จ:", err);
    }
  };

  // เมื่อหน้าเว็บโหลดครั้งแรก ให้ดึงข้อมูล
  useEffect(() => { fetchMotorcycles(); }, []);

  // ฟังก์ชันส่งข้อมูลฟอร์ม (เพิ่มหรือแก้ไข)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // ป้องกันหน้าเว็บรีเฟรช
    
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:3001/api/motorcycles/${editingId}`
      : "http://localhost:3001/api/motorcycles";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setForm({ motorcycleName: "", motorcycleBrand: "", motorcyclePrice: 0, motorcycleAvailable: true, motorcycleImage: "" });
      setEditingId(null);
      fetchMotorcycles();
    } catch (err) {
      console.error("❌ บันทึกข้อมูลไม่สำเร็จ:", err);
    }
  };

  // ฟังก์ชันเมื่อกดปุ่มแก้ไข
  const handleEdit = (item: Motorcycle) => {
    setForm(item);
    setEditingId(item.id || null);
  };

  // ฟังก์ชันเมื่อกดปุ่มลบ
  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/motorcycles/${id}`, { method: "DELETE" });
      fetchMotorcycles();
    } catch (err) {
      console.error("❌ ลบข้อมูลไม่สำเร็จ:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-800">ระบบจัดการมอเตอร์ไซค์</h1>

      {/* ฟอร์มเพิ่ม/แก้ไข */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "แก้ไขข้อมูล" : "เพิ่มข้อมูลใหม่"}</h2>

        <input
          type="text"
          placeholder="ชื่อรุ่น"
          value={form.motorcycleName}
          onChange={(e) => setForm({ ...form, motorcycleName: e.target.value })}
          className="w-full border p-2 rounded mb-3"
          required
        />
        <input
          type="text"
          placeholder="ยี่ห้อ"
          value={form.motorcycleBrand}
          onChange={(e) => setForm({ ...form, motorcycleBrand: e.target.value })}
          className="w-full border p-2 rounded mb-3"
          required
        />
        <input
          type="number"
          placeholder="ราคา"
          value={form.motorcyclePrice}
          onChange={(e) => setForm({ ...form, motorcyclePrice: Number(e.target.value) })}
          className="w-full border p-2 rounded mb-3"
          required
        />
        <input
          type="text"
          placeholder="ลิงก์รูปภาพ"
          value={form.motorcycleImage}
          onChange={(e) => setForm({ ...form, motorcycleImage: e.target.value })}
          className="w-full border p-2 rounded mb-3"
        />
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={form.motorcycleAvailable}
            onChange={(e) => setForm({ ...form, motorcycleAvailable: e.target.checked })}
            className="mr-2"
          />
          มีสินค้า
        </label>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          {editingId ? "บันทึกการแก้ไข" : "เพิ่มข้อมูล"}
        </button>
      </form>

      {/* ตารางแสดงรายการมอเตอร์ไซค์ */}
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">รายการมอเตอร์ไซค์ทั้งหมด</h2>
        {motorcycles.length === 0 ? (
          <p className="text-gray-500 text-center">ยังไม่มีข้อมูล</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100 text-left">
                <th className="p-2 border">รูป</th>
                <th className="p-2 border">ชื่อรุ่น</th>
                <th className="p-2 border">ยี่ห้อ</th>
                <th className="p-2 border">ราคา</th>
                <th className="p-2 border">สถานะ</th>
                <th className="p-2 border text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {motorcycles.map((moto) => (
                <tr key={moto.id} className="hover:bg-gray-50">
                  <td className="p-2 border">
                    {moto.motorcycleImage ? (
                      <img src={moto.motorcycleImage} alt={moto.motorcycleName} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <span className="text-gray-400">ไม่มีรูป</span>
                    )}
                  </td>
                  <td className="p-2 border">{moto.motorcycleName}</td>
                  <td className="p-2 border">{moto.motorcycleBrand}</td>
                  <td className="p-2 border">{moto.motorcyclePrice.toLocaleString()} ฿</td>
                  <td className="p-2 border">
                    {moto.motorcycleAvailable ? (
                      <span className="text-green-600">มีสินค้า</span>
                    ) : (
                      <span className="text-red-500">หมด</span>
                    )}
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleEdit(moto)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(moto.id!)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
