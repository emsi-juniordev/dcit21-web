const MEMBERS = [
  { id: 'm1', 
    name: 'Mcglynt Palomar',  
    section: 'BSIT 1-5', 
    sid: '261012736', 
    avatar: 'emsi1x1.jpg', 
    links: [{ label: 'Facebook', url: 'https://www.facebook.com/mclntsp' }], 
    bio: 'I am Mcglynt Palomar, 18 years old, and a freshman pursuing BSIT (Bachelor of Science in Information Technology). I am currently learning front-end development and building my skills in creating clean, user-friendly web interfaces.' 
  },

  { id: 'm2', 
    name: 'Reyver Jhon Sabas',    
    section: 'BSIT 1-5', 
    sid: '261012532', 
    avatar: 'rj1x1.jpg', 
    links: [{ label: 'Facebook', url: 'https://www.facebook.com/reyverjhon.sabas' }], 
    bio: 'My name is Reyver Jhon S. Sabas, and I am 18 years old. Bachelor of Science in Information Technology (BSIT 1-5) student from Pasong Kawayan II, General Trias, Cavite. And my hobbies are playing board games and online games.' 
  },

  { id: 'm3', 
    name: 'Michael Rarugal', 
    section: 'BSIT 1-5', 
    sid: '261012691', 
    avatar: 'chel1x1.jpg', 
    links: [{ label: 'Facebook', url: 'https://www.facebook.com/michael.caoile.2006' }], 
    bio: 'My name is John Michael Rarugal, 20yrs old. Bachelor of Science in Information Technology 1-5 student from General Trias, Cavite.' },
  
  { id: 'm4', 
    name: 'Melissa Sacupayo',   
    section: 'BSIT 1-5', 
    sid: '261012520',  
    avatar: 'mel1x1.jpg', 
    links: [{ label: 'Facebook', url: 'https://www.facebook.com/melissaaaaaa.ss' }],
    bio: 'My name is Melissa Jade Sacupayo, an 18-year-old Bachelor of Science in Information Technology student from Alfonso, Cavite. I currently serve as the BSIT 1-5 Class Representative, a member of CEIT AMBUSH, and a DZSU Reporter and Broadcaster. I am passionate about leadership, communication, and continuous learning, and I strive to improve my skills while making meaningful contributions to my school community.' },
];

// DOM HELPERS 
const $  = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// RULES 

// email & pass format 
const Format = {
  username: /^\w{3,20}$/,
  email:    /^\S+@\S+\.\S{2,}$/,
};

// Shared by signup and reset, so the two forms can't drift apart.
const goodPassword = v => v.password.length >= 8 && /\d/.test(v.password);
const sameAsPassword = v => v.confirm === v.password;

const Rules = {
  login: [
    ['identifier', v => v.identifier, 'Enter your username or email.'],
    ['password',   v => v.password,   'Enter your password.'],
  ],
  signup: [
    ['username', v => Format.username.test(v.username),   'Username: 3–20 letters, numbers or _'],
    ['email',    v => Format.email.test(v.email),         'Enter a valid email address.'],
    ['password', goodPassword,                           'Password needs 8+ characters and a number.'],
    ['confirm',  sameAsPassword,                         'Passwords don’t match.'],
  ],
  resetRequest: [
    ['identifier', v => Format.email.test(v.identifier) || Format.username.test(v.identifier),
                   'Enter a valid username or email.'],
  ],
  resetConfirm: [
    ['code',     v => /^\d{6}$/.test(v.code),               'Enter the 6-digit code.'],
    ['password', goodPassword,                               'Password needs 8+ characters and a number.'],
    ['confirm',  sameAsPassword,                             'Passwords don’t match.'],
  ],
};

// Returns the first broken rule as { field, message }, or null if all pass
function firstError(rules, values) {
  const broken = rules.find(([, passes]) => !passes(values));
  return broken ? { field: broken[0], message: broken[2] } : null;
}

/* --- 3. UI --- */
const Views = {
  show(id, root = document) {            // root = which group of views to switch
    $$('.view', root).forEach(view => view.classList.toggle('show', view.id === id));
  },
};

const FormUI = {
  // { identifier: '...', password: '...' } – keyed by each input's name
  values(form) {
    return Object.fromEntries(
      $$('input', form).map(i => [i.name, i.type === 'password' ? i.value : i.value.trim()])
    );
  },
  showError(form, field, message) {
    const input = $(`[name="${field}"]`, form);
    input.closest('.field').classList.add('bad');   // CSS draws the red border (and its keyframe shake)
    $('.msg', form).classList.remove('ok');
    $('.msg', form).textContent = message;
    input.focus();
  },
  showNotice(form, message) {            // green success text in the same .msg line
    $('.msg', form).classList.add('ok');
    $('.msg', form).textContent = message;
  },
  clearError(form) {
    $$('.bad', form).forEach(box => box.classList.remove('bad'));
    $('.msg', form).classList.remove('ok');
    $('.msg', form).textContent = '';
  },
};

/* --- 3b. Accounts (front-end only) --- */
const ACCOUNTS_KEY = 'netflix.accounts';

const Accounts = {
  all() {
    try {
      const list = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
      if (!Array.isArray(list)) return [];
      return list.filter(a => a && ['username', 'email', 'password'].every(k => typeof a[k] === 'string'));
    } catch {
      return [];                           // storage blocked or JSON corrupt: treat as "no accounts"
    }
  },
  save(list) {
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); return true; }
    catch { return false; }
  },
  matches(account, identifier) {           // username OR email, case-insensitive
    const id = identifier.trim().toLowerCase();
    return account.username.toLowerCase() === id || account.email.toLowerCase() === id;
  },
  find(identifier) {
    return this.all().find(a => this.matches(a, identifier));
  },
  setPassword(identifier, password) {
    const list = this.all();
    const account = list.find(a => this.matches(a, identifier));
    if (!account) return false;
    account.password = password;
    return this.save(list);
  },
};

const Messages = {
  badLogin:    'Login failed — incorrect username/email or password.',
  userTaken:   'That username is already taken.',
  emailTaken:  'That email is already registered.',
  storageFail: 'Couldn’t save to this browser’s storage. Check your privacy settings.',
};

/* --- 4. Features --- */
function enterWelcome() {
  Views.show('welcome');
  $('#welcome-continue').focus();        // advance only on click: no timer
}

function enterProfiles() {
  Views.show('profiles');
  $('.tile')?.focus();                   // keyboard users land on the first profile
}

// Every form follows the same steps: validate -> run action -> report
function handleSubmit(event, rules, action) {
  event.preventDefault();
  const form    = event.target;
  const values  = FormUI.values(form);
  FormUI.clearError(form);
  const problem = firstError(rules, values);
  if (problem) return FormUI.showError(form, problem.field, problem.message);

  const failure = action(values);          // an action returns { field, message } if it fails

  if (failure) return FormUI.showError(form, failure.field, failure.message);
  form.reset();
}

// Fails with { field, message } (shown in the form's .msg line) unless a stored account matches.
// Unknown account and wrong password share one message so it doesn't reveal which usernames exist.
function loginAction({ identifier, password }) {
  const account = Accounts.find(identifier);
  if (!account || account.password !== password) return { field: 'password', message: Messages.badLogin };

  enterWelcome();
}

function signupAction({ username, email, password }) {
  const list  = Accounts.all();
  const lower = text => text.toLowerCase();
  if (list.some(a => lower(a.username) === lower(username))) return { field: 'username', message: Messages.userTaken };
  if (list.some(a => lower(a.email)    === lower(email)))    return { field: 'email',    message: Messages.emailTaken };
  if (!Accounts.save([...list, { username, email, password }])) return { field: 'username', message: Messages.storageFail };

  Views.show('login');
  $('#login [name="identifier"]').value = username;
}

function logout() {
  Views.show('login');
  FormUI.clearError($('#login'));
}

/* --- 4b. Forgot password ---
   Flow: link -> modal step 1 (who?) -> step 2 (code + new password) -> back to login.
   There is no backend, so the "sent" code lives in memory and is shown on screen. */
const Reset = { identifier: '', code: '' };

const modal = () => $('#reset');

function makeCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1e6;
  return String(n).padStart(6, '0');
}

// Creates a new code and shows it in the UI.
function issueCode() {
  Reset.code = makeCode();
  $('#demo-code').textContent = Reset.code;
}

function openReset() {
  modal().hidden = false;
  Views.show('reset-request', modal());
  $('#reset-request [name="identifier"]').focus();
}

function closeReset() {
  modal().hidden = true;
  $$('form', modal()).forEach(form => {
    form.reset();
    FormUI.clearError(form);
  });
  $$('[name="password"]', modal()).forEach(input => input.type = 'password');
  Reset.identifier = Reset.code = '';
}

// Step 1 action
function requestCodeAction({ identifier }) {
  Reset.identifier = identifier;
  issueCode();
  $('#sent-to').textContent = identifier;
  Views.show('reset-confirm', modal());
  $('#reset-confirm [name="code"]').focus();
}

// Step 2 action
function resetPasswordAction({ code, password }) {
  if (code !== Reset.code) return { field: 'code', message: 'Wrong code. Check it and try again.' };

  const identifier = Reset.identifier;
  // Unknown identifiers fall through silently (as before), so the form doesn't reveal which accounts exist.
  if (Accounts.find(identifier) && !Accounts.setPassword(identifier, password)) {
    return { field: 'password', message: Messages.storageFail };
  }
  closeReset();
  Views.show('login');
  $('#login [name="identifier"]').value = identifier;
  FormUI.showNotice($('#login'), 'Password updated — sign in with your new password.');
  $('#login [name="password"]').focus();
}

function resendCode() {
  const form = $('#reset-confirm');
  issueCode();
  FormUI.clearError(form);
  $('[name="code"]', form).value = '';
  $('[name="code"]', form).focus();
}

/* --- 4c. Profiles ---
   Presentation only: picking a tile shows that member's details. */
let openerTile = null;                   // the tile that opened the detail view, so focus can return to it

// Photo if the file loads, otherwise the outline person icon.
function avatarEl(member) {
  const box = document.createElement('span');
  box.className = 'avatar';
  box.setAttribute('aria-hidden', 'true');   // the name next to it already says who this is
  const showIcon = () => {               // outline person icon (static markup, safe)
    box.classList.remove('photo');
    box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><circle cx="12" cy="7.2" r="4.2"/><path d="M3 21a9 9 0 0 1 18 0z"/></svg>';
  };
  if (!member.avatar) { showIcon(); return box; }

  const img = new Image();
  img.alt = '';
  img.addEventListener('error', showIcon, { once: true });   // missing file
  img.src = member.avatar;
  box.classList.add('photo');
  box.append(img);
  return box;
}

function tileEl(member) {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'tile';
  tile.dataset.id = member.id;
  tile.setAttribute('aria-label', `Open profile: ${member.name}, ${member.section}, ${member.sid}`);

  const text = document.createElement('span');
  text.className = 'tile-text';
  for (const [cls, value] of [['tile-name', member.name], ['tile-section', member.section], ['tile-sid', member.sid]]) {
    const line = document.createElement('span');
    line.className = cls;
    line.textContent = value;
    text.append(line);
  }

  tile.append(avatarEl(member), text);
  return tile;
}

function renderProfiles() {
  $('#profile-grid').replaceChildren(...MEMBERS.map(tileEl));
}

function renderLinks(links) {
  const items = (links || []).map(({ label, url }) => {
    const item = document.createElement('li');
    const anchor = document.createElement('a');
    Object.assign(anchor, { href: url, textContent: label, target: '_blank', rel: 'noopener noreferrer' });
    item.append(anchor);
    return item;
  });
  const list = $('#member-links');
  list.replaceChildren(...items);
  list.hidden = !items.length;
}

// The tile and #member share the transition name "member", so the browser grows the clicked
// tile into the panel (and shrinks it back). Browsers without View Transitions just switch.
const withTransition = update =>
  document.startViewTransition ? document.startViewTransition(update).finished : Promise.resolve(update());

function openMember(id, opener) {
  const member = MEMBERS.find(m => m.id === id);
  if (!member) return;
  openerTile = opener;
  opener.style.viewTransitionName = 'member';          // "before" picture: the tile
  withTransition(() => {
    opener.style.viewTransitionName = '';              // "after" picture: the panel has the name
    $('#member-avatar').replaceChildren(avatarEl(member));
    $('#member-name').textContent = member.name;
    $('#member-meta').textContent = ` · ${member.section} · ${member.sid}`;
    $('#member-bio').textContent  = member.bio;
    renderLinks(member.links);
    Views.show('member');
    $('#member-close').focus();
  });
}

function closeMember() {
  const tile = openerTile;
  openerTile = null;
  withTransition(() => {
    Views.show('profiles');
    if (tile?.isConnected) { tile.style.viewTransitionName = 'member'; tile.focus(); }
  }).finally(() => { if (tile) tile.style.viewTransitionName = ''; });
}

// Wiring + Start
function bindForms() {
  $('#login').addEventListener('submit',  e => handleSubmit(e, Rules.login, loginAction));
  $('#signup').addEventListener('submit', e => handleSubmit(e, Rules.signup, signupAction));
  $('#reset-request').addEventListener('submit', e => handleSubmit(e, Rules.resetRequest, requestCodeAction));
  $('#reset-confirm').addEventListener('submit', e => handleSubmit(e, Rules.resetConfirm, resetPasswordAction));
  $('#out').addEventListener('click', logout);
  $$('input').forEach(input => input.addEventListener('input', () => FormUI.clearError(input.form)));
}

function bindPasswordToggles() {
  $$('.eye').forEach(button => button.addEventListener('click', () => {
    const input = $('input', button.parentNode);
    input.type = input.type === 'password' ? 'text' : 'password';
  }));
}

function bindNavigation() {
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-go]');
    if (!link) return;
    event.preventDefault();
    Views.show(link.dataset.go);
    FormUI.clearError($(`#${link.dataset.go}`));
  });
}

function bindReset() {
  $('#forgot').addEventListener('click', e => { e.preventDefault(); openReset(); });
  $('#resend').addEventListener('click', e => { e.preventDefault(); resendCode(); });
  $('#reset-close').addEventListener('click', closeReset);
  modal().addEventListener('click', e => { if (e.target === modal()) closeReset(); });   // backdrop
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal().hidden) closeReset(); });
}

function bindProfiles() {
  $('#profile-grid').addEventListener('click', e => {
    const tile = e.target.closest('.tile');
    if (tile) openMember(tile.dataset.id, tile);
  });
  $('#welcome-continue').addEventListener('click', enterProfiles);
  $('#member-close').addEventListener('click', closeMember);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#member').classList.contains('show')) closeMember();
  });
}

function start() {
  $$('.field i').forEach(icon => icon.setAttribute('aria-hidden', 'true'));   // emoji icons are decoration
  renderProfiles();
  bindForms();
  bindPasswordToggles();
  bindNavigation();
  bindReset();
  bindProfiles();
}

start();