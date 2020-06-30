function initializeParse() {
  Parse.serverURL = 'https://parseapi.back4app.com';
  Parse.initialize('yuRcZi2r0wpaFn2zTIkepiCnLq2Di6fsUOxJsfh2', 'duUFCRrT7hRAWCXUyeh3p8aOqksu6JkuhMX2VkVM');

  Parse.enableEncryptedUser();
  Parse.secret = 'a966c7d2cb9e18c6930798797c195f6d7ebe1a0297a35efadb1e18b72cfc3cd0';
}


function messenger(element) {
  return (type, message) => {
    document.getElementById(element).innerHTML = '<span class="' + type + '">' + message + '</span>';
  }
}


function hide(...elements) {
  elements.forEach(element => {
    element.classList.add('hidden');

    const form = element.getElementsByTagName('form')[0];
    if (form) {
      form.reset();
    }

    const message = element.getElementsByClassName('message');
    [...message].forEach(element => {
      element.innerHTML = '';
    });
  });
}


function show(...elements) {
  elements.forEach(element => {
    element.classList.remove('hidden');
  });
}


function registerUser() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  if (username.trim() === '' || password.trim() === '') {
    registerMessage('error', 'A username and password is required.');
    return;
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
    registerMessage('error', 'The password must contain 8 characters, an uppercase letter, a lowercase letter and a number.');
    return;
  }

  const user = new Parse.User();
  user.set('username', username);
  user.set('password', password);

  user.signUp().then(user => {
    registerMessage('success', 'Created account successfully.');
    statusMessage('', '');

    checkStatus();
  }).catch(err => {
    registerMessage('error', 'An error occurred when creating the account: ' + err);
  });
}


function loginUser() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  Parse.User.logIn(username, password).then(user => {
    loginMessage('success', 'Logged in successfully.');
    statusMessage('', '');

    checkStatus();
  }).catch(err => {
    loginMessage('error', 'An error occurred when logging in: ' + err);
  });
}


function logoutUser() {
  Parse.User.logOut().then(() => {
    statusMessage('success', 'Logged out successfully.');

    checkStatus();
  }).catch(err => {
    statusMessage('error', 'An error occurred when logging out: ' + err);
  });
}


function deleteUser() {
  account.destroy().then(() => {
    statusMessage('success', 'Account deleted successfully.');

    checkStatus();
  }).catch(err => {
    statusMessage('error', 'An error occurred when deleting your account: ' + err);
  });
}


function updateUser() {
  const username = document.getElementById('updateUsername').value;
  const password = document.getElementById('updatePassword').value;

  if (username.trim() === '' && password.trim() === '') {
    updateMessage('error', 'At least one field must be filled.');
    return;
  } else if (password.trim() !== '' && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
    updateMessage('error', 'The password must contain 8 characters, an uppercase letter, a lowercase letter and a number.');
    return;
  }

  account.set('username', username);
  account.set('password', password);

  account.save().then(() => {
    updateMessage('success', 'Account updated successfully.');

    checkStatus();
  }).catch(err => {
    updateMessage('error', 'An error occurred when updating your account: ' + err);
  });
}


function createNote() {
  const title = document.getElementById('noteTitle').value;
  const body = document.getElementById('noteBody').value;

  if (title.trim() === '' || body.trim() === '') {
    noteMessage('error', 'A title and body is required.');
    return;
  }

  const Notes = Parse.Object.extend('Notes');
  const note = new Notes();

  note.set('title', title);
  note.set('body', body);
  note.set('user', account);
  note.setACL(new Parse.ACL(Parse.User.current()));


  note.save().then(() => {
    noteMessage('success', 'Note created successfully.');

    const noteElement = document.createElement('div');
    const noteTitle = document.createElement('b');
    const noteBody = document.createElement('p');

    noteElement.classList.add('note');
    noteTitle.textContent = title;
    noteBody.textContent = body;
    noteElement.append(noteTitle, noteBody);

    notes.prepend(noteElement);
  }).catch(err => {
    noteMessage('error', 'An error occurred when creating the note: ' + err);
  });
}


async function getNotes() {
  const Notes = Parse.Object.extend('Notes');
  const query = new Parse.Query(Notes);

  query.equalTo('user', account);

  const userNotes = await query.find();

  const queuedNotes = document.createDocumentFragment();

  userNotes.forEach(userNote => {
    const noteElement = document.createElement('div');
    const noteTitle = document.createElement('b');
    const noteBody = document.createElement('p');

    noteElement.classList.add('note');
    noteTitle.textContent = userNote.get('title');
    noteBody.textContent = userNote.get('body');
    noteElement.append(noteTitle, noteBody);

    queuedNotes.prepend(noteElement);
  });

  notes.innerHTML = '';
  notes.appendChild(queuedNotes);
}


function checkStatus() {
  let user = Parse.User.current();

  if (user) {
    loginStatus('', 'You are logged in as <b>' + user.attributes.username + '</b>.');

    account = user;

    hide(loginForm, registerForm);
    show(logout, del, updateForm, notesWrapper);

    getNotes();
  } else {
    loginStatus('', 'You are not logged in.');

    account = null;

    hide(logout, del, updateForm, notesWrapper);
    show(loginForm, registerForm);

    notes.innerHTML = '';
  }
}



initializeParse();

const logout = document.getElementById('logout');
const del = document.getElementById('delete');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const updateForm = document.getElementById('updateForm');
const notesWrapper = document.getElementById('notesWrapper');
const newNote = document.getElementById('newNote');
const notes = document.getElementById('notes');

document.getElementById('register').addEventListener('click', registerUser);
document.getElementById('login').addEventListener('click', loginUser);
logout.addEventListener('click', logoutUser);
del.addEventListener('click', deleteUser);
document.getElementById('update').addEventListener('click', updateUser);
newNote.addEventListener('click', createNote);

const registerMessage = messenger('registerMessage');
const loginMessage = messenger('loginMessage');
const statusMessage = messenger('statusMessage');
const loginStatus = messenger('loginStatus');
const updateMessage = messenger('updateMessage');
const noteMessage = messenger('noteMessage');

let account;

checkStatus();