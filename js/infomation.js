 console.log(" JS loaded");

      document
        .getElementById("appointmentForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();

          const formData = new FormData(this);
          const data = Object.fromEntries(formData.entries());

          try {
            const res = await fetch("https://hospital-backend-efgn.onrender.com/api/appointments", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
              alert(" Đặt lịch khám thành công!");
              this.reset();
            } else {
              alert(" Lỗi: " + result.message);
            }
          } catch (err) {
            alert(" Không kết nối được server");
          }
        });