const API_URL = "https://hospital-backend-efgn.onrender.com/api/results";


document.getElementById("searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const phone = document.getElementById("phone").value.trim();
  const resultBox = document.getElementById("resultBox");

  resultBox.innerHTML = " Đang tra cứu...";

  try {
    const res = await fetch(`${API_URL}?phone=${phone}`);
    const data = await res.json();

    if (!res.ok) {
      resultBox.innerHTML = `<p style="color:red;"> ${data.message}</p>`;
      return;
    }

    resultBox.innerHTML = data
      .map(
        (r) => `
      <div class="result-item">
        <p><b> Bệnh nhân:</b> ${r.patientName}</p>
        <p><b> SĐT:</b> ${r.phone}</p>
        <p><b> Ngày khám:</b> ${new Date(r.examDate).toLocaleDateString("vi-VN")}</p>
        <p><b> Khoa:</b> ${r.department}</p>
        <p><b> Chẩn đoán:</b> ${r.diagnosis || "Chưa có"}</p>
        <p><b> Kết luận:</b> ${r.result || "Chưa có"}</p>
        <p><b> Đơn thuốc:</b> ${r.prescription || "Chưa có"}</p>
        ${
          r.note
            ? `<p><b> Ghi chú:</b> ${r.note}</p>`
            : ""
        }
        <hr/>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error(err);
    resultBox.innerHTML =
      "<p style='color:red;'> Lỗi kết nối server</p>";
  }
});
