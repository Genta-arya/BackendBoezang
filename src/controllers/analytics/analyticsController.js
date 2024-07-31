import prisma from "../../config/Prisma.js";

let visitorsData = [];

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    emitVisitorUpdate(io); 

    socket.on("log-visit", async ({ ip, page, device }) => {
      try {
        await prisma.analytic.create({
          data: { ip, page, device: JSON.stringify(device) },
        });

        visitorsData.push({ ip, page, device, visitTime: new Date() });
        emitVisitorUpdate(io);
      } catch (error) {
        console.error("Error logging visit:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

export const emitVisitorUpdate = (io) => {
  
  const groupedVisitors = visitorsData.reduce((acc, visitor) => {
    const date = visitor.visitTime.toISOString().split('T')[0]; 
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

  io.emit("update-visitors", { data, totalItem: visitorsData.length });
};

export const getVisitors = (req, res) => {

  const groupedVisitors = visitorsData.reduce((acc, visitor) => {
    const date = visitor.visitTime.toISOString().split('T')[0]; 
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

  res.json({ data, message: "Success", totalItem: visitorsData.length });
};

console.log(visitorsData);
