function usersCreateRegisterInputField(fieldName,placeholder, fieldType, parentElement) {
    let inputField = addInput(parentElement);
    inputField.setAttribute("type", fieldType);
    inputField.setAttribute("name", fieldName);
    inputField.setAttribute("id", fieldName);  // Nadanie ID
    inputField.setAttribute("placeholder", fieldName.charAt(0).toUpperCase() + fieldName.slice(1));
  }
  window.usersCreateRegisterInputField = usersCreateRegisterInputField;
  function usersCreateRegisterSubmitButton(parentElement) {
    let submitButton = addButton(parentElement);
    submitButton.classList.add("draggable");
    submitButton.classList.add("editable");
    submitButton.setAttribute("draggable", "true");
    prepareEventListeners(submitButton);
    submitButton.textContent = "Zarejestruj";
    submitButton.setAttribute("type", "button");
    submitButton.setAttribute("id", "register-submit");
    submitButton.setAttribute("onclick", "usersRegisterUser()");
  
    if (parentElement) parentElement.appendChild(submitButton);
  }
  window.usersCreateRegisterSubmitButton = usersCreateRegisterSubmitButton;

 function usersCreateRegisterFormInputs(container) {
    usersCreateRegisterInputField('regusername', 'text', container);
    usersCreateRegisterInputField('regpassword', 'password', container);
    usersCreateRegisterInputField('email', 'email', container);
    usersCreateRegisterInputField('wiek', 'number', container);
  
    // Dodanie przycisku submit
    usersCreateRegisterSubmitButton(container);
  }
  window.usersCreateRegisterFormInputs = usersCreateRegisterFormInputs;



  function usersCreateLoginInputField(fieldName,placeholder, fieldType, parentElement) {
    let inputField = addInput(parentElement);
    inputField.setAttribute("type", fieldType);
    inputField.setAttribute("name", fieldName);
    inputField.setAttribute("id", fieldName);  // Nadanie ID
    inputField.setAttribute("placeholder", fieldName.charAt(0).toUpperCase() + fieldName.slice(1));
  }
  window.usersCreateLoginInputField = usersCreateLoginInputField;
  
  function usersCreateLoginSubmitButton(parentElement, redirect) {
    let submitButton = addButton(parentElement);
    submitButton.textContent = "Logowanie";
    submitButton.classList.add("draggable");
    submitButton.classList.add("editable");
    submitButton.setAttribute("id","login-submit");
    prepareEventListeners(submitButton);
    submitButton.setAttribute("type", "button");
    submitButton.setAttribute("redirect", redirect);
    submitButton.setAttribute("draggable", "true");
    submitButton.setAttribute("onclick", "usersLoginUser()");
  
    if (parentElement) parentElement.appendChild(submitButton);
  }
  window.usersCreateLoginSubmitButton = usersCreateLoginSubmitButton;
  

  
  function usersCreateLoginFormInputs(container, link) {
    usersCreateLoginInputField('logusername', 'text', container);
    usersCreateLoginInputField('logpassword', 'password', container);
  
    // Dodanie przycisku submit
    usersCreateLoginSubmitButton(container,link);
  }
  window.usersCreateLoginFormInputs = usersCreateLoginFormInputs;
  