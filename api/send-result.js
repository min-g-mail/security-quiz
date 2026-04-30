const nodemailer = require('nodemailer');

const FIXED_RECIPIENTS = [
  'k.nakada@tresta-s.jp',
  'm.nakazawa@tresta-s.jp',
  'tresta.kyotsu@px-ins.jp',
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_name, score, evaluation, date, details, extra_email } = req.body;

  if (!user_name) return res.status(400).json({ error: 'user_name is required' });

  const toList = [...FIXED_RECIPIENTS];
  if (extra_email && extra_email.trim()) toList.push(extra_email.trim());

  const transporter = nodemailer.createTransport({
    host: 'nakada-kazuma.sakura.ne.jp',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject = `【2026年度 理解度チェック結果】${user_name}さん`;

  const text = `
2026年度 情報セキュリティ・個人情報保護規定
理解度チェック 結果報告

━━━━━━━━━━━━━━━━━━━━━━━━
受験者名 ： ${user_name} 様
得　　点 ： ${score}
評　　価 ： ${evaluation}
受験日時 ： ${date}
━━━━━━━━━━━━━━━━━━━━━━━━

■ 問題別正誤

${details}

━━━━━━━━━━━━━━━━━━━━━━━━
※ このメールは自動送信されています。返信はお受けできません。
株式会社トレスタシステム
`.trim();

  try {
    await transporter.sendMail({
      from: `"研修システム" <${process.env.EMAIL_USER}>`,
      to: toList.join(', '),
      subject,
      text,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ error: err.message });
  }
};
