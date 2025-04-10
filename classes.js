let students = JSON.parse(localStorage.getItem('students')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || {};

function showClass(className) {
  // Hide all sections
  document.querySelectorAll('.class-section').forEach(section => {
    section.style.display = 'none';
  });

  // Show selected section
  document.getElementById(className).style.display = 'block';

  // Update active tab
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[onclick="showClass('${className}')"]`).classList.add('active');

  renderClassStats(className);
}

function renderClassStats(className) {
  const classStudents = students.filter(student => student.class === className);
  const stats = calculateClassDemographics(classStudents);

  const statsDiv = document.getElementById(`${className}Stats`);
  const raceStats = {};
  classStudents.forEach(student => {
    raceStats[student.race] = (raceStats[student.race] || 0) + 1;
  });

  statsDiv.innerHTML = `
    <div class="stats-grid">
      <div class="stat-item">
        <h3>${classStudents.length}</h3>
        <p>Total Students</p>
      </div>
      <div class="stat-item">
        <h3>${stats.averageAge.toFixed(1)}</h3>
        <p>Average Age</p>
      </div>
      <div class="stat-item">
        <h3>${stats.attendanceRate}%</h3>
        <p>Attendance Rate</p>
      </div>
    </div>
    <div class="race-distribution">
      <h3>Race Distribution:</h3>
      ${Object.entries(raceStats).map(([race, count]) => 
        `<p>${race.charAt(0).toUpperCase() + race.slice(1)}: ${count} (${((count/classStudents.length)*100).toFixed(1)}%)</p>`
      ).join('')}
    </div>
  `;

  const studentList = document.getElementById(`${className}Students`);
  studentList.innerHTML = classStudents.map(student => `
    <div class="student-card">
      <div>
        <strong>${student.name}</strong> - Age: ${student.age}, 
        Gender: ${student.gender}, Session: ${student.session}
      </div>
    </div>
  `).join('');
}

function calculateClassDemographics(classStudents) {
  const stats = {
    totalStudents: classStudents.length,
    averageAge: 0,
    attendanceRate: 0
  };

  if (classStudents.length > 0) {
    stats.averageAge = classStudents.reduce((sum, student) => sum + parseInt(student.age), 0) / classStudents.length;

    // Calculate attendance rate
    const lastDate = Object.keys(attendance).sort().pop();
    if (lastDate && attendance[lastDate]) {
      const presentCount = Object.entries(attendance[lastDate])
        .filter(([id, status]) => 
          status === 'present' && 
          classStudents.some(student => student.id === parseInt(id))
        ).length;
      stats.attendanceRate = Math.round((presentCount / classStudents.length) * 100);
    }
  }

  return stats;
}

// Initialize with Barista class view
showClass('barista');