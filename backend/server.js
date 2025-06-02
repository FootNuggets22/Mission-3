import app from "./app.js";

// PORT
const PORT = process.env.PORT || 4000;
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (error) => {
    console.log("Server Error!", error);
  });
