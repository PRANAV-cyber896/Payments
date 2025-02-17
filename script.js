document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const voiceInputButton = document.getElementById('voice-input');
    const viewSummaryButton = document.getElementById('view-summary');
    const viewTransactionsButton = document.getElementById('view-transactions');
    const deleteTransactionsButton = document.getElementById('delete-transactions');
    const summaryDiv = document.getElementById('summary');
    const transactionListDiv = document.getElementById('transaction-list');
    const backButton = document.getElementById('back');
    const backToSummaryButton = document.getElementById('back-to-summary');
    const balanceElement = document.getElementById('balance');
    const transactionsElement = document.getElementById('transactions');

    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const saveTransactions = () => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    };

    const addTransaction = (amount, type, recipient) => {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toTimeString().split(' ')[0].substring(0, 5);
        transactions.push({ date, time, amount: parseFloat(amount), type, recipient });
        saveTransactions();
    };

    const calculateBalance = () => {
        let balance = 0;
        transactions.forEach(transaction => {
            if (transaction.type === 'paid') {
                balance -= transaction.amount;
            } else {
                balance += transaction.amount;
            }
        });
        return balance;
    };

    const renderTransactions = () => {
        transactionsElement.innerHTML = '';
        transactions.forEach(transaction => {
            const transactionElement = document.createElement('li');
            transactionElement.textContent = `${transaction.date} ${transaction.time} - ₹${transaction.amount} ${transaction.type} to ${transaction.recipient}`;
            transactionsElement.appendChild(transactionElement);
        });
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const amount = document.getElementById('amount').value;
        const type = document.getElementById('type').value;
        const recipient = document.getElementById('recipient').value;
        addTransaction(amount, type, recipient);
        form.reset();
    });

    viewSummaryButton.addEventListener('click', () => {
        const balance = calculateBalance();
        balanceElement.textContent = `Balance: ₹${balance}`;
        summaryDiv.style.display = 'block';
        form.style.display = 'none';
        viewSummaryButton.style.display = 'none';
        viewTransactionsButton.style.display = 'none';
        deleteTransactionsButton.style.display = 'none';
    });

    viewTransactionsButton.addEventListener('click', () => {
        renderTransactions();
        transactionListDiv.style.display = 'block';
        form.style.display = 'none';
        viewSummaryButton.style.display = 'none';
        viewTransactionsButton.style.display = 'none';
        deleteTransactionsButton.style.display = 'none';
    });

    backButton.addEventListener('click', () => {
        summaryDiv.style.display = 'none';
        form.style.display = 'block';
        viewSummaryButton.style.display = 'block';
        viewTransactionsButton.style.display = 'block';
        deleteTransactionsButton.style.display = 'block';
    });

    backToSummaryButton.addEventListener('click', () => {
        transactionListDiv.style.display = 'none';
        summaryDiv.style.display = 'block';
        viewSummaryButton.style.display = 'block';
        viewTransactionsButton.style.display = 'block';
        deleteTransactionsButton.style.display = 'block';
    });

    deleteTransactionsButton.addEventListener('click', () => {
        transactions.length = 0;
        saveTransactions();
        alert('All transactions have been deleted.');
    });

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        voiceInputButton.addEventListener('click', () => {
            recognition.start();
        });

        recognition.onresult = (event) => {
            const voiceInput = event.results[0][0].transcript;
            const parsedInput = parseVoiceInput(voiceInput);
            if (parsedInput) {
                const { amount, type, recipient } = parsedInput;
                addTransaction(amount, type, recipient);
                alert('Transaction added.');
            } else {
                alert('Invalid voice input. Please say the amount, type, and recipient.');
            }
        };

        recognition.onerror = (event) => {
            alert('Voice recognition error: ' + event.error);
        };
    } else {
        voiceInputButton.disabled = true;
        alert('Your browser does not support voice recognition.');
    }

    const parseVoiceInput = (input) => {
        const regex = /(\d+|[a-zA-Z\s]+)\s+rupees?\s+(paid|received)\s+to\s+(\w+)/i;
        const match = input.match(regex);
        if (match) {
            let amount = match[1];
            if (isNaN(amount)) {
                amount = spokenNumber(amount);
            }
            return {
                amount: amount,
                type: match[2].toLowerCase(),
                recipient: match[3]
            };
        }
        return null;
    };
});
