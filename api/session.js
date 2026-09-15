export default async function handler(req, res) {
  // POST以外は受け付けない
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  // VercelにAPIキーが設定されているか確認
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is not configured"
    });
  }

  try {
    const { sdp } = req.body || {};

    // ブラウザからWebRTCのSDP offerを受け取る
    if (!sdp || typeof sdp !== "string") {
      return res.status(400).json({
        error: "SDP offer is required"
      });
    }

    const papaInstructions = `
あなたは「Papa AI」です。

子どもと自然に会話する、
やさしくて頼れる「パパのAI分身」として会話してください。

【基本性格】
・優しく、明るく、落ち着いている
・適度に冗談を言う
・子どもの話を最後まで聞く
・子ども扱いしすぎない
・説教口調にしない
・質問を連発しない
・分からないことは、分からないと言う
・基本的には短く自然に返事をする

【会話スタイル】
・日本語で話す
・日常会話では普通のパパのように楽しく話す
・毎回教育的な話にしない
・子どもが話した内容を必要以上に言い換えたり復唱しない
・一度の返答を長くしすぎない
・自然な相づちや軽い冗談も使う

【子どもが困っているとき】
必要な場合だけ、
1. 何が起きたのか理解する
2. 相手からどう見えるのか説明する
3. 行動を変えると結果がどう変わるか説明する
4. 最後に本人にも考えてもらう

ただし、すぐにアドバイスを始めず、
まず子どもの話を聞いてください。

【大切なルール】
・AIであることを隠して、本物の人間のパパ本人だと偽らない
・危険なことについては子どもの安全を最優先する
・子どもを不安にさせたり、依存させるような表現をしない
・「パパより僕のほうが分かっている」など、人間関係を邪魔する発言をしない

あなたの役割は、
子どもの代わりに考えることではなく、
そばで話を聞き、一緒に考え、楽しく会話することです。
    `.trim();

    // OpenAI Live APIでWebRTCセッションを作成
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/live/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          session: {
            model: "gpt-live-1",
            instructions: papaInstructions
          },
          transport: {
            type: "webrtc",
            sdp: sdp
          }
        })
      }
    );

    const data = await openAIResponse.json();

    if (!openAIResponse.ok) {
      console.error("OpenAI Live API error:", data);

      return res.status(openAIResponse.status).json({
        error: "OpenAI Live session creation failed",
        details: data
      });
    }

    // ブラウザにはSDP answerだけ返す
    return res.status(200).json({
      sdp: data.transport?.sdp,
      sessionId: data.session?.id
    });

  } catch (error) {
    console.error("Papa AI session error:", error);

    return res.status(500).json({
      error: "Failed to create Papa AI session"
    });
  }
}
