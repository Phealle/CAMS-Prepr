function loadQuestions() {
    questions = pickRandomQuestions(data.questions, 120);

    const container = document.getElementById('mainContent');
    let submittedCount = 0;
    let correctCount = 0;
    const totalQuestions = questions.length;

    const resultMsg = document.createElement('div');
    resultMsg.className = 'result-message';

    // Update progress bar
    function updateProgress() {
        const progress = (submittedCount / totalQuestions) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
    }

    questions.forEach((q, idx) => {
        const questionText = q.text || q.question || "Question sans texte";
        const options = q.options || [];
        const correct = q.correctAnswer;

        let isMulti = false;
        let correctArr = [];

        if (Array.isArray(correct)) {
            correctArr = correct.map(String);
            isMulti = correctArr.length > 1;
        } else if (typeof correct === "string") {
            if (correct.length > 1) {
                isMulti = true;
                correctArr = correct.split("");
            } else {
                correctArr = [correct];
            }
        }

        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = `${idx + 1}. ${questionText}`;
        fieldset.appendChild(legend);

        const optionLabels = [];

        options.forEach(opt => {
            const optionValue = opt.value || opt.text || '';
            const optionText = opt.text || opt.value || '';
            const input = document.createElement('input');
            input.type = isMulti ? 'checkbox' : 'radio';
            input.name = `q${idx}`;
            input.value = optionValue;
            input.id = `q${idx}_${optionValue}`;

            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = `${optionValue ? optionValue + '. ' : ''}${optionText}`;

            fieldset.appendChild(input);
            fieldset.appendChild(label);
            optionLabels.push({input, label, value: optionValue});
        });

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Check Answer';
        btn.addEventListener('click', () => {
            const selected = optionLabels
                .filter(({input}) => input.checked)
                .map(({value}) => value);

            let allCorrect = true;

            optionLabels.forEach(({input, label, value}) => {
                if (input.checked) {
                    if (correctArr.includes(value)) {
                        label.classList.add('correct');
                    } else {
                        label.classList.add('incorrect');
                        allCorrect = false;
                    }
                } else {
                    if (correctArr.includes(value)) {
                        label.classList.add('incorrect');
                        allCorrect = false;
                    }
                }
            });

            btn.disabled = true;
            btn.textContent = allCorrect ? '✓ Correct' : '✗ Incorrect';
            submittedCount++;

            if (allCorrect) correctCount++;

            updateProgress();

            if (submittedCount === totalQuestions) {
                const percent = Math.round((correctCount / totalQuestions) * 100);
                resultMsg.textContent = `Final Score: ${correctCount}/${totalQuestions} (${percent}%)`;
                
                // Add appropriate styling based on score
                if (percent >= 80) {
                    resultMsg.classList.add('good');
                } else if (percent >= 60) {
                    resultMsg.classList.add('average');
                } else {
                    resultMsg.classList.add('poor');
                }
                
                container.appendChild(resultMsg);
                
                // Scroll to results
                resultMsg.scrollIntoView({ behavior: 'smooth' });
            }
        });

        fieldset.appendChild(btn);
        container.appendChild(fieldset);
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '9') {
            const activeFieldset = document.querySelector('fieldset:not([data-completed])');
            if (activeFieldset) {
                const inputs = activeFieldset.querySelectorAll('input');
                const index = parseInt(e.key) - 1;
                if (inputs[index]) {
                    inputs[index].checked = true;
                }
            }
        } else if (e.key === 'Enter') {
            const activeFieldset = document.querySelector('fieldset:not([data-completed])');
            if (activeFieldset) {
                const button = activeFieldset.querySelector('button');
                if (button && !button.disabled) {
                    button.click();
                }
            }
        }
    });
}

function pickRandomQuestions(questions, count = 40) {
  const shuffled = questions.slice();

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

window.addEventListener('DOMContentLoaded', loadQuestions);