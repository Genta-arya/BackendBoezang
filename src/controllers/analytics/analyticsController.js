import prisma from "../../config/Prisma.js";

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Emit data pengunjung saat koneksi
    emitVisitorUpdate(io);

    socket.on("log-visit", async ({ ip, page, device }) => {
      try {
        // Mengatur waktu ke waktu Indonesia (WIB)
        const visitTime = new Date();
        visitTime.setHours(visitTime.getHours() + 7);

        // Membuat entri baru untuk setiap kunjungan
        await prisma.analytic.create({
          data: {
            ip,
            page,
            device: JSON.stringify(device), // Menyimpan device sebagai string JSON
            visitTime,
          },
        });

        console.log("New visit logged:", visitTime);
        emitVisitorUpdate(io); // Emit update setelah menambahkan kunjungan baru
      } catch (error) {
        console.error("Error logging visit:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export const emitVisitorUpdate = async (io) => {
  try {
    // Mengambil data pengunjung dari database
    const visitors = await prisma.analytic.findMany();

    const groupedVisitors = visitors.reduce((acc, visitor) => {
      const visitTime = new Date(visitor.visitTime);
      const date = visitTime.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(visitor);
      return acc;
    }, {});

    // Ubah format menjadi array dari objek
    const data = Object.entries(groupedVisitors).map(([date, visits]) => ({
      date,
      visits,
      totalVisits: visits.length, // Total kunjungan per hari
    }));

    io.emit("update-visitors", { data, totalItem: visitors.length });
    console.log("Grouped visitors data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error fetching visitors from database:", error);
  }
};

export const getVisitors = async (req, res) => {
  try {
    // Mengambil data pengunjung dari database
    const visitors = await prisma.analytic.findMany();

    const groupedVisitors = visitors.reduce((acc, visitor) => {
      const visitTime = new Date(visitor.visitTime);
      const date = visitTime.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(visitor);
      return acc;
    }, {});

    const data = Object.entries(groupedVisitors).map(([date, visits]) => ({
      date,
      visits,
      totalVisits: visits.length,
    }));

    res.json({ data, message: "Success", totalItem: visitors.length });
    console.log("Visitors data for API response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error fetching visitors from database:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Log the initial visitorsData to console
console.log("Socket initialized.");
