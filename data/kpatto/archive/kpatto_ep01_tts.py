# K-PATTO EP01 TTS 생성 스크립트 (google-genai SDK)
# pip install google-genai

import os
import time
import struct
import wave
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# 캐릭터 보이스 배정
VOICES = {
    "emma":      ("Leda",         "Speak naturally in Korean like an enthusiastic young foreign student, clear pronunciation, slightly careful."),
    "staff":     ("Vindemiatrix", "Speak naturally in Korean like a kind, professional café staff member."),
    "narration": ("Sulafat",      "Speak clearly and warmly like a friendly Korean language teacher, natural pace."),
}

# EP01 대사 목록
DIALOGUES = [
    ("ep01-c1-b1", "emma",  "와, 예쁘다!",
     "Speak with genuine surprise and delight, like seeing something beautiful for the first time."),
    ("ep01-c2-b1", "staff", "어서 오세요! 주문하시겠어요?",
     "Speak warmly and professionally, like a friendly café staff welcoming a customer."),
    ("ep01-c2-b2", "emma",  "저기요... 이거 뭐예요?",
     "Speak curiously and a little hesitantly, like someone pointing at something unfamiliar."),
    ("ep01-c3-b1", "emma",  "달고나 라떼... 뭐예요?",
     "Speak with genuine curiosity, careful pronunciation."),
    ("ep01-c3-b2", "staff", "달달하고 맛있어요!",
     "Speak enthusiastically, like recommending your favorite menu item."),
    ("ep01-c4-b1", "emma",  "달고나 라떼 주세요!",
     "Speak with confidence and excitement, like successfully ordering in a foreign language."),
    ("ep01-c4-b2", "staff", "사이즈는요?",
     "Speak naturally and casually, short question."),
    ("ep01-c4-b3", "emma",  "큰 거 주세요. 와이파이 있어요?",
     "Speak naturally, two connected requests."),
    ("ep01-c4-b4", "staff", "네, 있어요! 오천오백 원이에요.",
     "Speak cheerfully, confirming and stating price."),
    ("ep01-c5-b1", "emma",  "너무 맛있어요!",
     "Speak with genuine delight and satisfaction."),
    ("ep01-c5-b2", "staff", "감사합니다. 또 오세요.",
     "Speak warmly and sincerely, like a genuine farewell."),
]

# EP01 패턴카드 목록 (패턴 + 예문 합본, 줄바꿈으로 자연스러운 포즈)
PATTERNS = [
    ("ep01-p001", "narration",
     "이에요, 예요.\n이게 김치예요.\n저는 학생이에요.\n달고나 라떼예요."),
    ("ep01-p002", "narration",
     "주세요.\n물 주세요.\n메뉴 주세요.\n카페라떼 주세요."),
    ("ep01-p003", "narration",
     "뭐예요?\n이거 뭐예요?\n저거 뭐예요?\n이름이 뭐예요?"),
    ("ep01-p004", "narration",
     "있어요. 없어요.\n와이파이 있어요?\n자리 있어요?\n자리 없어요."),
    ("ep01-p005", "narration",
     "얼마예요?\n이거 얼마예요?\n라떼 얼마예요?\n다 해서 얼마예요?"),
]


def pcm_to_wav(pcm_data: bytes, sample_rate: int = 24000) -> bytes:
    """Gemini TTS는 PCM raw audio를 반환 → WAV로 변환"""
    num_channels = 1
    bits_per_sample = 16
    num_frames = len(pcm_data) // (bits_per_sample // 8)

    import io
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(num_channels)
        wf.setsampwidth(bits_per_sample // 8)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm_data)
    return buf.getvalue()


def generate_audio(filename: str, character: str, text: str, extra_style: str = ""):
    voice_name, base_style = VOICES[character]
    style_prompt = f"{base_style} {extra_style}".strip()

    response = client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=text,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice_name,
                    )
                ),
                language_code="ko-KR",
            ),
            system_instruction=style_prompt,
        ),
    )

    # PCM 데이터 추출
    audio_data = response.candidates[0].content.parts[0].inline_data.data

    # WAV로 변환 후 저장
    wav_data = pcm_to_wav(audio_data)
    output_dir = "public/kpatto/audio/ep01"
    os.makedirs(output_dir, exist_ok=True)
    output_path = f"{output_dir}/{filename}.wav"

    with open(output_path, "wb") as f:
        f.write(wav_data)

    print(f"✅ {filename}.wav 생성 완료")
    time.sleep(0.5)  # Rate limit 방지


# 대사 생성
print("=== EP01 대사 음성 생성 ===")
for filename, character, text, style in DIALOGUES:
    generate_audio(filename, character, text, style)

# 패턴카드 생성
print("\n=== EP01 패턴카드 음성 생성 ===")
for filename, character, text in PATTERNS:
    generate_audio(filename, character, text)

print(f"\n🎉 EP01 음성 생성 완료! 총 {len(DIALOGUES) + len(PATTERNS)}개")
