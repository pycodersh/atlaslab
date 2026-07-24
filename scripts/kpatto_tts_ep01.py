"""
K-PATTO EP01 TTS 생성 스크립트
Gemini 2.5 Flash TTS → WAV (브라우저 직접 재생 가능)
"""
import os
import wave
import struct
import time
from google import genai
from google.genai import types

API_KEY = os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.")

client = genai.Client(api_key=API_KEY)
MODEL = "gemini-2.5-flash-preview-tts"

# Gemini TTS 기본 파라미터: 24kHz, 16-bit mono PCM
SAMPLE_RATE = 24000
CHANNELS = 1
SAMPLE_WIDTH = 2  # 16-bit

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "kpatto", "audio", "ep01")
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICES = {
    "emma":      ("Leda",         "Speak naturally in Korean like an enthusiastic young foreign student, clear pronunciation, slightly careful"),
    "staff":     ("Vindemiatrix", "Speak naturally in Korean like a kind, professional café staff member"),
    "narration": ("Sulafat",      "Speak clearly and warmly like a friendly Korean language teacher, natural pace"),
}

def generate_pcm(text: str, character: str, extra_style: str = "") -> bytes:
    voice_name, base_style = VOICES[character]
    style_prompt = f"{base_style}. {extra_style}".strip(". ")
    full_text = f"[{style_prompt}]\n{text}"

    response = client.models.generate_content(
        model=MODEL,
        contents=full_text,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice_name
                    )
                )
            ),
        ),
    )
    return response.candidates[0].content.parts[0].inline_data.data

def silence_pcm(duration_sec: float) -> bytes:
    n_samples = int(SAMPLE_RATE * duration_sec)
    return b"\x00" * (n_samples * SAMPLE_WIDTH * CHANNELS)

def save_wav(filename: str, pcm_data: bytes):
    path = os.path.join(OUTPUT_DIR, filename)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(SAMPLE_WIDTH)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(pcm_data)
    print(f"  ✅ {filename} ({len(pcm_data)//2//SAMPLE_RATE:.1f}s)")

# ── 스토리 대사 ────────────────────────────────────────────────────────────────

DIALOGUES = [
    ("ep01-c1-b1.wav", "emma",  "와, 예쁘다!",
     "Speak with genuine surprise and delight, like seeing something beautiful for the first time"),
    ("ep01-c2-b1.wav", "staff", "어서 오세요! 주문하시겠어요?",
     "Speak warmly and professionally, like a friendly café staff welcoming a customer"),
    ("ep01-c2-b2.wav", "emma",  "저기요... 이거 뭐예요?",
     "Speak curiously and a little hesitantly, like someone pointing at something unfamiliar"),
    ("ep01-c3-b1.wav", "emma",  "달고나 라떼... 뭐예요?",
     "Speak with genuine curiosity, tilting head slightly, careful pronunciation"),
    ("ep01-c3-b2.wav", "staff", "달달하고 맛있어요!",
     "Speak enthusiastically, like recommending your favorite menu item"),
    ("ep01-c4-b1.wav", "emma",  "달고나 라떼 주세요!",
     "Speak with confidence and excitement, like successfully ordering in a foreign language"),
    ("ep01-c4-b2.wav", "staff", "사이즈는요?",
     "Speak naturally and casually, short question"),
    ("ep01-c4-b3.wav", "emma",  "큰 거 주세요. 와이파이 있어요?",
     "Speak naturally, two connected requests"),
    ("ep01-c4-b4.wav", "staff", "네, 있어요! 오천오백 원이에요.",
     "Speak cheerfully, confirming and stating price"),
    ("ep01-c5-b1.wav", "emma",  "너무 맛있어요!",
     "Speak with genuine delight and satisfaction, like tasting something delicious for the first time"),
    ("ep01-c5-b2.wav", "staff", "감사합니다. 또 오세요.",
     "Speak warmly and sincerely, like a genuine farewell"),
]

# ── 패턴카드 (패턴 + 예문 3개, 0.5초 묵음으로 연결) ──────────────────────────

PATTERNS = [
    ("ep01-p001.wav", [
        "이에요, 예요.",
        "이게 김치예요.",
        "저는 학생이에요.",
        "달고나 라떼예요.",
    ]),
    ("ep01-p002.wav", [
        "주세요.",
        "물 주세요.",
        "메뉴 주세요.",
        "카페라떼 주세요.",
    ]),
    ("ep01-p003.wav", [
        "뭐예요?",
        "이거 뭐예요?",
        "저거 뭐예요?",
        "이름이 뭐예요?",
    ]),
    ("ep01-p004.wav", [
        "있어요. 없어요.",
        "와이파이 있어요?",
        "자리 있어요?",
        "자리 없어요.",
    ]),
    ("ep01-p005.wav", [
        "얼마예요?",
        "이거 얼마예요?",
        "라떼 얼마예요?",
        "다 해서 얼마예요?",
    ]),
]

PATTERN_STYLE = "Speak clearly and warmly like a friendly Korean language teacher, natural pace, slight pause between sentences"


def main():
    print("=== EP01 스토리 대사 생성 ===")
    for filename, character, text, style in DIALOGUES:
        try:
            pcm = generate_pcm(text, character, style)
            save_wav(filename, pcm)
            time.sleep(0.8)
        except Exception as e:
            print(f"  ❌ {filename}: {e}")

    print("\n=== EP01 패턴카드 생성 ===")
    gap = silence_pcm(0.5)
    for filename, sentences in PATTERNS:
        try:
            parts = []
            for i, sentence in enumerate(sentences):
                pcm = generate_pcm(sentence, "narration", PATTERN_STYLE)
                parts.append(pcm)
                if i < len(sentences) - 1:
                    parts.append(gap)
                time.sleep(0.5)
            save_wav(filename, b"".join(parts))
        except Exception as e:
            print(f"  ❌ {filename}: {e}")

    total = len(DIALOGUES) + len(PATTERNS)
    print(f"\n🎉 완료! 총 {total}개 파일 → {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
