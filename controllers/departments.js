const Department = require("../models/departments");

// GET /departments
async function getAllDepartments(req, res) {
  try {
    const departments = await Department.findAll();
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
}

// POST /departments
async function addDepartment(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Department name is required" });
    }

    const newDept = await Department.create({ name });
    res.status(201).json(newDept);
  } catch (error) {
    console.error("Error adding department:", error);
    res.status(500).json({ message: "Failed to add department" });
  }
}

// PUT /departments/:id
async function editDepartment(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Department name is required" });
    }

    const dept = await Department.findByPk(id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    dept.name = name;
    await dept.save();

    res.status(200).json(dept);
  } catch (error) {
    console.error("Error editing department:", error);
    res.status(500).json({ message: "Failed to edit department" });
  }
}

module.exports = {
  getAllDepartments,
  addDepartment,
  editDepartment,
};
