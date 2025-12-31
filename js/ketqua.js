const BASE_URL = "https://hospital-backend-efgn.onrender.com";
const API = BASE_URL + "/api/results";
const APPOINTMENT_API = BASE_URL + "/api/appointments";
let token = localStorage.getItem("token");

/* LOGIN */
async function login() {
  const password = document.getElementById("password").value;
  
  if (!password) {
    document.getElementById("loginMsg").innerText = "Vui lòng nhập mật khẩu";
    return;
  }

  const res = await fetch(BASE_URL + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "doctor1", password })
  });
  const data = await res.json();

  if (res.ok) {
    token = data.token;
    localStorage.setItem("token", token);
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("logoutContainer").style.display = "block";
    document.getElementById("formBox").style.display = "block";
    document.getElementById("listBox").style.display = "block";
    document.getElementById("appointmentBox").style.display = "block";
    document.getElementById("loginMsg").innerText = "";
    loadResults();
    loadAppointments();
  } else {
    document.getElementById("loginMsg").innerText = data.message || "Sai mật khẩu";
  }
}

/* LOAD RESULTS */
async function loadResults() {
  // Gọi endpoint /all để lấy tất cả kết quả (yêu cầu token)
  const res = await fetch(API + "/all", {
    headers: { Authorization: "Bearer " + token }
  });

  const list = document.getElementById("results");
  list.innerHTML = "<p> Đang tải...</p>";

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    list.innerHTML = `<p> Lỗi tải dữ liệu: ${error.message || 'Vui lòng đăng nhập lại'}</p>`;
    return;
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    list.innerHTML = "<p> Chưa có kết quả khám nào</p>";
    return;
  }

  list.innerHTML = "";
  data.forEach(r => {
    list.innerHTML += `
      <div class="result-item">
        <b>${r.patientName}</b> - ${r.phone}<br>
         ${new Date(r.examDate).toLocaleDateString("vi-VN")} |  ${r.department}
        <p> Chẩn đoán: ${r.diagnosis || "Chưa có"}</p>
        <p> Kết luận: ${r.result || "Chưa có"}</p>
        <p> Đơn thuốc: ${r.prescription || "Chưa có"}</p>
        <div class="actions">
          <button onclick='editResult(${JSON.stringify(r).replace(/'/g, "&#39;")})'> Sửa</button>
          <button onclick="deleteResult('${r._id}')"> Xóa</button>
        </div>
      </div>
    `;
  });
}

/* LOAD APPOINTMENTS */
async function loadAppointments() {
  const res = await fetch(APPOINTMENT_API, {
    headers: { Authorization: "Bearer " + token }
  });

  const list = document.getElementById("appointments");
  list.innerHTML = "";

  if (!res.ok) {
    list.innerHTML = "<p> Lỗi tải lịch khám</p>";
    return;
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    list.innerHTML = "<p> Chưa có lịch khám nào</p>";
    return;
  }

  data.forEach(a => {
    list.innerHTML += `
      <div class="result-item">
        <b>${a.fullName}</b> - ${a.phone}<br>
         Ngày khám: ${a.date}<br>
         Khoa: ${a.department}
        ${a.email ? `<br> Email: ${a.email}` : ''}
        ${a.note ? `<p> Ghi chú: ${a.note}</p>` : ''}
        <div class="actions">
          <button onclick="createResultFromAppointment('${a._id}', '${a.fullName}', '${a.phone}', '${a.department}')">➕ Tạo kết quả khám</button>
        </div>
      </div>
    `;
  });
}

/* CREATE RESULT FROM APPOINTMENT */
function createResultFromAppointment(appointmentId, fullName, phone, department) {
  resetForm();
  document.getElementById("patientName").value = fullName;
  document.getElementById("phone").value = phone;
  document.getElementById("department").value = department;
  document.getElementById("examDate").value = new Date().toISOString().split('T')[0];
  
  // Scroll to form
  document.getElementById("formBox").scrollIntoView({ behavior: 'smooth' });
}

/* SAVE RESULT */
async function saveResult() {
  const id = document.getElementById("resultId").value;
  const body = {
    patientName: document.getElementById("patientName").value,
    phone: document.getElementById("phone").value,
    examDate: document.getElementById("examDate").value,
    department: document.getElementById("department").value,
    diagnosis: document.getElementById("diagnosis").value,
    result: document.getElementById("result").value,
    prescription: document.getElementById("prescription").value
  };

  // Validate
  if (!body.patientName || !body.phone || !body.examDate || !body.department) {
    alert(" Vui lòng điền đầy đủ thông tin bắt buộc (Tên, SĐT, Ngày khám, Khoa)");
    return;
  }

  const method = id ? "PUT" : "POST";
  const url = id ? `${API}/${id}` : API;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert("✅ Lưu thành công");
    resetForm();
    loadResults();
  } else {
    const error = await res.json();
    alert(" Lỗi: " + (error.message || "Không thể lưu"));
  }
}

/* EDIT RESULT */
function editResult(r) {
  document.getElementById("resultId").value = r._id;
  document.getElementById("patientName").value = r.patientName;
  document.getElementById("phone").value = r.phone;
  document.getElementById("examDate").value = r.examDate.split("T")[0];
  document.getElementById("department").value = r.department;
  document.getElementById("diagnosis").value = r.diagnosis || "";
  document.getElementById("result").value = r.result || "";
  document.getElementById("prescription").value = r.prescription || "";
  document.getElementById("formTitle").innerText = "✏️ Sửa kết quả khám";
  
  // Scroll to form
  document.getElementById("formBox").scrollIntoView({ behavior: 'smooth' });
}

/* DELETE RESULT */
async function deleteResult(id) {
  if (!confirm("Xóa kết quả này?")) return;

  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });

  if (res.ok) {
    alert("🗑️ Đã xóa");
    loadResults();
  } else {
    const error = await res.json();
    alert(" " + (error.message || "Chỉ admin mới được xóa"));
  }
}

/* RESET FORM */
function resetForm() {
  document.getElementById("resultId").value = "";
  document.querySelectorAll("#formBox input, #formBox textarea").forEach(e => {
    if (e.type !== "hidden") e.value = "";
  });
  document.getElementById("formTitle").innerText = " Thêm kết quả khám";
}

// Auto check token on page load
window.addEventListener('DOMContentLoaded', () => {
  if (token) {
    // Verify token is still valid by trying to load data
    verifyAndLoadData();
  }
});

async function verifyAndLoadData() {
  try {
    const res = await fetch(API + "/all", {
      headers: { Authorization: "Bearer " + token }
    });
    
    if (res.ok) {
      // Token is valid, show main interface
      document.getElementById("loginBox").style.display = "none";
      document.getElementById("logoutContainer").style.display = "block";
      document.getElementById("formBox").style.display = "block";
      document.getElementById("listBox").style.display = "block";
      document.getElementById("appointmentBox").style.display = "block";
      loadResults();
      loadAppointments();
    } else {
      // Token invalid, clear it and show login
      localStorage.removeItem("token");
      token = null;
      document.getElementById("loginBox").style.display = "block";
      document.getElementById("logoutContainer").style.display = "none";
    }
  } catch (error) {
    // Error, show login
    localStorage.removeItem("token");
    token = null;
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("logoutContainer").style.display = "none";
  }
}

// Add logout function
function logout() {
  if (confirm("Bạn có chắc muốn đăng xuất?")) {
    localStorage.removeItem("token");
    token = null;
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("logoutContainer").style.display = "none";
    document.getElementById("formBox").style.display = "none";
    document.getElementById("listBox").style.display = "none";
    document.getElementById("appointmentBox").style.display = "none";
    document.getElementById("password").value = "";
    document.getElementById("loginMsg").innerText = "";
    resetForm();
  }
}