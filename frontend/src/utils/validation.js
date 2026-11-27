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
