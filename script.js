'use strict';

// Get DOM elements
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const transactionFormEl = document.getElementById('transactionForm');
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');
const categoryEl = document.getElementById('category');
const dateEl = document.getElementById('date');
const transactionListEl = document.getElementById('transactionList');
const toggleHistoryBtn = document.getElementById('toggleHistory');
const exportDataBtn = document.getElementById('exportData');
const exportPDFBtn = document.getElementById('exportPDF');

// Define categories
const categories = {
    income: [
        'Salary/Wages',
        'Overtime Pay',
        'Bonuses',
        'Commissions',
        'Tips',
        'Stock Options',
        'Dividends',
        'Interest Income',
        'Freelance Payments'
    ],
    expense: [
        'Rent/Mortgage',
        'Utilities',
        'Internet and Phone Bills',
        'Groceries',
        'Transportation',
        'Insurance',
        'Healthcare',
        'Childcare/Education',
        'Debt Repayments',
        'Entertainment',
        'Clothing and Personal Items',
        'Savings and Investments',
        'Household Maintenance',
        'Subscriptions',
        'Taxes',
        'Gym Memberships',
        'Charitable Donations',
        'Travel and Vacations',
        'Pet Care',
        'Miscellaneous'
    ]
};

// Initialize transactions from localStorage or empty array
let transactions = loadTransactions();

// Initialize date input with today's date
dateEl.valueAsDate = new Date();

// Format number as currency
function formatMoney(amount) {
    return `£${Math.abs(amount).toFixed(2)}`;
}

// Update category options based on selected type
function updateCategoryOptions() {
    const type = typeEl.value;
    const options = categories[type];
    
    categoryEl.innerHTML = '<option value="">Select a category...</option>';
    options.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryEl.appendChild(option);
    });
}

// Update the UI with current transactions
function updateUI() {
    const totals = calculateTotals();
    
    // Update balance
    balanceEl.textContent = formatMoney(totals.balance);
    
    // Update income and expense
    incomeEl.textContent = formatMoney(totals.income);
    expenseEl.textContent = formatMoney(totals.expense);
    
    // Update transaction list
    displayTransactions();
    
    // Update charts
    updateCharts();
    
    // Save to localStorage
    updateLocalStorage();
}

// Calculate totals
function calculateTotals() {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            income += Number(transaction.amount);
        } else {
            expense += Number(transaction.amount);
        }
    });
    
    const balance = income - expense;
    return { balance, income, expense };
}

// Display transactions in the list
function displayTransactions() {
    transactionListEl.innerHTML = '';
    
    const sortedTransactions = [...transactions].reverse();
    
    sortedTransactions.forEach((transaction, index) => {
        const transactionEl = createTransactionElement(transaction);
        transactionListEl.appendChild(transactionEl);
    });
}

// Create transaction element
function createTransactionElement(transaction) {
    const transactionEl = document.createElement('div');
    transactionEl.classList.add('transaction-item');
    transactionEl.dataset.id = transaction.id;

    const info = document.createElement('div');
    info.classList.add('transaction-info');

    const date = document.createElement('div');
    date.classList.add('date');
    date.textContent = new Date(transaction.date).toLocaleDateString();
    info.appendChild(date);

    const category = document.createElement('div');
    category.classList.add('category');
    category.textContent = transaction.category;
    info.appendChild(category);

    if (transaction.description) {
        const description = document.createElement('div');
        description.classList.add('description');
        description.textContent = transaction.description;
        info.appendChild(description);
    }

    const amount = document.createElement('div');
    amount.classList.add('amount');
    amount.classList.add(transaction.type);
    amount.textContent = formatMoney(transaction.amount);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = () => {
        deleteTransaction(transaction.id);
        updateUI();
    };

    transactionEl.appendChild(info);
    transactionEl.appendChild(amount);
    transactionEl.appendChild(deleteBtn);

    return transactionEl;
}

// Toggle transaction history
toggleHistoryBtn.addEventListener('click', () => {
    toggleHistoryBtn.classList.toggle('collapsed');
    transactionListEl.classList.toggle('collapsed');
});

// Real-time amount validation and chart preview
let previewTimeout;
amountEl.addEventListener('input', (e) => {
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(() => {
        const amount = parseFloat(e.target.value) || 0;
        if (amount > 0) {
            // Create a temporary transaction for preview
            const previewTransaction = {
                type: typeEl.value,
                amount: amount,
                date: dateEl.value || new Date().toISOString()
            };
            
            // Create a preview dataset
            const previewTransactions = [...transactions, previewTransaction];
            updateCharts(previewTransactions);
        }
    }, 300); // Debounce preview updates
});

// Reset preview when changing transaction type
typeEl.addEventListener('change', () => {
    if (amountEl.value) {
        const event = new Event('input');
        amountEl.dispatchEvent(event);
    }
});

// Update charts function now accepts optional preview data
function updateCharts(previewData = null) {
    const data = previewData || transactions;
    
    // Calculate totals
    const totals = data.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
            acc.income += transaction.amount;
        } else {
            acc.expenses += transaction.amount;
        }
        return acc;
    }, { income: 0, expenses: 0 });

    // Update balance chart
    const balanceChart = Chart.getChart('balanceChart');
    if (balanceChart) {
        balanceChart.data.datasets[0].data = [totals.income, totals.expenses];
        balanceChart.update('none'); // Use 'none' mode for smoother updates
    } else {
        // Create new chart if it doesn't exist
        new Chart(document.getElementById('balanceChart'), {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [totals.income, totals.expenses],
                    backgroundColor: ['#48bb78', '#f56565'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                animation: {
                    duration: previewData ? 0 : 1000
                }
            }
        });
    }

    // Update trend chart
    const monthlyData = getMonthlyData(data);
    const trendChart = Chart.getChart('trendChart');
    
    if (trendChart) {
        trendChart.data.datasets[0].data = monthlyData.incomes;
        trendChart.data.datasets[1].data = monthlyData.expenses;
        trendChart.update('none');
    } else {
        new Chart(document.getElementById('trendChart'), {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: monthlyData.incomes,
                        borderColor: '#48bb78',
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: monthlyData.expenses,
                        borderColor: '#f56565',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: previewData ? 0 : 1000
                }
            }
        });
    }
}

// Get monthly data for trend chart
function getMonthlyData(data) {
    const months = [];
    const incomes = Array(6).fill(0);
    const expenses = Array(6).fill(0);
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toLocaleString('default', { month: 'short' }));
    }
    
    // Calculate monthly totals
    data.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthIndex = months.length - 1 - (new Date().getMonth() - date.getMonth());
        
        if (monthIndex >= 0 && monthIndex < 6) {
            if (transaction.type === 'income') {
                incomes[monthIndex] += transaction.amount;
            } else {
                expenses[monthIndex] += transaction.amount;
            }
        }
    });
    
    return {
        labels: months,
        incomes,
        expenses
    };
}

// Add new transaction
function addTransaction(e) {
    e.preventDefault();

    const type = typeEl.value;
    const category = categoryEl.value;
    const description = descriptionEl.value.trim();
    const date = dateEl.value;
    const amount = Number(amountEl.value);

    if (!category || amount <= 0) {
        alert('Please select a category and enter a valid amount');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        type: type,
        category: category,
        description: description,
        date: date,
        amount: amount
    };
    
    transactions.push(transaction);
    updateUI();
    
    // Reset form
    transactionFormEl.reset();
    dateEl.valueAsDate = new Date();
    updateCategoryOptions();
    descriptionEl.focus();
}

// Delete transaction
function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateUI();
}

// Export functionality
exportDataBtn.addEventListener('click', () => {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        transactions: transactions
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
});

// Export PDF functionality
async function generatePDF() {
    try {
        // Show loading state
        exportPDFBtn.disabled = true;
        exportPDFBtn.innerHTML = '<span class="action-icon">⏳</span> Generating...';

        // Calculate totals
        const totals = calculateTotals();

        // Create a new div for PDF content
        const pdfContent = document.createElement('div');
        pdfContent.className = 'pdf-content';
        pdfContent.style.cssText = `
            background: #ffffff;
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
            font-family: 'Inter', sans-serif;
        `;

        // Add header and summary
        pdfContent.innerHTML = `
            <div class="pdf-header" style="text-align: center; margin-bottom: 20px;">
                <h1 style="font-size: 24px; color: #2d3748; margin-bottom: 10px;">Budget Summary</h1>
                <div style="color: #718096;">${new Date().toLocaleDateString('en-GB', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; padding: 15px; background: #f7fafc; border-radius: 8px;">
                <div style="text-align: center;">
                    <div style="font-size: 14px; color: #718096; margin-bottom: 5px;">Current Balance</div>
                    <div style="font-size: 20px; font-weight: 600; color: #2d3748;">${formatMoney(totals.balance)}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 14px; color: #718096; margin-bottom: 5px;">Total Income</div>
                    <div style="font-size: 20px; font-weight: 600; color: #48bb78;">${formatMoney(totals.income)}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 14px; color: #718096; margin-bottom: 5px;">Total Expenses</div>
                    <div style="font-size: 20px; font-weight: 600; color: #f56565;">${formatMoney(totals.expense)}</div>
                </div>
            </div>

            <div class="pdf-transactions" style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h2 style="font-size: 20px; color: #2d3748; margin: 0;">Transaction History</h2>
                    <button id="pdf-toggle-history" style="
                        background: #f7fafc;
                        border: 1px solid #e2e8f0;
                        padding: 8px 16px;
                        border-radius: 6px;
                        color: #4a5568;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        transition: all 0.2s ease;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        outline: none;
                    ">
                        <span style="display: inline-block; transition: transform 0.2s ease;">▼</span>
                        Hide History
                    </button>
                </div>
                <div id="pdf-transaction-list" style="
                    transition: max-height 0.3s ease-in-out;
                    overflow: visible;
                    max-height: none;
                "></div>
            </div>

            <div style="page-break-before: always;"></div>

            <div class="pdf-charts" style="margin-bottom: 30px;">
                <h2 style="font-size: 20px; color: #2d3748; margin-bottom: 20px; text-align: center;">Financial Overview</h2>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    <div style="background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="font-size: 18px; color: #2d3748; margin-bottom: 20px; text-align: center;">Income vs Expenses</h3>
                        <div style="height: 300px; position: relative;">
                            <canvas id="pdf-balance-chart"></canvas>
                        </div>
                    </div>
                    <div style="background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="font-size: 18px; color: #2d3748; margin-bottom: 20px; text-align: center;">Monthly Trends</h3>
                        <div style="height: 300px; position: relative;">
                            <canvas id="pdf-trend-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add transactions
        const transactionList = pdfContent.querySelector('#pdf-transaction-list');
        const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedTransactions.forEach(transaction => {
            const item = document.createElement('div');
            item.style.cssText = `
                display: grid;
                grid-template-columns: auto 1fr auto;
                gap: 15px;
                padding: 12px;
                background: #f7fafc;
                border-radius: 6px;
                margin-bottom: 8px;
                align-items: center;
            `;
            
            const date = document.createElement('div');
            date.style.cssText = 'font-size: 14px; color: #718096;';
            date.textContent = new Date(transaction.date).toLocaleDateString();
            
            const details = document.createElement('div');
            details.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
            
            const category = document.createElement('div');
            category.style.cssText = 'font-weight: 500; color: #2d3748;';
            category.textContent = transaction.category;
            
            details.appendChild(category);
            
            if (transaction.description) {
                const description = document.createElement('div');
                description.style.cssText = 'font-size: 14px; color: #718096;';
                description.textContent = transaction.description;
                details.appendChild(description);
            }
            
            const amount = document.createElement('div');
            amount.style.cssText = `
                font-weight: 600;
                color: ${transaction.type === 'income' ? '#48bb78' : '#f56565'};
            `;
            amount.textContent = formatMoney(transaction.amount);
            
            item.appendChild(date);
            item.appendChild(details);
            item.appendChild(amount);
            
            transactionList.appendChild(item);
        });

        // Temporarily append to document for html2pdf
        document.body.appendChild(pdfContent);

        // Add toggle functionality
        const toggleBtn = document.getElementById('pdf-toggle-history');
        const transactionListEl = document.getElementById('pdf-transaction-list');
        
        if (toggleBtn && transactionListEl) {
            toggleBtn.onclick = function() {
                const isCollapsed = transactionListEl.style.maxHeight === '0px';
                const arrow = toggleBtn.querySelector('span');
                
                if (isCollapsed) {
                    transactionListEl.style.maxHeight = 'none';
                    transactionListEl.style.overflow = 'visible';
                    arrow.style.transform = 'rotate(0deg)';
                    toggleBtn.innerHTML = '<span style="display: inline-block; transition: transform 0.2s ease;">▼</span> Hide History';
                } else {
                    transactionListEl.style.maxHeight = '0px';
                    transactionListEl.style.overflow = 'hidden';
                    arrow.style.transform = 'rotate(-90deg)';
                    toggleBtn.innerHTML = '<span style="display: inline-block; transition: transform 0.2s ease; transform: rotate(-90deg)">▼</span> Show History';
                }
            };

            // Add hover effect
            toggleBtn.onmouseover = function() {
                this.style.background = '#edf2f7';
            };
            toggleBtn.onmouseout = function() {
                this.style.background = '#f7fafc';
            };
        }

        // Create and render charts
        const balanceChart = new Chart(document.getElementById('pdf-balance-chart'), {
            type: 'doughnut',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [totals.income, totals.expense],
                    backgroundColor: ['#48bb78', '#f56565'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#2d3748',
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                            }
                        }
                    }
                }
            }
        });

        const monthlyData = getMonthlyData(transactions);
        const trendChart = new Chart(document.getElementById('pdf-trend-chart'), {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: monthlyData.incomes,
                        borderColor: '#48bb78',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Expenses',
                        data: monthlyData.expenses,
                        borderColor: '#f56565',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#2d3748',
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#2d3748',
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    x: {
                        ticks: {
                            color: '#2d3748',
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                            }
                        }
                    }
                }
            }
        });

        // Wait for charts to render
        await new Promise(resolve => setTimeout(resolve, 500));

        const opt = {
            margin: [10, 10],
            filename: `budget-report-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait'
            }
        };

        // Generate PDF
        await html2pdf().set(opt).from(pdfContent).save();

        // Cleanup
        balanceChart.destroy();
        trendChart.destroy();
        document.body.removeChild(pdfContent);

    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF: ' + error.message);
    } finally {
        // Reset button state
        exportPDFBtn.disabled = false;
        exportPDFBtn.innerHTML = '<span class="action-icon">📄</span> Export PDF';
    }
}

// Add event listener for PDF export
exportPDFBtn.addEventListener('click', generatePDF);

// Update updateLocalStorage function
function updateLocalStorage() {
    const data = {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        transactions: transactions
    };
    localStorage.setItem('transactions', JSON.stringify(data));
}

// Update loadTransactions function
function loadTransactions() {
    const savedData = JSON.parse(localStorage.getItem('transactions'));
    
    if (savedData && savedData.version && savedData.transactions) {
        // Handle versioned data
        return savedData.transactions;
    } else if (savedData && Array.isArray(savedData)) {
        // Handle legacy data (just array of transactions)
        return savedData;
    } else {
        return [];
    }
}

// Event listeners
transactionFormEl.addEventListener('submit', addTransaction);
typeEl.addEventListener('change', updateCategoryOptions);

// Initial setup
updateCategoryOptions();
document.addEventListener('DOMContentLoaded', updateUI);
