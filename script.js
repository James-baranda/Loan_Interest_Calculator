document.getElementById('loan-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const term = parseInt(document.getElementById('term').value);

    if (amount <= 0 || rate < 0 || term <= 0) {
        alert('Please enter valid values.');
        return;
    }

    const monthlyRate = rate / 100 / 12;
    const n = term * 12;
    let monthlyPayment;
    if (monthlyRate === 0) {
        monthlyPayment = amount / n;
    } else {
        monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);
    }
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - amount;

    document.getElementById('monthly-payment').textContent = monthlyPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('total-interest').textContent = totalInterest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('total-payment').textContent = totalPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('results').style.display = 'block';

    // Generate amortization table
    generateAmortizationTable(amount, monthlyRate, monthlyPayment, n);
});

function generateAmortizationTable(principal, monthlyRate, monthlyPayment, n) {
    const tbody = document.querySelector('#amortization-table tbody');
    tbody.innerHTML = '';
    let balance = principal;
    let totalPrincipal = 0;
    let totalInterest = 0;
    for (let i = 1; i <= n; i++) {
        let interest = balance * monthlyRate;
        let principalPaid = monthlyPayment - interest;
        if (balance < monthlyPayment) {
            principalPaid = balance;
            monthlyPayment = principalPaid + interest;
        }
        balance -= principalPaid;
        if (balance < 0.01) balance = 0;
        totalPrincipal += principalPaid;
        totalInterest += interest;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td>${principalPaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${interest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${(principalPaid + interest).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        `;
        tbody.appendChild(row);
        if (balance === 0) break;
    }
    document.getElementById('amortization-section').style.display = 'block';
}

document.getElementById('export-csv').addEventListener('click', function() {
    const rows = document.querySelectorAll('#amortization-table tr');
    let csv = '';
    rows.forEach(row => {
        let cols = row.querySelectorAll('th, td');
        let rowData = [];
        cols.forEach(col => rowData.push('"' + col.innerText + '"'));
        csv += rowData.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'amortization_table.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}); 