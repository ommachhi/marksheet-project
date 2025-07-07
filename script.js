let students = [];

function calculateGrade(p) {
  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  return "Fail";
}

function generateSubjectInputs() {
  const count = parseInt(document.getElementById("subjectCount").value);
  const container = document.getElementById("subjectInputs");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="row mb-2">
        <div class="col-md-6">
          <input placeholder="Subject ${i + 1} Name" class="form-control subject-name" />
        </div>
        <div class="col-md-6">
          <input type="number" placeholder="Marks" class="form-control subject-mark" />
        </div>
      </div>`;
  }
}

function addStudent() {
  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const year = document.getElementById("year").value.trim();
  const studentClass = document.getElementById("class").value.trim();

  if (!name || !roll || !year || !studentClass) {
    alert("Please fill all the fields (Name, Roll, Class, Year)");
    return;
  }

  const subjects = document.querySelectorAll(".subject-name");
  const marks = document.querySelectorAll(".subject-mark");
  let subjectData = [], total = 0;

  for (let i = 0; i < subjects.length; i++) {
    let subName = subjects[i].value.trim();
    let subMark = parseFloat(marks[i].value);
    if (!subName || isNaN(subMark) || subMark < 0 || subMark > 100) {
      alert("Enter valid subject names and marks (0-100)");
      return;
    }
    subjectData.push({ name: subName, mark: subMark });
    total += subMark;
  }

  const percentage = (total / (subjects.length * 100)) * 100;
  const grade = calculateGrade(percentage);

  students.push({ name, roll, year, studentClass, subjects: subjectData, total, percentage, grade });
  students.sort((a, b) => b.total - a.total);

  showResults();
  saveToLocal();

  // Reset form
  document.getElementById("name").value = "";
  document.getElementById("roll").value = "";
  document.getElementById("year").value = "";
  document.getElementById("class").value = "";
  document.getElementById("subjectCount").value = "";
  document.getElementById("subjectInputs").innerHTML = "";
}

function showResults() {
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";
  students.forEach((s, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${s.name}</td>
        <td>${s.roll}</td>
        <td>${s.total}</td>
        <td>${s.percentage.toFixed(2)}%</td>
        <td>${s.grade}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="viewMarksheet(${i})">View</button>
          <button class="btn btn-sm btn-warning" onclick="editStudent(${i})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteStudent(${i})">Delete</button>
        </td>
      </tr>`;
  });
}

/function exportCSV() {
  if (!students.length) return alert("No student data available.");

  // Gather all unique subject names across all students
  const subjectSet = new Set();
  students.forEach(s => s.subjects.forEach(sub => subjectSet.add(sub.name)));
  const allSubjects = Array.from(subjectSet);

  // Header Row
  const header = ["Rank", "Name", "Roll", "Class", "Year", ...allSubjects, "Total", "Percentage", "Grade"];

  // Rows
  const dataRows = students.map((s, i) => {
    const row = [
      i + 1,
      `"${s.name}"`,
      s.roll,
      `"${s.studentClass}"`,
      s.year
    ];
    // Fill subject marks in correct order
    allSubjects.forEach(subject => {
      const sub = s.subjects.find(sub => sub.name === subject);
      row.push(sub ? sub.mark : "");
    });
    row.push(s.total, s.percentage.toFixed(2), s.grade);
    return row;
  });

  const csvString = [header, ...dataRows].map(r => r.join(",")).join("\r\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `StudentResults_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function viewMarksheet(index) {
  const s = students[index];
  document.getElementById("marksheetYear").textContent = s.year;
  document.getElementById("marksheetClass").textContent = s.studentClass;
  document.getElementById("marksheetName").textContent = s.name;
  document.getElementById("marksheetRoll").textContent = s.roll;
  document.getElementById("marksheetTotal").textContent = s.total;
  document.getElementById("marksheetOutOf").textContent = s.subjects.length * 100;
  document.getElementById("marksheetPercentage").textContent = s.percentage.toFixed(2);
  document.getElementById("marksheetGrade").textContent = s.grade;
  document.getElementById("marksheetRank").textContent = index + 1;

  const tbody = document.getElementById("marksheetSubjects");
  tbody.innerHTML = "";
  s.subjects.forEach(sub => {
    tbody.innerHTML += `<tr><td>${sub.name}</td><td>${sub.mark}</td></tr>`;
  });

  document.getElementById("marksheetModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("marksheetModal").style.display = "none";
}

function printMarksheet() {
  // Temporarily show only the modal content
  const originalBody = document.body.innerHTML;
  const content = document.getElementById('marksheetContent').outerHTML;

  document.body.innerHTML = content;
  window.print();

  // Restore the original page
  document.body.innerHTML = originalBody;
  location.reload();  // Reload to restore functionality
}



// function downloadPDF() {
//   const element = document.getElementById("marksheetContent");
//   if (!element) return alert("Marksheet not found!");

//   html2pdf().set({
//     margin: 0.5,
//     filename: "Marksheet.pdf",
//     image: { type: "jpeg", quality: 0.98 },
//     html2canvas: { scale: 2 },
//     jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
//   }).from(element).save();
// }




function editStudent(index) {
  const s = students[index];
  document.getElementById("name").value = s.name;
  document.getElementById("roll").value = s.roll;
  document.getElementById("year").value = s.year;
  document.getElementById("class").value = s.studentClass;
  document.getElementById("subjectCount").value = s.subjects.length;
  generateSubjectInputs();
  const names = document.querySelectorAll(".subject-name");
  const marks = document.querySelectorAll(".subject-mark");
  s.subjects.forEach((sub, i) => {
    names[i].value = sub.name;
    marks[i].value = sub.mark;
  });
  students.splice(index, 1);
}

function deleteStudent(index) {
  if (confirm("Are you sure you want to delete this student?")) {
    students.splice(index, 1);
    saveToLocal();
    showResults();
  }
}

function saveToLocal() {
  localStorage.setItem("studentData", JSON.stringify(students));
}

window.onload = function () {
  const data = localStorage.getItem("studentData");
  if (data) {
    students = JSON.parse(data);
    showResults();
  }
};
