const BACKEND_URL = "http://localhost:8045";

// Utility functions
const utils = {
  showLoading: (element) => {
    if (element) {
      element.disabled = true;
      const originalText = element.textContent;
      element.innerHTML = `<span class="loading-spinner"></span> Loading...`;
      element.dataset.originalText = originalText;
    }
  },

  hideLoading: (element) => {
    if (element && element.dataset.originalText) {
      element.disabled = false;
      element.innerHTML = element.dataset.originalText;
      delete element.dataset.originalText;
    }
  },

  showNotification: (message, type = "info", duration = 5000) => {
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} position-fixed`;
    notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
    notification.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <span>${message}</span>
                <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close"></button>
            </div>
        `;

    document.body.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);

    // Manual close
    notification.querySelector(".btn-close").addEventListener("click", () => {
      notification.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
  },

  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validateWalletAddress: (address) => {
    const re = /^0x[a-fA-F0-9]{40}$/;
    return re.test(address);
  },

  formatNumber: (num) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  },

  truncateAddress: (address, start = 6, end = 4) => {
    if (!address) return "";
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  },

  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      utils.showNotification("Copied to clipboard!", "success", 2000);
    } catch (err) {
      utils.showNotification("Failed to copy to clipboard", "danger", 3000);
    }
  },
};

// Animation utilities
const animations = {
  fadeIn: (element, delay = 0) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    setTimeout(() => {
      element.style.transition = "all 0.6s ease-out";
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, delay);
  },

  slideIn: (element, direction = "left", delay = 0) => {
    const transform =
      direction === "left" ? "translateX(-20px)" : "translateX(20px)";
    element.style.opacity = "0";
    element.style.transform = transform;
    setTimeout(() => {
      element.style.transition = "all 0.4s ease-out";
      element.style.opacity = "1";
      element.style.transform = "translateX(0)";
    }, delay);
  },

  scaleIn: (element, delay = 0) => {
    element.style.opacity = "0";
    element.style.transform = "scale(0.9)";
    setTimeout(() => {
      element.style.transition = "all 0.4s ease-out";
      element.style.opacity = "1";
      element.style.transform = "scale(1)";
    }, delay);
  },
};

// Form validation
const validation = {
  addInputValidation: (input, validator, errorMessage) => {
    const errorDiv = document.createElement("div");
    errorDiv.className = "invalid-feedback d-block";
    errorDiv.style.display = "none";
    input.parentNode.appendChild(errorDiv);

    const validate = () => {
      const isValid = validator(input.value);
      if (isValid) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        errorDiv.style.display = "none";
      } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = "block";
      }
      return isValid;
    };

    input.addEventListener("blur", validate);
    input.addEventListener("input", () => {
      if (input.classList.contains("is-invalid")) {
        validate();
      }
    });

    return validate;
  },
};

// API helper
const api = {
  async request(endpoint, options = {}) {
    const url = `${BACKEND_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },
};

// Page-specific handlers
const pageHandlers = {
  homepage: () => {
    // Animate hero section
    const heroSection = document.querySelector(".hero-section");
    if (heroSection) {
      animations.fadeIn(heroSection, 200);
    }

    // Animate team cards
    const teamCards = document.querySelectorAll(".team-member");
    teamCards.forEach((card, index) => {
      animations.scaleIn(card, 300 + index * 100);
    });

    // Connect wallet buttons
    const connectButtons = document.querySelectorAll("[data-connect-wallet]");
    connectButtons.forEach((button) => {
      button.addEventListener("click", () => {
        window.location.href = "connect wallet.html";
      });
    });
  },

  connectWallet: () => {
    // Animate form tabs
    const tabContent = document.querySelector(".tab-content");
    if (tabContent) {
      animations.fadeIn(tabContent, 200);
    }

    // Setup form validation
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
      const usernameInput = document.getElementById("loginUsername");
      const passwordInput = document.getElementById("loginPassword");

      if (usernameInput) {
        validation.addInputValidation(
          usernameInput,
          (value) => value.trim().length >= 3,
          "Username must be at least 3 characters long",
        );
      }

      if (passwordInput) {
        validation.addInputValidation(
          passwordInput,
          (value) => value.length >= 6,
          "Password must be at least 6 characters long",
        );
      }
    }

    if (registerForm) {
      const usernameInput = document.getElementById("registerUsername");
      const passwordInput = document.getElementById("registerPassword");
      const walletInput = document.getElementById("registerWalletAddress");

      if (usernameInput) {
        validation.addInputValidation(
          usernameInput,
          (value) => value.trim().length >= 3,
          "Username must be at least 3 characters long",
        );
      }

      if (passwordInput) {
        validation.addInputValidation(
          passwordInput,
          (value) => value.length >= 8,
          "Password must be at least 8 characters long",
        );
      }

      if (walletInput) {
        validation.addInputValidation(
          walletInput,
          utils.validateWalletAddress,
          "Please enter a valid Ethereum wallet address",
        );
      }
    }

    // Login handler
    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
      loginButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const username = document.getElementById("loginUsername")?.value;
        const password = document.getElementById("loginPassword")?.value;

        if (!username || !password) {
          utils.showNotification("Please fill in all fields", "warning");
          return;
        }

        utils.showLoading(loginButton);

        try {
          const data = await api.request("/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
          });

          localStorage.setItem("connectedAccount", data.walletAddress);
          localStorage.setItem("userToken", data.token || "dummy-token");
          localStorage.setItem("username", username);

          utils.showNotification("Login successful!", "success");

          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1000);
        } catch (error) {
          utils.showNotification(`Login failed: ${error.message}`, "danger");
        } finally {
          utils.hideLoading(loginButton);
        }
      });
    }

    // Register handler
    const registerButton = document.getElementById("registerButton");
    if (registerButton) {
      registerButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const username = document.getElementById("registerUsername")?.value;
        const password = document.getElementById("registerPassword")?.value;
        const walletAddress = document.getElementById(
          "registerWalletAddress",
        )?.value;

        if (!username || !password || !walletAddress) {
          utils.showNotification("Please fill in all fields", "warning");
          return;
        }

        if (!utils.validateWalletAddress(walletAddress)) {
          utils.showNotification(
            "Please enter a valid wallet address",
            "warning",
          );
          return;
        }

        utils.showLoading(registerButton);

        try {
          const data = await api.request("/register", {
            method: "POST",
            body: JSON.stringify({ username, password, walletAddress }),
          });

          utils.showNotification("Registration successful!", "success");

          setTimeout(() => {
            window.location.href = "verify identity.html";
          }, 1000);
        } catch (error) {
          utils.showNotification(
            `Registration failed: ${error.message}`,
            "danger",
          );
        } finally {
          utils.hideLoading(registerButton);
        }
      });
    }
  },

  dashboard: () => {
    // Check authentication
    const token = localStorage.getItem("userToken");
    const walletAddress = localStorage.getItem("connectedAccount");

    if (!token || !walletAddress) {
      utils.showNotification("Please log in to access dashboard", "warning");
      setTimeout(() => {
        window.location.href = "connect wallet.html";
      }, 2000);
      return;
    }

    // Display wallet address
    const walletAddressElement = document.getElementById("walletAddress");
    if (walletAddressElement && walletAddress) {
      walletAddressElement.innerHTML = `
                <span class="wallet-address" onclick="utils.copyToClipboard('${walletAddress}')" style="cursor: pointer;" title="Click to copy">
                    Wallet Address: ${utils.truncateAddress(walletAddress)}
                </span>
            `;
    }

    // Animate dashboard elements
    const balanceCard = document.querySelector(".stats-card");
    if (balanceCard) {
      animations.scaleIn(balanceCard, 200);
    }

    const actionButtons = document.querySelectorAll(".btn");
    actionButtons.forEach((button, index) => {
      animations.slideIn(button, "left", 300 + index * 100);
    });

    // Load balance
    loadUserBalance();

    // Navigation handlers
    const sendButton = document.getElementById("sendIndcButton");
    if (sendButton) {
      sendButton.addEventListener("click", () => {
        window.location.href = "send.html";
      });
    }

    const redeemButton = document.getElementById("redeemIndcButton");
    if (redeemButton) {
      redeemButton.addEventListener("click", () => {
        window.location.href = "redeem.html";
      });
    }

    // Add deposit button if not exists
    const depositButton = document.querySelector("[data-deposit]");
    if (!depositButton) {
      const buttonContainer = document.querySelector(
        ".justify-stretch .d-flex",
      );
      if (buttonContainer) {
        const newDepositBtn = document.createElement("button");
        newDepositBtn.className = "btn btn-success px-4 py-2 me-2";
        newDepositBtn.innerHTML = "<span>Deposit INR</span>";
        newDepositBtn.addEventListener("click", () => {
          window.location.href = "deposit.html";
        });
        buttonContainer.insertBefore(newDepositBtn, buttonContainer.firstChild);
      }
    }
  },

  deposit: () => {
    const depositButton = document.getElementById("depositButton");
    const amountInput = document.getElementById("depositAmountInput");

    if (amountInput) {
      validation.addInputValidation(
        amountInput,
        (value) => !isNaN(value) && parseFloat(value) > 0,
        "Please enter a valid amount greater than 0",
      );
    }

    if (depositButton) {
      depositButton.addEventListener("click", async () => {
        const amount = amountInput?.value;

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
          utils.showNotification("Please enter a valid amount", "warning");
          return;
        }

        utils.showLoading(depositButton);

        try {
          // Simulate Razorpay integration
          await new Promise((resolve) => setTimeout(resolve, 2000));

          utils.showNotification(
            "Deposit successful! INDC tokens have been minted to your wallet.",
            "success",
          );

          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 2000);
        } catch (error) {
          utils.showNotification(`Deposit failed: ${error.message}`, "danger");
        } finally {
          utils.hideLoading(depositButton);
        }
      });
    }
  },

  send: () => {
    const sendButton = document.getElementById("sendIndcConfirmButton");
    const recipientInput = document.getElementById("recipientAddress");
    const amountInput = document.getElementById("sendAmount");
    const balanceElement = document.getElementById("currentIndcBalance");

    // Load current balance
    if (balanceElement) {
      const balance = localStorage.getItem("indcBalance") || "0";
      balanceElement.textContent = utils.formatNumber(balance);
    }

    // Add validation
    if (recipientInput) {
      validation.addInputValidation(
        recipientInput,
        utils.validateWalletAddress,
        "Please enter a valid wallet address",
      );
    }

    if (amountInput) {
      validation.addInputValidation(
        amountInput,
        (value) => {
          const amount = parseFloat(value);
          const balance = parseFloat(
            localStorage.getItem("indcBalance") || "0",
          );
          return !isNaN(amount) && amount > 0 && amount <= balance;
        },
        "Amount must be greater than 0 and not exceed your balance",
      );
    }

    if (sendButton) {
      sendButton.addEventListener("click", async () => {
        const recipient = recipientInput?.value;
        const amount = amountInput?.value;

        if (!recipient || !amount) {
          utils.showNotification("Please fill in all fields", "warning");
          return;
        }

        if (!utils.validateWalletAddress(recipient)) {
          utils.showNotification(
            "Please enter a valid recipient address",
            "warning",
          );
          return;
        }

        const numAmount = parseFloat(amount);
        const balance = parseFloat(localStorage.getItem("indcBalance") || "0");

        if (numAmount > balance) {
          utils.showNotification("Insufficient balance", "warning");
          return;
        }

        utils.showLoading(sendButton);

        try {
          // Simulate blockchain transaction
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Update local balance
          const newBalance = balance - numAmount;
          localStorage.setItem("indcBalance", newBalance.toString());

          utils.showNotification(
            `Successfully sent ${utils.formatNumber(numAmount)} INDC to ${utils.truncateAddress(recipient)}`,
            "success",
          );

          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 2000);
        } catch (error) {
          utils.showNotification(
            `Transaction failed: ${error.message}`,
            "danger",
          );
        } finally {
          utils.hideLoading(sendButton);
        }
      });
    }
  },

  redeem: () => {
    const redeemButton = document.getElementById("confirmRedemptionButton");
    const amountInput = document.getElementById("redeemAmountInput");

    if (amountInput) {
      validation.addInputValidation(
        amountInput,
        (value) => {
          const amount = parseFloat(value);
          const balance = parseFloat(
            localStorage.getItem("indcBalance") || "0",
          );
          return !isNaN(amount) && amount > 0 && amount <= balance;
        },
        "Amount must be greater than 0 and not exceed your balance",
      );

      // Update calculations on input
      amountInput.addEventListener("input", () => {
        const amount = parseFloat(amountInput.value) || 0;
        const fee = amount * 0.005; // 0.5% fee
        const total = amount - fee;

        document.querySelector("[data-redeem-amount]").textContent =
          `${utils.formatNumber(amount)} INDC`;
        document.querySelector("[data-transaction-fee]").textContent =
          `${utils.formatNumber(fee)} INR`;
        document.querySelector("[data-total-receive]").textContent =
          `${utils.formatNumber(total)} INR`;
      });
    }

    if (redeemButton) {
      redeemButton.addEventListener("click", async () => {
        const amount = amountInput?.value;

        if (!amount || parseFloat(amount) <= 0) {
          utils.showNotification("Please enter a valid amount", "warning");
          return;
        }

        utils.showLoading(redeemButton);

        try {
          // Simulate redemption process
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const balance = parseFloat(
            localStorage.getItem("indcBalance") || "0",
          );
          const newBalance = balance - parseFloat(amount);
          localStorage.setItem("indcBalance", newBalance.toString());

          utils.showNotification(
            "Redemption successful! INR will be transferred to your bank account within 1-3 business days.",
            "success",
          );

          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 2000);
        } catch (error) {
          utils.showNotification(
            `Redemption failed: ${error.message}`,
            "danger",
          );
        } finally {
          utils.hideLoading(redeemButton);
        }
      });
    }
  },
};

// Load user balance
async function loadUserBalance() {
  const balanceElement = document.getElementById("indcBalance");
  if (!balanceElement) return;

  try {
    // Check localStorage first
    let balance = localStorage.getItem("indcBalance");

    if (!balance) {
      // Try to fetch from backend
      try {
        const data = await api.request("/balance");
        balance = data.balance || "10000"; // Default balance
        localStorage.setItem("indcBalance", balance);
      } catch (error) {
        // Fallback to default
        balance = "10000";
        localStorage.setItem("indcBalance", balance);
      }
    }

    // Animate balance update
    balanceElement.style.opacity = "0.5";
    setTimeout(() => {
      balanceElement.textContent = utils.formatNumber(balance);
      balanceElement.style.opacity = "1";
    }, 200);
  } catch (error) {
    console.error("Failed to load balance:", error);
    balanceElement.textContent = "0";
  }
}

// Initialize page
function initializePage() {
  const currentPage = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "");

  // Add smooth scroll behavior
  document.documentElement.style.scrollBehavior = "smooth";

  // Initialize based on current page
  switch (currentPage) {
    case "homepage":
    case "":
    case "index":
      pageHandlers.homepage();
      break;
    case "connect wallet":
      pageHandlers.connectWallet();
      break;
    case "dashboard":
      pageHandlers.dashboard();
      break;
    case "deposit":
      pageHandlers.deposit();
      break;
    case "send":
      pageHandlers.send();
      break;
    case "redeem":
      pageHandlers.redeem();
      break;
  }

  // Global enhancements
  addGlobalEnhancements();
}

// Add global enhancements
function addGlobalEnhancements() {
  // Add ripple effect to buttons
  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: translate(${x}px, ${y}px) scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

      button.style.position = "relative";
      button.style.overflow = "hidden";
      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add loading states to forms
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      const submitButton = form.querySelector(
        'button[type="submit"], .btn-primary',
      );
      if (submitButton) {
        utils.showLoading(submitButton);
      }
    });
  });

  // Add keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Close any open modals or notifications
      document.querySelectorAll(".alert").forEach((alert) => {
        alert.style.animation = "slideOutRight 0.3s ease-out";
        setTimeout(() => alert.remove(), 300);
      });
    }
  });

  // Add intersection observer for animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
        }
      });
    },
    { threshold: 0.1 },
  );

  document
    .querySelectorAll(".card, .stats-card, .team-member")
    .forEach((el) => {
      observer.observe(el);
    });
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes ripple {
        to {
            transform: translate(var(--x), var(--y)) scale(2);
            opacity: 0;
        }
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializePage);

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    // Refresh data when page becomes visible
    if (window.location.pathname.includes("dashboard")) {
      loadUserBalance();
    }
  }
});

// Export for global access
window.IndicoinApp = {
  utils,
  animations,
  validation,
  api,
  loadUserBalance,
};
