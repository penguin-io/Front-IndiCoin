const BACKEND_URL = 'http://localhost:8045';

document.addEventListener('DOMContentLoaded', () => {
    // Handle "Connect Wallet" button on homepage
    const connectWalletButton = document.querySelector('button.btn-primary');
    if (connectWalletButton && connectWalletButton.textContent.includes('Connect Wallet')) {
        connectWalletButton.addEventListener('click', () => {
            window.location.href = 'connect wallet.html';
        });
    }

    // Handle "Get Started" button on homepage
    const getStartedButton = document.querySelector('button.btn-primary');
    if (getStartedButton && getStartedButton.textContent.includes('Get Started')) {
        getStartedButton.addEventListener('click', () => {
            window.location.href = 'connect wallet.html'; // Redirect to login/register page
        });
    }

    // Handle Login button on connect wallet page
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch(`${BACKEND_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Login successful!');
                    localStorage.setItem('connectedAccount', data.walletAddress); // Store wallet address from backend
                    window.location.href = 'dashboard.html';
                } else {
                    alert(`Login failed: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again later.');
            }
        });
    }

    // Handle Register button on connect wallet page
    const registerButton = document.getElementById('registerButton');
    if (registerButton) {
        registerButton.addEventListener('click', async () => {
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const walletAddress = document.getElementById('registerWalletAddress').value;

            if (!username || !password || !walletAddress) {
                alert('Please fill in all registration fields.');
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password, walletAddress }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registration successful! You can now log in.');
                    localStorage.setItem('connectedAccount', walletAddress); // Store wallet address
                    window.location.href = 'dashboard.html';
                } else {
                    alert(`Registration failed: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('An error occurred during registration. Please try again later.');
            }
        });
    }

    // Dashboard specific logic
    if (window.location.pathname.includes('dashboard.html')) {
        const connectedAccount = localStorage.getItem('connectedAccount');
        if (connectedAccount) {
            // Update wallet address display
            const walletAddressElement = document.getElementById('walletAddress');
            if (walletAddressElement) {
                walletAddressElement.textContent = `Wallet Address: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`;
            }

            // Fetch and display INDC balance
            const indcBalanceElement = document.getElementById('indcBalance');
            if (indcBalanceElement) {
                fetch(`${BACKEND_URL}/balance/${connectedAccount}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.balance !== undefined) {
                            indcBalanceElement.textContent = data.balance;
                        } else {
                            indcBalanceElement.textContent = 'N/A';
                            console.error('Balance not found in response:', data);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching INDC balance:', error);
                        indcBalanceElement.textContent = 'Error';
                    });
            }
        }

        // Handle Send INDC button
        const sendIndcButton = document.getElementById('sendIndcButton');
        if (sendIndcButton) {
            sendIndcButton.addEventListener('click', () => {
                window.location.href = 'send.html';
            });
        }

        // Handle Redeem INDC button
        const redeemIndcButton = document.getElementById('redeemIndcButton');
        if (redeemIndcButton) {
            redeemIndcButton.addEventListener('click', () => {
                window.location.href = 'redeem.html';
            });
        }
    }

    // Deposit specific logic
    if (window.location.pathname.includes('deposit.html')) {
        const depositButton = document.getElementById('depositButton');
        const depositAmountInput = document.getElementById('depositAmountInput');
        const transactionStatusElement = document.querySelector('p.text-secondary:nth-of-type(1)');
        const equivalentIndcElement = document.querySelector('p.text-secondary:nth-of-type(2)');
        const confirmationElement = document.querySelector('p.text-secondary:nth-of-type(3)');

        if (depositButton && depositAmountInput) {
            depositButton.addEventListener('click', async () => {
                const amount = depositAmountInput.value;
                if (!amount || isNaN(amount) || amount <= 0) {
                    alert('Please enter a valid deposit amount.');
                    return;
                }

                transactionStatusElement.textContent = 'Transaction Status: Processing...';
                equivalentIndcElement.textContent = 'Equivalent INDC to be Minted: Calculating...';
                confirmationElement.textContent = ''; // Clear previous confirmation

                try {
                    const connectedAccount = localStorage.getItem('connectedAccount');
                    if (!connectedAccount) {
                        alert('Please connect your wallet first.');
                        return;
                    }

                    const response = await fetch(`${BACKEND_URL}/buy`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ amount: parseFloat(amount), address: connectedAccount }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        transactionStatusElement.textContent = `Transaction Status: ${data.status || 'Completed'}`;
                        equivalentIndcElement.textContent = `Equivalent INDC to be Minted: ${data.mintedINDC || amount} INDC`;
                        confirmationElement.textContent = `Confirmation: Deposit successful! ${data.mintedINDC || amount} INDC minted and added to your wallet.`;
                        alert('Deposit successful!');
                    } else {
                        transactionStatusElement.textContent = `Transaction Status: Failed`;
                        confirmationElement.textContent = `Error: ${data.message || response.statusText}`;
                        alert(`Deposit failed: ${data.message || response.statusText}`);
                    }
                } catch (error) {
                    console.error('Error during deposit:', error);
                    transactionStatusElement.textContent = 'Transaction Status: Error';
                    confirmationElement.textContent = 'An error occurred during deposit. Please try again later.';
                    alert('An error occurred during deposit. Please try again later.');
                }
            });
        }

        // Display connected wallet address on deposit page
        const walletAddressElement = document.querySelector('p.text-white.fs-6.fw-normal.pb-3.pt-1.px-4');
        const connectedAccount = localStorage.getItem('connectedAccount');
        if (walletAddressElement && connectedAccount) {
            walletAddressElement.textContent = `Your Wallet Address: ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`;
        }
    }

    // Redeem specific logic
    if (window.location.pathname.includes('redeem.html')) {
        const redeemAmountInput = document.getElementById('redeemAmountInput');
        const confirmRedemptionButton = document.getElementById('confirmRedemptionButton');
        const currentIndcBalanceElement = document.querySelector('p.text-white.fs-6.fw-normal.pb-3.pt-1.px-4');
        const amountToReceiveElement = document.querySelector('p.text-secondary:nth-of-type(2)');
        const confirmationSummaryAmount = document.querySelector('.p-4.row.g-3 > div:nth-child(1) .text-white');
        const confirmationSummaryFee = document.querySelector('.p-4.row.g-3 > div:nth-child(2) .text-white');
        const confirmationSummaryTotal = document.querySelector('.p-4.row.g-3 > div:nth-child(3) .text-white');

        // Update current INDC balance display
        const connectedAccount = localStorage.getItem('connectedAccount');
        if (connectedAccount && currentIndcBalanceElement) {
            fetch(`${BACKEND_URL}/balance/${connectedAccount}`)
                .then(response => response.json())
                .then(data => {
                    if (data.balance !== undefined) {
                        currentIndcBalanceElement.textContent = `Your current INDC balance: ${data.balance}`;
                    } else {
                        currentIndcBalanceElement.textContent = 'Your current INDC balance: N/A';
                    }
                })
                .catch(error => {
                    console.error('Error fetching INDC balance for redeem page:', error);
                    currentIndcBalanceElement.textContent = 'Your current INDC balance: Error';
                });
        }

        if (redeemAmountInput) {
            redeemAmountInput.addEventListener('input', () => {
                const amount = parseFloat(redeemAmountInput.value);
                const fee = amount * 0.005; // 0.5% fee
                const amountToReceive = amount - fee;

                if (!isNaN(amountToReceive)) {
                    amountToReceiveElement.textContent = `You will receive: ${amountToReceive.toFixed(2)} INR`;
                    confirmationSummaryAmount.textContent = `${amount.toFixed(2)} INDC`;
                    confirmationSummaryFee.textContent = `${fee.toFixed(2)} INR`;
                    confirmationSummaryTotal.textContent = `${amountToReceive.toFixed(2)} INR`;
                } else {
                    amountToReceiveElement.textContent = 'You will receive: 0 INR';
                    confirmationSummaryAmount.textContent = '0 INDC';
                    confirmationSummaryFee.textContent = '0 INR';
                    confirmationSummaryTotal.textContent = '0 INR';
                }
            });
        }

        if (confirmRedemptionButton) {
            confirmRedemptionButton.addEventListener('click', async () => {
                const amount = parseFloat(redeemAmountInput.value);
                if (!amount || isNaN(amount) || amount <= 0) {
                    alert('Please enter a valid amount to redeem.');
                    return;
                }

                try {
                    const connectedAccount = localStorage.getItem('connectedAccount');
                    if (!connectedAccount) {
                        alert('Please connect your wallet first.');
                        return;
                    }

                    const response = await fetch(`${BACKEND_URL}/burn`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ amount: amount, address: connectedAccount }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert('Redemption successful!');
                        window.location.reload(); // Reload to update balance
                    } else {
                        alert(`Redemption failed: ${data.message || response.statusText}`);
                    }
                } catch (error) {
                    console.error('Error during redemption:', error);
                    alert('An error occurred during redemption. Please try again later.');
                }
            });
        }
    }

    // Send specific logic
    if (window.location.pathname.includes('send.html')) {
        const sendAmountInput = document.getElementById('sendAmount');
        const recipientAddressInput = document.getElementById('recipientAddress');
        const sendIndcConfirmButton = document.getElementById('sendIndcConfirmButton');
        const currentIndcBalanceElement = document.getElementById('currentIndcBalance');

        // Fetch and display current INDC balance
        const connectedAccount = localStorage.getItem('connectedAccount');
        if (connectedAccount && currentIndcBalanceElement) {
            fetch(`${BACKEND_URL}/balance/${connectedAccount}`)
                .then(response => response.json())
                .then(data => {
                    if (data.balance !== undefined) {
                        currentIndcBalanceElement.textContent = data.balance;
                    } else {
                        currentIndcBalanceElement.textContent = 'N/A';
                    }
                })
                .catch(error => {
                    console.error('Error fetching INDC balance for send page:', error);
                    currentIndcBalanceElement.textContent = 'Error';
                });
        }

        if (sendIndcConfirmButton) {
            sendIndcConfirmButton.addEventListener('click', async () => {
                const amount = parseFloat(sendAmountInput.value);
                const recipientAddress = recipientAddressInput.value;

                if (!amount || isNaN(amount) || amount <= 0) {
                    alert('Please enter a valid amount to send.');
                    return;
                }
                if (!recipientAddress) {
                    alert('Please enter a recipient address.');
                    return;
                }

                try {
                    const connectedAccount = localStorage.getItem('connectedAccount');
                    if (!connectedAccount) {
                        alert('Please connect your wallet first.');
                        return;
                    }

                    const response = await fetch(`${BACKEND_URL}/transfer`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ from: connectedAccount, to: recipientAddress, amount: amount }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert('INDC sent successfully!');
                        window.location.href = 'dashboard.html'; // Redirect to dashboard after sending
                    } else {
                        alert(`Failed to send INDC: ${data.message || response.statusText}`);
                    }
                } catch (error) {
                    console.error('Error sending INDC:', error);
                    alert('An error occurred while sending INDC. Please try again later.');
                }
            });
        }
    }

    // Verify Identity specific logic
    if (window.location.pathname.includes('verify identity.html')) {
        const continueButton = document.querySelector('button.btn-primary');
        const idTypeSelect = document.getElementById('idTypeSelect');
        const idNumberInput = document.querySelector('input[placeholder="ID Number"]');

        if (continueButton) {
            continueButton.addEventListener('click', async () => {
                const idType = idTypeSelect.value;
                const idNumber = idNumberInput.value;

                if (!idType || idType === 'one') {
                    alert('Please select an ID type.');
                    return;
                }
                if (!idNumber) {
                    alert('Please enter your ID number.');
                    return;
                }

                try {
                    const connectedAccount = localStorage.getItem('connectedAccount');
                    if (!connectedAccount) {
                        alert('Please connect your wallet first.');
                        return;
                    }

                    const response = await fetch(`${BACKEND_URL}/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ idType, idNumber, walletAddress: connectedAccount }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        alert('Identity verification successful!');
                        window.location.href = 'dashboard.html';
                    } else {
                        alert(`Identity verification failed: ${data.message || response.statusText}`);
                    }
                } catch (error) {
                    console.error('Error during identity verification:', error);
                    alert('An error occurred during identity verification. Please try again later.');
                }
            });
        }
    }
});

    

    // Handle Login button
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch(`${BACKEND_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Login successful!');
                    localStorage.setItem('connectedAccount', username); // Using username as wallet address for simplicity
                    window.location.href = 'dashboard.html';
                } else {
                    alert(`Login failed: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login. Please try again later.');
            }
        });
    }

    // Handle Register button
    const registerButton = document.getElementById('registerButton');
    if (registerButton) {
        registerButton.addEventListener('click', async () => {
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const walletAddress = document.getElementById('registerWalletAddress').value;

            if (!username || !password || !walletAddress) {
                alert('Please fill in all registration fields.');
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password, walletAddress }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registration successful! You can now log in.');
                    // Optionally log in the user automatically after registration
                    localStorage.setItem('connectedAccount', walletAddress); // Store wallet address
                    window.location.href = 'dashboard.html';
                } else {
                    alert(`Registration failed: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('An error occurred during registration. Please try again later.');
            }
        });
    }
