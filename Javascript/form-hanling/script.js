document.addEventListener('DOMContentLoaded',function(){

    //get references to the form and inputs
    const form = document.getElementById('reg-form')
    const fullnameInput = document.getElementById('fullname')
    const emailInput = document.getElementById('email')
    const passwordInput = document.getElementById('password')
    const confirmpasswordInput = document.getElementById('confirmPassword')
    const dobInput = document.getElementById('dob')
    const roleSelect = document.getElementById('role')
    const termsCheckbox = document.getElementById('terms')

    //grab references to error 
    const fullnameError    = document.getElementById('fullnameError');
    const emailError       = document.getElementById('emailError');
    const passwordError    = document.getElementById('passwordError');
    const confirmPwdError  = document.getElementById('confirmPasswordError');
    const dobError         = document.getElementById('dobError');
    const roleError        = document.getElementById('roleError');
    const genderError      = document.getElementById('genderError');
    const termsError       = document.getElementById('termsError');
    const messageBox       = document.getElementById('message');

    //helper ~ show an error on a specific field
    function showError(input, errorSpan, message){
        input.classList.add('error-input');//red border
        errorSpan.textContent = message;
    }

    //helper ~ clear an error on a specific field
    function clearError(input,errorSpan){
        input.classList.remove('error-input');
        errorSpan.message = "";
    }
       // ===== REAL-TIME clearing: when user starts typing, error disappears =====
    [fullnameInput, emailInput, passwordInput, confirmpasswordInput, dobInput].forEach(function(input) {
        input.addEventListener('input', function() {
            // Find the next sibling <span class="error">
            const errorSpan = input.nextElementSibling;
            clearError(input, errorSpan);
        });
    });

    //validation~ fullName
    function ValidateFullname (){
        const value = fullnameInput.value.trim();
        const nameRegex = /^[A-Za-z\s]{2,}$/;

        if (value === " "){
            showError(fullnameInput,fullnameError,"Full Name is REQUIRED")
            return false;
        }else if(!nameRegex.test(value)){
            showError(fullnameInput,fullnameError,"Name mus tomly contain letters (min 2 characters)")
            return false;
        }
        clearError(fullnameInput,fullnameError);
        return true;
    }
        // ===== VALIDATE EMAIL =====
    // Rule: must match a standard email pattern
    function validateEmail() {
        const value = emailInput.value.trim();
        // Standard email regex pattern
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (value === '') {
            showError(emailInput, emailError, 'Email address is required.');
            return false;
        } else if (!emailRegex.test(value)) {
            showError(emailInput, emailError, 'Please enter a valid email address.');
            return false;
        }
        clearError(emailInput, emailError);
        return true;
    }

    // ===== VALIDATE PASSWORD =====
    // Rule: minimum 6 characters
    function validatePassword() {
        const value = passwordInput.value;  // no trim — spaces in passwords are valid

        if (value === '') {
            showError(passwordInput, passwordError, 'Password is required.');
            return false;
        } else if (value.length < 6) {
            showError(passwordInput, passwordError, 'Password must be at least 6 characters.');
            return false;
        }
        clearError(passwordInput, passwordError);
        return true;
    }
     // ===== VALIDATE CONFIRM PASSWORD =====
    // Rule: must match the password field exactly
    function validateConfirmPassword() {
        const value = confirmpasswordInput.value;

        if (value === '') {
            showError(confirmPwdInput, confirmPwdError, 'Please confirm your password.');
            return false;
        } else if (value !== passwordInput.value) {
            showError(confirmPwdInput, confirmPwdError, 'Passwords do not match.');
            return false;
        }
        clearError(confirmPwdInput, confirmPwdError);
        return true;
    }
     // ===== VALIDATE DATE OF BIRTH =====
    // Rule: must not be in the future, and user must be at least 5 years old
      function validateDOB() {
        const value = dobInput.value;  // returns "YYYY-MM-DD" string

        if (value === '') {
            showError(dobInput, dobError, 'Date of birth is required.');
            return false;
        }

        const today = new Date();
        const dob   = new Date(value);

        // Check: date is not in the future
        if (dob > today) {
            showError(dobInput, dobError, 'Date of birth cannot be in the future.');
            return false;
        }

        // Check: user is at least 5 years old
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 5) {
            showError(dobInput, dobError, 'You must be at least 5 years old.');
            return false;
        }

        clearError(dobInput, dobError);
        return true;
    }
        // ===== VALIDATE ROLE (dropdown) =====
    // Rule: must select an option (not the blank default)
    function validateRole() {
        if (roleSelect.value === '') {
            showError(roleSelect, roleError, 'Please select a role.');
            return false;
        }
        clearError(roleSelect, roleError);
        return true;
    }
        function validateGender() {
        const selected = document.querySelector('input[name="gender"]:checked');
        if (!selected) {
            genderError.textContent = 'Please select a gender.';
            genderError.style.color = '#e53935';
            return false;
        }
        genderError.textContent = '';
        return true;
    }
        // ===== VALIDATE TERMS (checkbox) =====
    // Rule: must be checked
    function validateTerms() {
        if (!termsCheckbox.checked) {
            termsError.textContent = 'You must agree to the terms.';
            return false;
        }
        termsError.textContent = '';
        return true;
    }

    form.addEventListener('submit',function(event){
        event.preventDefault();

                // Run ALL validations and collect results
        const isValid =
            validateFullname()       &&
            validateEmail()          &&
            validatePassword()       &&
            validateConfirmPassword()&&
            validateDOB()            &&
            validateRole()           &&
            validateGender()         &&
            validateTerms();
    })
            // Only submit if everything passes
        if (isValid) {
            messageBox.className = '';                    // clear old classes
            messageBox.textContent = 'Submitting...';
            messageBox.classList.add('success');
            form.submit();                               // actually send to PHP
        }

})