const input = document.querySelector('#password');
const encryptButton = document.querySelector('#encrypt-button');
const encryptedOutput = document.querySelector('#encrypted-output');
const decryptedOutput = document.querySelector('#decrypted-output');
const byteCount = document.querySelector('#byte-count');
const toggleButton = document.querySelector('#toggle-visibility');
const copyButton = document.querySelector('#copy-button');

let encryptedText = '';

function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

async function encryptMessage(message) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(message));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return { encrypted: bytesToBase64(new Uint8Array(encrypted)), decrypted: new TextDecoder().decode(decrypted) };
}

async function runEncryption() {
  const message = input.value;
  if (!message) {
    input.focus();
    encryptedOutput.textContent = 'Digite uma mensagem primeiro.';
    decryptedOutput.textContent = '—';
    byteCount.textContent = '0';
    return;
  }
  encryptButton.disabled = true;
  encryptButton.firstChild.textContent = 'Processando ';
  try {
    const result = await encryptMessage(message);
    encryptedText = result.encrypted;
    encryptedOutput.textContent = encryptedText;
    decryptedOutput.textContent = result.decrypted;
    byteCount.textContent = new TextEncoder().encode(message).length;
  } catch (error) {
    encryptedOutput.textContent = 'Seu navegador não suporta a Web Crypto API.';
  } finally {
    encryptButton.disabled = false;
    encryptButton.firstChild.textContent = 'Criptografar ';
  }
}

encryptButton.addEventListener('click', runEncryption);
input.addEventListener('keydown', event => { if (event.key === 'Enter') runEncryption(); });
toggleButton.addEventListener('click', () => {
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  toggleButton.setAttribute('aria-label', showing ? 'Mostrar senha' : 'Ocultar senha');
});
copyButton.addEventListener('click', async () => {
  if (!encryptedText) return;
  await navigator.clipboard.writeText(encryptedText);
  copyButton.textContent = '✓';
  setTimeout(() => { copyButton.textContent = '▣'; }, 1200);
});
