
        const CSV_URLS = {
            annual: 'YOUR_MIDTERM_EXAM_CSV_URL',
            midterm: 'YOUR_MIDTERM_EXAM_CSV_URL',
            test: 'https://docs.google.com/spreadsheets/d/1GjvtZAP1YWF9FfvJ_tVYJXq_dJrHff_qF2IGDueoKxY/export?format=csv'
        };

        async function fetchResult() {
            const rollNo = document.getElementById('rollNo').value.trim();
            if (!rollNo) {
                alert('Please enter a roll number');
                return;
            }

            const examType = document.getElementById('examType').value;
            const csvUrl = CSV_URLS[examType];

            try {
                document.getElementById('errorMessage').style.display = 'none';
                document.getElementById('result').style.display = 'none';
                
                const response = await fetch(csvUrl);
                if (!response.ok) throw new Error('Network response was not ok');
                
                const csvData = await response.text();
                const results = parseCSV(csvData);
                
                const studentResult = results.find(row => row['Roll No'].trim() === rollNo);
                
                if (studentResult) {
                    displayResult(studentResult, examType);
                } else {
                    document.getElementById('errorMessage').style.display = 'block';
                    document.getElementById('result').style.display = 'none';
                }
            } catch (error) {
                console.error('Error fetching results:', error);
                document.getElementById('errorMessage').textContent = 'Error loading results. Please try again later.';
                document.getElementById('errorMessage').style.display = 'block';
                document.getElementById('result').style.display = 'none';
            }
        }

        function parseCSV(csv) {
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            
            return lines.slice(1).map(line => {
                const values = line.split(',');
                const row = {};
                headers.forEach((header, i) => {
                    row[header] = values[i] ? values[i].trim() : '';
                });
                return row;
            });
        }

        function calculateSubjectGrade(subjectPercentage) {
            if (subjectPercentage >= 80) return 'A+';
            if (subjectPercentage >= 70) return 'A';
            if (subjectPercentage >= 60) return 'B';
            if (subjectPercentage >= 50) return 'C';
            if (subjectPercentage >= 40) return 'D';
            return 'F';
        }

        function displayResult(data, examType) {
            const resultCard = document.getElementById('resultCard');
            
            // Calculate total obtained and possible marks
            const subjects = [
                { name: 'Urdu', obtained: data['Urdu Obtained'], total: data['Urdu Total'] },
                { name: 'English', obtained: data['English Obtained'], total: data['English Total'] },
                { name: 'Math', obtained: data['Math Obtained'], total: data['Math Total'] },
                { name: 'Physics', obtained: data['Physics Obtained'], total: data['Physics Total'] },
                { name: 'Bio', obtained: data['Bio Obtained'], total: data['Bio Total'] },
                { name: 'Che', obtained: data['Che Obtained'], total: data['Che Total'] },
                { name: 'Islamiat', obtained: data['Islamiat Obtained'], total: data['Islamiat Total'] },
                { name: 'Quran', obtained: data['Quran Obtained'], total: data['Quran Total'] },
                { name: 'Pak Study', obtained: data['Pak Study Obtained'], total: data['Pak Study Total'] }
            ];

            let totalObtained = 0;
            let totalPossible = 0;
            
            const subjectRows = subjects.map(subject => {
                const obtained = parseInt(subject.obtained) || 0;
                const total = parseInt(subject.total) || 0;
                const percentage = total > 0 ? (obtained / total * 100) : 0;
                
                totalObtained += obtained;
                totalPossible += total;
                
                return `
                    <tr>
                        <td>${subject.name}</td>
                        <td>${total}</td>
                        <td>${obtained}</td>
                        <td>${percentage.toFixed(2)}%</td>
                        <td>${calculateSubjectGrade(percentage)}</td>
                    </tr>
                `;
            }).join('');

            const percentage = totalPossible > 0 ? (totalObtained / totalPossible * 100) : 0;
            const grade = calculateGrade(percentage);
            
            let examTitle = '';
            switch(examType) {
                case 'annual': examTitle = 'Annual Result'; break;
                case 'midterm': examTitle = 'Mid-Term Examination'; break;
                case 'test': examTitle = 'Entry Test'; break;
                default: examTitle = 'Examination Result';
            }
            
            const resultHTML = `
                <div class="result-header">
                    <div class="college-logo">
                        <img src="https://images.seeklogo.com/logo-png/20/1/punjab-group-of-colleges-logo-png_seeklogo-202980.png" alt="College Logo">
                    </div>
                    <div class="college-info">
                        <h1>Punjab College </h1>
                        <h2>Entry Test Result</h2>
                        <h3>${examTitle}</h3>
                    </div>
                </div>

                <div class="student-info">
                    <div class="student-details">
                        <p><span class="label">Name:</span> <span class="value">${data['Student Name']}</span></p>
                        <p><span class="label">Father's Name:</span> <span class="value">${data['Father Name']}</span></p>
                        <p><span class="label">Roll No:</span> <span class="value">${data['Roll No']}</span></p>
                    </div>
                </div>

                <table class="result-table">
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Total Marks</th>
                            <th>Obtained Marks</th>
                            <th>Percentage</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjectRows}
                        <tr class="total-row">
                            <td><strong>Total</strong></td>
                            <td><strong>${totalPossible}</strong></td>
                            <td><strong>${totalObtained}</strong></td>
                            <td><strong>${percentage.toFixed(2)}%</strong></td>
                            <td><strong>${grade}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <div class="result-footer">
                    <div class="grade-info">
                        <div class="percentage">${percentage.toFixed(2)}%</div>
                        <div class="grade">Grade: ${grade}</div>
                    </div>
                </div>
            `;
            
            resultCard.innerHTML = resultHTML;
            document.getElementById('result').style.display = 'block';
            document.querySelector('.action-buttons').style.display = 'flex';
        }

        function calculateGrade(percentage) {
            if (percentage >= 80) return 'A+ (Excellent)';
            if (percentage >= 70) return 'A (Very Good)';
            if (percentage >= 60) return 'B (Good)';
            if (percentage >= 50) return 'C (Fair)';
            if (percentage >= 40) return 'D (Pass)';
            return 'F (Fail)';
        }

        function printResult() {
            window.print();
        }

        function downloadResult() {
            alert('PDF download functionality would be implemented here with jsPDF library');
        }

        document.getElementById('rollNo').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                fetchResult();
            }
        });