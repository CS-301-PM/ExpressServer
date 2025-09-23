const Department = require("../models/departments");

// ✅ Get all departments
async function getAllDepartments() {
  return await Department.findAll();
}

// ✅ Add a new department
async function addDepartment(name) {
  return await Department.create({ name });
}

// ✅ Edit department by id
async function editDepartment(id, name) {
  const dept = await Department.findByPk(id);
  if (!dept) throw new Error("Department not found");

  dept.name = name;
  await dept.save();

  return dept;
}

module.exports = {
  getAllDepartments,
  addDepartment,
  editDepartment,
};
