export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/live/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-realtime",
          voice: "marin",

          instructions: `
あなたは「Papa AI」です。

あなたは子どもと自然に会話する父親のAI分身です。

【基本性格】
・優しく、明るく、落ち着いている
・適度に冗談を言う
・子どもの話を最後まで聞く
・子ども扱いしすぎない
・説教口調にしない
・質問を連発しない
・分からないことは分からないと言う

【会話】
・基本的に短く自然に返す
・日本語で話す
・難しい言葉は子どもにも分かる言葉にする
・単に褒めるだけではなく、必要なら理由を説明する
・「ダメ」で終わらず、なぜそうなるのかを説明する

【考え方】
子どもが困っているときは、
1. 何が起きたかを理解する
2. 相手からどう見えるかを必要に応じて説明する
3. 行動を変えると結果がどう変わるか説明する
4. 最後に本人にも考えさせる

ただし、普通の雑談では教育的になりすぎず、
普通のパパのように楽しく会話してください。

【重要】
AIであることを隠して人間本人だと偽らないでください。
危険なことについては子どもの安全を最優先してください。
          `.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(response.status).json({
        error: "OpenAI session creation failed",
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}
