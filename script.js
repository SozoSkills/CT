let students = JSON.parse(localStorage.getItem('students')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || {};

function saveData() {
  localStorage.setItem('students', JSON.stringify(students));
  localStorage.setItem('attendance', JSON.stringify(attendance));
}

document.getElementById('studentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const editId = form.dataset.editId;
  
  const studentData = {
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    race: document.getElementById('race').value,
    class: document.getElementById('class').value,
    session: document.getElementById('session').value
  };

  if (editId) {
    // Update existing student
    const index = students.findIndex(s => s.id === parseInt(editId));
    if (index !== -1) {
      students[index] = { ...students[index], ...studentData };
    }
    form.dataset.editId = '';
    form.querySelector('button').textContent = 'Add Student';
  } else {
    // Add new student
    const student = { id: Date.now(), ...studentData };
    students.push(student);
  }

  saveData();
  renderStudents();
  renderAttendance();
  form.reset();
});

function searchAndSortStudents() {
  const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
  const sortBy = document.getElementById('sortBy').value;
  const sortOrder = document.getElementById('sortOrder').value;

  let filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm) ||
    student.grade.toString().includes(searchTerm)
  );

  filteredStudents.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'age') {
      comparison = a.age - b.age;
    } 
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  renderStudents(filteredStudents);
}

function editStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) return;

  document.getElementById('name').value = student.name;
  document.getElementById('age').value = student.age;
  document.getElementById('gender').value = student.gender;
  document.getElementById('race').value = student.race;
  document.getElementById('class').value = student.class;
  document.getElementById('session').value = student.session;
  
  // Change form button to update mode
  const form = document.getElementById('studentForm');
  form.dataset.editId = id;
  form.querySelector('button').textContent = 'Update Student';
}

function renderStudents(displayStudents = students) {
  const list = document.getElementById('studentList');
  const classes = ['barista', 'baking', 'beauty', 'hair'];
  const selectedSession = document.getElementById('sessionFilter').value;

  list.innerHTML = classes.map(className => {
    const classStudents = displayStudents.filter(student => 
      student.class === className && 
      (!selectedSession || student.session === selectedSession)
    );
    if (classStudents.length === 0) return '';

    return `
      <div class="class-section">
        <h3>${className.charAt(0).toUpperCase() + className.slice(1)} Class</h3>
        ${classStudents.map(student => `
          <div class="student-card">
            <div>
              <strong>${student.name}</strong> - Age: ${student.age}, 
              Gender: ${student.gender}, Session: ${student.session}
            </div>
            <div class="student-controls">
              <button onclick="editStudent(${student.id})" class="edit-btn">Edit</button>
              <button onclick="removeStudent(${student.id})" class="remove-btn">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function removeStudent(id) {
  students = students.filter(student => student.id !== id);
  saveData();
  renderStudents();
  renderAttendance();
}

function renderAttendance() {
  const date = document.getElementById('attendanceDate').value;
  const list = document.getElementById('attendanceList');
  const selectedClass = document.getElementById('classFilter').value;

  if (!date) {
    list.innerHTML = '<p>Please select a date</p>';
    return;
  }

  const filteredStudents = selectedClass ? students.filter(s => s.class === selectedClass) : students;

  if (!attendance[date]) {
    attendance[date] = {};
  }

  list.innerHTML = filteredStudents.map(student => `
    <div class="attendance-row">
      <span>${student.name}</span>
      <div class="attendance-buttons">
        <button class="${attendance[date][student.id] === 'present' ? 'active' : ''}"
          onclick="updateAttendance(${student.id}, '${date}', 'present')">Present</button>
        <button class="${attendance[date][student.id] === 'absent' ? 'active' : ''}"
          onclick="updateAttendance(${student.id}, '${date}', 'absent')">Absent</button>
        <button class="${attendance[date][student.id] === 'excused' ? 'active' : ''}"
          onclick="updateAttendance(${student.id}, '${date}', 'excused')">Excused</button>
      </div>
    </div>
  `).join('');
}

function updateAttendance(studentId, date, status) {
  if (!attendance[date]) {
    attendance[date] = {};
  }
  attendance[date][studentId] = status;
  saveData();
  renderAttendance();
}

function updateAttendance(studentId, date, present) {
  if (!attendance[date]) {
    attendance[date] = [];
  }

  if (present) {
    attendance[date] = [...new Set([...attendance[date], studentId])];
  } else {
    attendance[date] = attendance[date].filter(id => id !== studentId);
  }
  saveData();
}

document.getElementById('attendanceDate').addEventListener('change', renderAttendance);

function calculateDemographics() {
  const stats = {
    totalStudents: students.length,
    demographicGroups: {
      colouredMale: students.filter(s => s.race === 'coloured' && s.gender === 'male').length,
      colouredFemale: students.filter(s => s.race === 'coloured' && s.gender === 'female').length,
      blackMale: students.filter(s => s.race === 'black' && s.gender === 'male').length,
      blackFemale: students.filter(s => s.race === 'black' && s.gender === 'female').length
    },
    ageGroups: {
      under21: 0,
      above21: 0
    },
    averageAge: 0,
    genderDistribution: {},
    raceDistribution: {},
    attendanceRate: {}
  };

  // Initialize distributions
  students.forEach(student => {
    if (student.gender) {
      stats.genderDistribution[student.gender] = (stats.genderDistribution[student.gender] || 0) + 1;
    }
    if (student.race) {
      stats.raceDistribution[student.race] = (stats.raceDistribution[student.race] || 0) + 1;
    }
  });

  // Calculate gender, race and grade distribution
  students.forEach(student => {
    stats.genderDistribution[student.gender] = (stats.genderDistribution[student.gender] || 0) + 1;
    stats.raceDistribution[student.race] = (stats.raceDistribution[student.race] || 0) + 1;
    stats.gradeDistribution[student.grade] = (stats.gradeDistribution[student.grade] || 0) + 1;
    stats.averageAge += parseInt(student.age);

    // Age group calculation
    if (parseInt(student.age) < 21) {
      stats.ageGroups.under21++;
    } else {
      stats.ageGroups.above21++;
    }
  });

  if (students.length > 0) {
    stats.averageAge /= students.length;
  }

  // Calculate attendance rate
  Object.keys(attendance).forEach(date => {
    const presentCount = Object.values(attendance[date]).filter(status => status === 'present').length;
    const rate = (presentCount / students.length) * 100;
    stats.attendanceRate[date] = Math.round(rate);
  });

  return stats;
}

function renderDemographics() {
  const stats = calculateDemographics();
  const report = document.getElementById('demographicsReport');

  report.innerHTML = `
    <div class="stat-card">
      <h3>Total Students: ${stats.totalStudents}</h3>
      <h3>Average Age: ${stats.averageAge.toFixed(1)}</h3>
      <h3>Age Groups:</h3>
      <p>Under 21: ${stats.ageGroups.under21} (${((stats.ageGroups.under21/stats.totalStudents)*100).toFixed(1)}%)</p>
      <p>21 and Above: ${stats.ageGroups.above21} (${((stats.ageGroups.above21/stats.totalStudents)*100).toFixed(1)}%)</p>

      <h3>Class Attendance Rates:</h3>
      <div class="class-stats-grid">
        ${['barista', 'baking', 'beauty', 'hair'].map(className => {
          const classStudents = students.filter(s => s.class === className);
          if (classStudents.length === 0) return '';
          
          const dates = Object.keys(attendance);
          const totalDays = dates.length;
          if (totalDays === 0) return `<p>${className.charAt(0).toUpperCase() + className.slice(1)}: No attendance data</p>`;
          
          let presentCount = 0;
          classStudents.forEach(student => {
            dates.forEach(date => {
              if (attendance[date][student.id] === 'present') {
                presentCount++;
              }
            });
          });
          
          const rate = Math.round((presentCount / (classStudents.length * totalDays)) * 100);
          return `<p>${className.charAt(0).toUpperCase() + className.slice(1)}: ${rate}%</p>`;
        }).join('')}
      </div>

      <div class="low-attendance-section">
        <h3>Low Attendance Students</h3>
        <select id="lowAttendanceClassFilter" onchange="filterLowAttendance()">
          <option value="">All Classes</option>
          <option value="barista">Barista</option>
          <option value="baking">Baking</option>
          <option value="beauty">Beauty</option>
          <option value="hair">Hair</option>
        </select>
        <div id="lowAttendanceList">
          ${renderLowAttendanceStudents()}
        </div>
      </div>

      <h3>Demographic Groups:</h3>
      <div class="demographic-groups">
        ${Object.entries(stats.demographicGroups).map(([group, count]) => {
          const percentage = ((count/stats.totalStudents)*100).toFixed(1);
          const label = group
            .replace('coloured', 'Coloured')
            .replace('black', 'Black')
            .replace('Male', ' Male')
            .replace('Female', ' Female');
          return `<p>${label}: ${count} (${percentage}%)</p>`;
        }).join('')}
      </div>
      <h3>Race Distribution:</h3>
      ${Object.entries(stats.raceDistribution).map(([race, count]) => 
        `<p>${race}: ${count} (${((count/stats.totalStudents)*100).toFixed(1)}%)</p>`
      ).join('')}
      <h3>Grade Distribution:</h3>
      ${Object.entries(stats.gradeDistribution).map(([grade, count]) => 
        `<p>Grade ${grade}: ${count} students</p>`
      ).join('')}
      <h3>Recent Attendance Rates:</h3>
      ${Object.entries(stats.attendanceRate).slice(-5).map(([date, rate]) => 
        `<p>${date}: ${rate}%</p>`
      ).join('')}

      </div>
  `;
}

function exportReport() {
  const stats = calculateDemographics();
  const selectedClass = document.getElementById('classFilter')?.value;

  // Filter students by class if selected
  const relevantStudents = selectedClass ? 
    students.filter(s => s.class === selectedClass) : 
    students;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Demographics sheet
  const demoData = [
    ['Demographics Report', ''],
    ['Total Students', relevantStudents.length],
    ['Average Age', stats.averageAge.toFixed(1)],
    [''],
    ['Gender Distribution', ''],
    ...Object.entries(stats.genderDistribution),
    [''],
    ['Race Distribution', ''],
    ...Object.entries(stats.raceDistribution),
    [''],
    ['Age Groups', ''],
    ['Under 21', stats.ageGroups.under21],
    ['21 and Above', stats.ageGroups.above21]
  ];

  const ws = XLSX.utils.aoa_to_sheet(demoData);
  XLSX.utils.book_append_sheet(wb, ws, "Demographics");

  // Attendance sheet
  const attendanceData = [['Date', 'Student', 'Status']];
  Object.entries(attendance).forEach(([date, records]) => {
    Object.entries(records).forEach(([studentId, status]) => {
      const student = students.find(s => s.id === parseInt(studentId));
      if (student && (!selectedClass || student.class === selectedClass)) {
        attendanceData.push([date, student.name, status]);
      }
    });
  });

  const wsAttendance = XLSX.utils.aoa_to_sheet(attendanceData);
  XLSX.utils.book_append_sheet(wb, wsAttendance, "Attendance");

  // Save file
  XLSX.writeFile(wb, `class-report${selectedClass ? '-' + selectedClass : ''}.xlsx`);
}

function exportText() {
  const stats = calculateDemographics();
  const reportText = `
Class Demographics Report
Generated on: ${new Date().toLocaleDateString()}

Total Students: ${stats.totalStudents}
Average Age: ${stats.averageAge.toFixed(1)}

Age Groups:
Under 21: ${stats.ageGroups.under21} (${((stats.ageGroups.under21/stats.totalStudents)*100).toFixed(1)}%)
21 and Above: ${stats.ageGroups.above21} (${((stats.ageGroups.above21/stats.totalStudents)*100).toFixed(1)}%)

Gender Distribution:
${Object.entries(stats.genderDistribution).map(([gender, count]) => 
  `${gender}: ${count} (${((count/stats.totalStudents)*100).toFixed(1)}%)`
).join('\n')}

Race Distribution:
${Object.entries(stats.raceDistribution).map(([race, count]) => 
  `${race}: ${count} (${((count/stats.totalStudents)*100).toFixed(1)}%)`
).join('\n')}

Grade Distribution:
${Object.entries(stats.gradeDistribution).map(([grade, count]) => 
  `Grade ${grade}: ${count} students`
).join('\n')}

Recent Attendance Rates:
${Object.entries(stats.attendanceRate).map(([date, rate]) => 
  `${date}: ${rate}%`
).join('\n')}
`;

  const blob = new Blob([reportText], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'class-demographics-report.txt';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Update render functions to include demographics
function saveData() {
  localStorage.setItem('students', JSON.stringify(students));
  localStorage.setItem('attendance', JSON.stringify(attendance));
  renderDemographics();
}

function renderLowAttendanceStudents(selectedClass = '') {
  return ['barista', 'baking', 'beauty', 'hair']
    .filter(className => !selectedClass || className === selectedClass)
    .map(className => {
      const classStudents = students.filter(s => s.class === className);
      const lowAttendanceStudents = classStudents.filter(student => calculateStudentAttendanceRate(student.id) < 75);
      
      if (lowAttendanceStudents.length === 0) return '';
      
      return `
        <div class="class-low-attendance">
          <h4>${className.charAt(0).toUpperCase() + className.slice(1)} Class:</h4>
          ${lowAttendanceStudents.map(student => 
            `<p class="low-attendance-student">
              ${student.name} - ${calculateStudentAttendanceRate(student.id).toFixed(1)}% attendance
            </p>`
          ).join('')}
        </div>
      `;
    }).join('');
}

function filterLowAttendance() {
  const selectedClass = document.getElementById('lowAttendanceClassFilter').value;
  document.getElementById('lowAttendanceList').innerHTML = renderLowAttendanceStudents(selectedClass);
}

// Store student monitoring status
let monitoringStatus = JSON.parse(localStorage.getItem('monitoringStatus')) || {};

function updateStudentStatus(studentId, status) {
  monitoringStatus[studentId] = {
    status: status,
    date: new Date().toISOString()
  };
  localStorage.setItem('monitoringStatus', JSON.stringify(monitoringStatus));
  filterAttendanceMonitoring();
}

function renderAttendanceMonitoring(selectedClass = '') {
  const lowAttendanceStudents = students.filter(student => {
    const rate = calculateStudentAttendanceRate(student.id);
    return rate < 75 && (!selectedClass || student.class === selectedClass);
  });

  document.getElementById('attendanceMonitoringList').innerHTML = lowAttendanceStudents.length === 0 ? 
    '<p>No students with attendance below 75%</p>' :
    lowAttendanceStudents.map(student => {
      const rate = calculateStudentAttendanceRate(student.id);
      const status = monitoringStatus[student.id] || { status: 'pending', date: null };
      
      return `
        <div class="monitoring-card ${status.status}">
          <div class="student-info">
            <h4>${student.name}</h4>
            <p>Class: ${student.class}</p>
            <p>Attendance Rate: ${rate.toFixed(1)}%</p>
            ${status.date ? `<p>Last Updated: ${new Date(status.date).toLocaleDateString()}</p>` : ''}
          </div>
          <div class="status-controls">
            <select onchange="updateStudentStatus(${student.id}, this.value)" value="${status.status}">
              <option value="pending" ${status.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="checked" ${status.status === 'checked' ? 'selected' : ''}>Checked In</option>
              <option value="dismissed" ${status.status === 'dismissed' ? 'selected' : ''}>Dismissed</option>
              <option value="monitoring" ${status.status === 'monitoring' ? 'selected' : ''}>Under Monitoring</option>
            </select>
          </div>
        </div>
      `;
    }).join('');
}

function filterAttendanceMonitoring() {
  const selectedClass = document.getElementById('monitoringClassFilter').value;
  renderAttendanceMonitoring(selectedClass);
}

function calculateStudentAttendanceRate(studentId) {
  const dates = Object.keys(attendance);
  if (dates.length === 0) return 100;

  let presentCount = 0;
  dates.forEach(date => {
    if (attendance[date][studentId] === 'present') {
      presentCount++;
    }
  });

  return (presentCount / dates.length) * 100;
}

// Add event listeners for search and sort
document.getElementById('searchStudent').addEventListener('input', searchAndSortStudents);
document.getElementById('sortBy').addEventListener('change', searchAndSortStudents);
document.getElementById('sortOrder').addEventListener('change', searchAndSortStudents);

// Initial render
searchAndSortStudents();
document.getElementById('attendanceDate').valueAsDate = new Date();
renderAttendance();
renderDemographics();
renderAttendanceMonitoring();