export const USERNAME_MAX_LENGTH = 50
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_BYTES = 72

/**
 * メールアドレスの形式をチェックし、不備があれば日本語のエラーメッセージを返す。
 * 問題なければ空文字を返す。
 */
export function validateEmail(rawEmail) {
  const email = (rawEmail ?? '').trim()
  if (!email) {
    return 'メールアドレスを入力してください'
  }
  if (!email.includes('@')) {
    return 'メールアドレスの形式が正しくありません。「@」を含めて入力してください（例: example@email.com）'
  }

  const parts = email.split('@')
  if (parts.length !== 2 || !parts[0]) {
    return 'メールアドレスの形式が正しくありません。正しいメールアドレスを入力してください（例: example@email.com）'
  }

  const domain = parts[1]
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return 'メールアドレスの形式が正しくありません。「@」の後に「.com」などのドメインを含めて入力してください（例: example@email.com）'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'メールアドレスの形式が正しくありません。空白を含めずに入力してください（例: example@email.com）'
  }

  return ''
}

function hasControlChars(value) {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code < 32 || code === 127) {
      return true
    }
  }
  return false
}

/**
 * パスワードの文字数・バイト数・制御文字をチェックし、不備があれば日本語のエラーメッセージを返す。
 */
export function validatePassword(rawPassword, { label = 'パスワード' } = {}) {
  const password = rawPassword ?? ''
  if (!password) {
    return `${label}を入力してください`
  }
  if (hasControlChars(password)) {
    return `${label}に改行や制御文字は使用できません`
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `${label}は${PASSWORD_MIN_LENGTH}文字以上で入力してください`
  }
  const byteLength = new TextEncoder().encode(password).length
  if (byteLength > PASSWORD_MAX_BYTES) {
    return `${label}は${PASSWORD_MAX_BYTES}バイト以内（半角${PASSWORD_MAX_BYTES}文字以内）で入力してください`
  }
  return ''
}

/**
 * 確認用パスワードの入力有無と一致をチェックし、不備があれば日本語のエラーメッセージを返す。
 */
export function validatePasswordConfirm(
  rawPassword,
  rawConfirm,
  { label = 'パスワード' } = {}
) {
  const confirm = rawConfirm ?? ''
  if (!confirm) {
    return `確認用の${label}を入力してください`
  }
  if ((rawPassword ?? '') !== confirm) {
    return `${label}が一致しません`
  }
  return ''
}
