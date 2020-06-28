function initializeParse() {
  Parse.serverURL = 'https://parseapi.back4app.com';
  Parse.initialize('yuRcZi2r0wpaFn2zTIkepiCnLq2Di6fsUOxJsfh2', 'duUFCRrT7hRAWCXUyeh3p8aOqksu6JkuhMX2VkVM');
}


function messenger(element) {
  return (type, message) => {
    document.getElementById(element).innerHTML = '<span class="' + type + '">' + message + '</span>';
  }
}


function registerUser() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  let message = messenger('registerMessage');

  if (username.trim() === '' || password.trim() === '') {
    message('error', 'A username and password is required.');
    return;
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
    message('error', 'The password must contain 8 characters, an uppercase letter, a lowercase letter and a number.');
    return;
  }

  const user = new Parse.User();
  user.set('username', username);
  user.set('password', password);

  user.signUp().then(user => {
    message('success', 'Created account successfully.');
  }).catch(err => {
    message('error', 'An error occurred when creating the account: ' + err);
  });
}

function loginUser() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  let message = messenger('loginMessage');

  Parse.User.logIn(username, password).then(user => {
    message('success', 'Logged in successfully.');
  }).catch(err => {
    message('error', 'An error occurred when logging in.');
  });
}



initializeParse();

document.getElementById('register').addEventListener('click', registerUser);
document.getElementById('login').addEventListener('click', loginUser);