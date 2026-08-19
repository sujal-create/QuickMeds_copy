import express from "express";
import Medicine from "../models/medicineModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    const medicines = await Medicine.find(filter);

    res.json(medicines);
  } catch (error) {
    console.error("Medicine fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch medicines",
    });
  }
});

export default router;