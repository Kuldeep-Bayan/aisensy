import { User } from "../models/user.models.js";
import csv from "csvtojson";
import xlsx from "xlsx";
import fs from "fs";

const uploadCsvFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        message: "No file uploaded",
      });
    }

    let jsonObj;

    if (
      req.file.mimetype === "text/csv" ||
      req.file.originalname.endsWith(".csv")
    ) {
      jsonObj = await csv().fromFile(req.file.path);
    } else if (
      req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      req.file.originalname.endsWith(".xlsx")
    ) {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      jsonObj = xlsx.utils.sheet_to_json(sheet);
    } else {
      return res.status(400).send({
        message: "Unsupported file type",
      });
    }

    if (!jsonObj || jsonObj.length === 0) {
      return res.status(400).send({
        message: "No valid data found in the file",
      });
    }

    const users = jsonObj.map((row) => {
      return {
        name: row["Name"],
        email: row["Email"],
        mobileNumber: row["Mobile Number"],
      };
    });

    await User.insertMany(users);

    fs.unlinkSync(req.file.path);

    return res.status(200).send({ message: "Successfully uploaded!" });
  } catch (error) {
    console.error("Error uploading file:", error);
    fs.unlinkSync(req.file.path);
    return res.status(500).send({
      message: "An error occurred during file upload",
      error: error.message,
    });
  }
};

const getContacts = async (req, res) => {
  try {
    const page = parseInt(req?.query.page) || 1;
    const limit = parseInt(req?.query.limit) || 10;
    const skip = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(limit);
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

export { uploadCsvFile, getContacts };
