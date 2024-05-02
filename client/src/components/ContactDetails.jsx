import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import * as xlsx from "xlsx";
import { toast } from "react-toastify";
import Papa from "papaparse";

const limits = [1, 2, 5, 10, 15, 20, 25, 30];

function validateFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target.result;

      try {
        // if (file.name.endsWith(".csv")) {
        //   Papa.parse(content, {
        //     header: true,
        //     skipEmptyLines: true,
        //     complete: (result) => {
        //       const parsedData = result.data;
        //       const requiredColumns = ["Name", "Email", "Mobile Number"];
        //       const fileColumns = Object.keys(parsedData[0]);
        //       const missingColumns = requiredColumns.filter(
        //         (col) => !fileColumns.includes(col)
        //       );
        //       if (missingColumns.length > 0) {
        //         reject(
        //           `Missing required columns: ${missingColumns.join(", ")}`
        //         );
        //       } else {
        //         resolve(parsedData);
        //       }
        //     },
        //     error: (error) => {
        //       reject("Error parsing CSV file");
        //     },
        //   });
        // } else

        if (file.name.endsWith(".xlsx")) {
          const workbook = xlsx.read(content, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonContent = xlsx.utils.sheet_to_json(sheet);

          const requiredColumns = ["Name", "Email", "Mobile Number"];
          const fileColumns = Object.keys(jsonContent[0]);
          const missingColumns = requiredColumns.filter(
            (col) => !fileColumns.includes(col)
          );

          if (missingColumns.length > 0) {
            reject(`Missing required columns: ${missingColumns.join(", ")}`);
          } else {
            resolve(null);
          }
        } else {
          reject("Unsupported file type");
        }
      } catch (error) {
        toast.error("Inavlid format");
        reject(error.message);
      }
    };

    reader.onerror = () => {
      reject("Error reading file");
    };

    reader.readAsArrayBuffer(file);
  });
}

function ContactDetails() {
  const [csvFile, setCsvFile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [validationError, setValidationError] = useState(null);

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      //   try {
      // await validateFile(file);
      // setValidationError(null);
      setCsvFile(file);
      //   } catch (error) {
      //     setValidationError(error);
      //   }
    } else {
      setCsvFile(null);
    }
  };

  const fetchContact = async (page) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/users/getcontacts?page=${page}&limit=${limit}`
      );
      setContacts(response.data);
      console.log(response.data);
    } catch (error) {
      console.log("error");
    }
  };
  useEffect(() => {
    fetchContact(currentPage);
  }, [currentPage, csvFile, limit]);

  const uploadCsvFile = async () => {
    if (!csvFile) {
      return;
    }

    const formData = new FormData();
    formData.append("contactsFile", csvFile);

    try {
      const response = await axios.post("http://localhost:8000/api/v1/users/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload successful:", response.data);
      setCsvFile(null);
    } catch (error) {
      console.error("Error uploading CSV file:", error);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
  };

  return (
    <div className="flex flex-col w-3/4 items-center justify-center min-h-screen ">
  <div className="max-w-lg w-full h-3/4 p-6 bg-white shadow-md rounded-lg">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Contact Management</h1>
      <label htmlFor="fileInput" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg">
        Upload File
      </label>
      <input
        type="file"
        accept=".csv, .xls, .xlsx"
        onChange={handleCsvFileChange}
        className="hidden"
        id="fileInput"
      />
    </div>
    {csvFile && (
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">Selected file: {csvFile.name}</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={uploadCsvFile}
        >
          Upload Contact
        </button>
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Mobile Number</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact, index) => (
            <tr key={index} className={(index + 1) % 2 === 0 ? "bg-gray-100" : ""}>
              <td className="border border-gray-300 px-4 py-2">{contact.name}</td>
              <td className="border border-gray-300 px-4 py-2">{contact.email}</td>
              <td className="border border-gray-300 px-4 py-2">{contact.mobileNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between mt-6">
      <button
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg ${currentPage === 1 ? "bg-gray-300 text-gray-500" : "bg-blue-500 text-white"}`}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </button>
      <div>
        <label htmlFor="limitSelect" className="mr-2">Contacts per Page:</label>
        <select
          id="limitSelect"
          className="border border-gray-300 px-2 py-1 rounded-lg"
          value={limit}
          onChange={handleLimitChange}
        >
          {limits.map((limit) => (
            <option key={limit} value={limit}>
              {limit}
            </option>
          ))}
        </select>
      </div>
      <button
        className={`px-4 py-2 rounded-lg ${false ? "bg-gray-300 text-gray-500" : "bg-blue-500 text-white"}`}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  </div>
</div>

  );
}

export default ContactDetails;
